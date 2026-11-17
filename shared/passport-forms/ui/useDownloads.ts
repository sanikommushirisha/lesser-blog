// Builds and saves the PDFs in the browser, nothing sent anywhere. The builder
// and pdf-lib load on the first download, so pages and blog posts that only
// show the forms stay light. Names: <form-slug>-<surname>.pdf (LD-74).

import { useState } from "react";
import type { Details, Situation } from "../engine/packet";
import { PDF_BASE } from "../config";

export type DownloadStatus = { ok: boolean; msg: string };

function saveBlob(bytes: Uint8Array, filename: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function useDownloads(situ: Situation, d: Details, onDownloaded?: (key: string) => void) {
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, DownloadStatus>>({});

  const download = async (key: string) => {
    setBusy(key);
    setStatus((s) => ({ ...s, [key]: { ok: true, msg: "Preparing the PDF…" } }));
    try {
      const b = await import("../engine/build");
      const load = b.officialPdfLoader(PDF_BASE);
      const bytes = key === "all" ? await b.buildPacketPdf(situ, d, load) : await b.buildFreeForm(key, situ, d, load);
      saveBlob(bytes, key === "all" ? b.packetFileName(d) : b.formFileName(key, d));
      setStatus((s) => ({ ...s, [key]: { ok: true, msg: "Saved. Check your downloads." } }));
      onDownloaded?.(key);
    } catch {
      setStatus((s) => ({ ...s, [key]: { ok: false, msg: "We couldn’t prepare this PDF. Try again." } }));
    } finally {
      setBusy(null);
    }
  };

  return { busy, status, download };
}
