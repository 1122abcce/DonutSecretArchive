# DonutSecretArchive

A small, dependency-free modpack archive website. It automatically indexes supported files placed in `modpacks/`, shows file size, modified date, and SHA-256, and offers search and format filters.

## Run locally

Install Node.js, open a terminal in this folder, and run:

```sh
node server.js
```

Then visit <http://localhost:4173>. Add `.mrpack`, `.zip`, `.jar`, `.7z`, `.rar`, `.tar`, or `.gz` files to `modpacks/` and refresh the page. The server computes SHA-256 hashes when the inventory is requested.

## VirusTotal

The VirusTotal buttons open its upload page. The site does not submit files or claim that files have been scanned or verified. Upload each file yourself and review the current report before using it.

## Hosting

Run `node server.js` on a machine that can serve the folder and make port 4173 reachable through your host or reverse proxy. Keep `modpacks/` alongside `server.js` so the inventory and downloads work.
