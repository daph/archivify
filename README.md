# Archivify

Use `/archive <url>` to archive articles with archive.today in your discord!

## Build and run

Go to the [discord developer portal](https://discord.com/developers/applications) and create a new app with message sending permissions.
`mv env.sample .env` and add in your app id, bot token, and public key. Optionally change the user agent as well if you wish.

Install dependencies:

```bash
bun install
```

Make sure you deploy the slash command with `bun run deploy-commands`


To run:

```bash
bun run start
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh)
is a fast all-in-one JavaScript runtime.
