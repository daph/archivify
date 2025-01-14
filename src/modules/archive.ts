import 'dotenv/config';
import http2 from "http2";
import * as cheerio from "cheerio";

const ARCHIVE = process.env.ARCHIVE_ENDPOINT ?? "https://archive.today/";
const USER_AGENT = process.env.USER_AGENT ?? "archivify (https://github.com/daph/archivify/)";

async function wait(time: number = 10000): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
}

// We can reuse http2 sessions in some cases for multiple requests
// so keep the request function separate
async function http2Req(url: URL, session: http2.ClientHttp2Session): Promise<{
    headers: http2.IncomingHttpHeaders & http2.IncomingHttpStatusHeader,
    data: string
}> {
    return new Promise((resolve, reject) => {
        let headers: http2.IncomingHttpHeaders & http2.IncomingHttpStatusHeader = {};
        let data: string = "";
        const req = session.request({
            ":path": url.pathname + url.search,
            "host": url.host,
            // add some proper headers
            "pragma": "no-cache",
            "cache-control": "no-cache",
            "priority": "u=0, i",
            "accept": "text/html",
            "referer": url.pathname + "?url=" + url.href,
            "accept-language": "en-US",
            "user-agent": USER_AGENT
        });

        req.setEncoding("utf8");
        req.on("error", err => reject(err));
        req.on("response", h => headers = h);
        req.on("data", chunk => {
            data += chunk;
        });
        req.end();
        req.on("end", () => {
            resolve({ headers, data });
        });
    });
}

// run a simple one session http2 get
async function http2Get(url: URL): Promise<{
    headers: http2.IncomingHttpHeaders & http2.IncomingHttpStatusHeader,
    data: string
}> {
    return new Promise((resolve, reject) => {
        const session = http2.connect(url);
        session.on("error", err => reject(err));
        http2Req(url, session).then(x => {
            session.close();
            resolve(x);
        }).catch(x => {
            session.close();
            reject(x);
        });
    });
}

// Submit url to be archived and wait for it to finish
async function archiveWipWait(url: URL): Promise<string> {
    const session = http2.connect(url);
    session.on("error", err => { throw err });
    const { headers } = await http2Req(url, session);
    if (headers["refresh"] === undefined) {
        throw new Error(`No refresh header found when archiving ${url.href}\nHeaders: ${headers}`);
    }

    const refresh = headers["refresh"] as string;
    let refreshSecs = Number(refresh.split(";url=")[0]);
    let wipUrl = new URL(refresh.split(";url=")[1]);

    while (true) {
        await wait(refreshSecs * 1000); // obey how long archive wants us to wait for a refresh
        const { headers } = await http2Req(wipUrl, session);
        const { ":status": status, refresh, location, link } = headers;
        if (status === 200 && refresh !== undefined) { // working on it
            refreshSecs = Number(refresh);
        } else if (status === 302 && location !== undefined) { // Archive done. Load next to get the link
            wipUrl = new URL(location);
            refreshSecs = 0;
        } else if (status === 200 && link !== undefined) { // link is returned in a header pull it and send it
            session.close();
            const matches = String(link).match(/(https?:\/\/archive\.[a-z]+\/[0-9]+\/.+)(>)/)
            if (matches && matches[1]) {
                const url = new URL(matches[1]);
                url.protocol = "https:" // sometimes the link is plain for some reason
                return url.href;
            }
            throw new Error(`Could not find link for ${url.href} in ${link}\nHeaders: ${headers}`);
        } else if (!headers) {
            // sometimes there's no response but we must retry
            // need to account for this so the last else can fail
            continue;
        } else {
            throw new Error(`Failed to archive the page ${url.href}\nHeaders: ${headers}`);
        }
    }
}

async function makeArchive(url: URL): Promise<string> {
    let archiveUrl = new URL(ARCHIVE);
    let headers: http2.IncomingHttpHeaders & http2.IncomingHttpStatusHeader = {};
    let data: string = "";
    let status = 200;
    // archive.today tends to redirect to alternative domains
    // follow the redirects until we're at the domain we should use
    do {
        ({ headers, data } = await http2Get(archiveUrl));
        status = headers[":status"]!;
        if ((status === 301 || status === 302) && headers.location) {
            archiveUrl = new URL(headers.location);
        }
    } while (status === 301 || status === 302)

    // find the unique submitid token we need to use when requesting an archive
    const $ = cheerio.load(data);
    const submitId = $("input[name=submitid]").val();

    archiveUrl.pathname = "/submit/"
    archiveUrl.search = `?submitid=${submitId}&url=${url.origin}${url.pathname}`
    return await archiveWipWait(archiveUrl);
}

export async function archive(url: URL): Promise<string> {
    const archiveUrl = new URL(ARCHIVE);
    archiveUrl.pathname = "/newest/" + url.origin + url.pathname
    const { headers } = await http2Get(archiveUrl)
    const { ":status": status } = headers;
    if (status === 302 && headers.location) { // already archived so return archived url
        return headers.location;
    } else if (status === 404) { // not yet archived, so archive it
        return await makeArchive(url);
    }
    return `${status}`;
}