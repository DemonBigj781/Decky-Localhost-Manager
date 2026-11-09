import React, { useEffect, useState } from "react";
import { definePlugin, callable } from "@decky/api";
import { PanelSection, PanelSectionRow, ButtonItem, TextField, Navigation } from "@decky/ui";

type Bookmark = { name: string; url: string };
const list = callable<[], Bookmark[]>("list_bookmarks");
const save = callable<[name: string, url: string], Bookmark[]>("save_bookmark");
const remove = callable<[url: string], Bookmark[]>("delete_bookmark");
const scan = callable<[], Bookmark[]>("scan_ports");

function Content() {
  const [items, setItems] = useState<Bookmark[]>([]);
  const [found, setFound] = useState<Bookmark[]>([]);
  const [name, setName] = useState("");
  const [port, setPort] = useState("8188");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { list().then(setItems).catch(e => setError(String(e))); }, []);
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setError("");
    try { await action(); } catch(e) { setError(String(e)); } finally { setBusy(false); }
  };
  const open = (url: string) => Navigation.NavigateToExternalWeb(url);
  return <>
    <PanelSection title="Bookmarks">
      {items.map(item => <PanelSectionRow key={item.url}>
        <ButtonItem layout="below" onClick={() => open(item.url)}>{item.name} — {item.url}</ButtonItem>
        <ButtonItem onClick={() => run(async () => setItems(await remove(item.url)))}>Remove</ButtonItem>
      </PanelSectionRow>)}
      <PanelSectionRow><TextField label="Bookmark name" value={name} onChange={e => setName(e.target.value)} /></PanelSectionRow>
      <PanelSectionRow><TextField label="Local port (1–65535)" value={port} onChange={e => setPort(e.target.value)} /></PanelSectionRow>
      <PanelSectionRow><ButtonItem disabled={busy} onClick={() => run(async () => {
        const n = Number(port);
        if (!Number.isInteger(n) || n < 1 || n > 65535) throw new Error("Enter a valid TCP port");
        setItems(await save(name || `Port ${n}`, `http://127.0.0.1:${n}`));
        setName("");
      })}>Save bookmark</ButtonItem></PanelSectionRow>
    </PanelSection>
    <PanelSection title="Discover HTTP services">
      <PanelSectionRow><ButtonItem disabled={busy} onClick={() => run(async () => setFound(await scan()))}>Scan listening ports</ButtonItem></PanelSectionRow>
      {found.map(item => <PanelSectionRow key={item.url}>
        <ButtonItem onClick={() => open(item.url)}>{item.url}</ButtonItem>
        <ButtonItem onClick={() => run(async () => setItems(await save(item.name, item.url)))}>Bookmark</ButtonItem>
      </PanelSectionRow>)}
      {error ? <PanelSectionRow>{error}</PanelSectionRow> : null}
    </PanelSection>
  </>;
}
export default definePlugin(() => ({ name: "Localhost Manager", title: <div>Localhost Manager</div>, content: <Content />, icon: <span>🌐</span> }));
