# Archivify

Use `/archive <url>` to archive articles with archive.today in your discord!

## Build and run

Go to the [discord developer portal](https://discord.com/developers/applications) and create a new app with message sending permissions.
`mv env.sample .env` and add in your app id, bot token, and public key. Optionally change the user agent as well if you wish.

Install dependencies with `npm install` (or preferably `pnpm install`)

Make sure you deploy the slash command with `npm run deploy-commands`

Then you can build and run!
```
npm run build
npm run start
```