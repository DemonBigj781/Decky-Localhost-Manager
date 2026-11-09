# Decky Localhost Manager

Lightweight Decky Loader plugin for Steam Deck Gaming Mode. Bookmark localhost HTTP ports and discover local HTTP services without bundling another browser.

## Features
- Add, rename (save same port), and remove bookmarks
- Discover local HTTP listeners using /proc/net/tcp and /proc/net/tcp6
- Open via Steam's external web navigation
- Persistent JSON bookmarks

## Build and install
Run `npm install` and `npm run build`. Copy the project (including `dist/index.js`, `main.py`, and `plugin.json`) to `~/homebrew/plugins/Decky-Localhost-Manager` and restart Decky Loader.

## Status
**Experimental and not tested on a Steam Deck.** Steam's browser navigation behavior may vary by SteamOS version. HTTP detection may miss HTTPS-only services or servers that reject HEAD requests. Only open local services you trust.
