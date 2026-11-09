import json
import os
import socket
from urllib.parse import urlsplit

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data", "bookmarks.json")

def _load():
    try:
        with open(DATA, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, ValueError, OSError):
        return []

def _save(items):
    os.makedirs(os.path.dirname(DATA), exist_ok=True)
    tmp = DATA + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(items, f, indent=2)
    os.replace(tmp, DATA)

def _validate(url):
    p = urlsplit(url)
    if p.scheme not in ("http", "https") or p.hostname not in ("localhost", "127.0.0.1", "::1"):
        raise ValueError("Only local HTTP(S) URLs are supported")
    if p.username or p.password or not (1 <= (p.port or (443 if p.scheme == "https" else 80)) <= 65535):
        raise ValueError("Invalid port or credentials")
    return url

class Plugin:
    async def _main(self):
        pass

    async def list_bookmarks(self):
        return _load()

    async def save_bookmark(self, name: str, url: str):
        url = _validate(url.strip())
        name = name.strip()[:80] or url
        items = _load()
        if not any(x["url"] == url for x in items):
            items.append({"name": name, "url": url})
        else:
            for x in items:
                if x["url"] == url:
                    x["name"] = name
        _save(items)
        return items

    async def delete_bookmark(self, url: str):
        items = [x for x in _load() if x["url"] != url]
        _save(items)
        return items

    async def scan_ports(self):
        # Read the kernel TCP listen table; no privileged scan and no network sweep.
        ports = set()
        for path in ("/proc/net/tcp", "/proc/net/tcp6"):
            try:
                with open(path, encoding="ascii") as f:
                    next(f)
                    for line in f:
                        cols = line.split()
                        if len(cols) < 4 or cols[3] != "0A":
                            continue
                        addr, port = cols[1].split(":")
                        # Include loopback or wildcard listeners only.
                        if addr in ("0100007F", "00000000", "00000000000000000000000001000000", "00000000000000000000000000000000"):
                            ports.add(int(port, 16))
            except OSError:
                continue
        # Test HTTP endpoints locally; non-HTTP services are not shown.
        found = []
        for port in sorted(ports)[:256]:
            try:
                with socket.create_connection(("127.0.0.1", port), timeout=0.15) as sock:
                    sock.settimeout(0.2)
                    sock.sendall(b"HEAD / HTTP/1.0\\r\\nHost: localhost\\r\\n\\r\\n".replace(b"\\r",b"\r").replace(b"\\n",b"\n"))
                    data = sock.recv(32)
                    if data.startswith(b"HTTP/"):
                        found.append({"name": f"Port {port}", "url": f"http://127.0.0.1:{port}"})
            except (OSError, TimeoutError):
                continue
        return found
