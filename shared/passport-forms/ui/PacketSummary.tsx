// The packet a situation adds up to: forms (each linking to its page), the
// documents to gather and what VFS charges. From the engine (Nov 2026 VFS
// checklists), same as the app.

import { FORM_BY_ID, type Packet } from "../engine/packet";
import { VFS_FEES } from "../engine/rules/vfs-fees";
import { PacketHeading, Tag } from "./bits";
import { ChevronRightIcon } from "./icons";
import { PANEL, SECTION_TITLE } from "./styles";

export function PacketSummary({ packet, formHref, compact }: { packet: Packet; formHref?: (id: string) => string; compact?: boolean }) {
  const city = packet.mission?.name.replace("Consulate General of India, ", "").replace("Embassy of India, ", "");
  return (
    <div className={`${PANEL} flex flex-col gap-4 p-5`} aria-live="polite">
      <p className={`${SECTION_TITLE} m-0`}>Your packet: {packet.forms.length + packet.docs.length + packet.extra.length} items</p>
      <div className="flex flex-wrap gap-1.5">
        <Tag>{packet.cl}</Tag>
        {city && <Tag tone="g">{city}</Tag>}
        {packet.tatkal && <Tag tone="w">Tatkal</Tag>}
      </div>

      <PacketHeading>Forms ({packet.forms.length})</PacketHeading>
      <ul className="m-0 list-none overflow-hidden rounded-xl border border-[#e0e8e5] bg-white p-0">
        {packet.forms.map((id) => {
          const f = FORM_BY_ID[id];
          const body = (
            <>
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#1a1a1a]">{f.name}</span>
                <span className="flex items-center gap-1.5">
                  {id === "govform" ? <Tag>Online · answers prepared</Tag> : <Tag tone="g">Filled for you</Tag>}
                  {formHref && <ChevronRightIcon className="h-4 w-4 text-[#6b7280]" />}
                </span>
              </span>
              {!compact && (
                <span className="mt-1 block text-[13px] leading-snug text-[#6b7280]">
                  {f.when} Signs: {f.signs}. Notary: {f.notary}.
                </span>
              )}
            </>
          );
          return (
            <li key={id} className="m-0 border-b border-[#e0e8e5] last:border-b-0">
              {formHref ? (
                <a href={formHref(id)} className="block px-3 py-2.5 no-underline transition-colors hover:bg-[#034f46]/[0.04]">
                  {body}
                </a>
              ) : (
                <div className="px-3 py-2.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <PacketHeading>Documents you gather</PacketHeading>
      <ul className="m-0 list-none overflow-hidden rounded-xl border border-[#e0e8e5] bg-white p-0">
        {[...packet.docs.map((x) => ({ x, extra: false })), ...packet.extra.map((x) => ({ x, extra: true }))].map(({ x, extra }) => (
          <li key={x[0]} className={`m-0 border-b border-[#e0e8e5] px-3 py-2.5 last:border-b-0 ${extra ? "bg-amber-50/60" : ""}`}>
            <span className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#1a1a1a]">{x[0]}</span>
              <Tag tone={/notarized/i.test(x[1]) ? "w" : undefined}>{x[1]}</Tag>
            </span>
            {x[2] && !compact && <span className="mt-1 block text-[13px] leading-snug text-[#6b7280]">{x[2]}</span>}
          </li>
        ))}
      </ul>

      <PacketHeading>Paid to VFS when you register</PacketHeading>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 text-sm tabular-nums text-[#374151]">
        {packet.fees.map(([label, amt]) => (
          <span key={label} className="contents">
            <span>{label}</span>
            <span>${amt}</span>
          </span>
        ))}
        <span className="mt-1 border-t border-[#e0e8e5] pt-1.5 font-bold text-[#1a1a1a]">Total</span>
        <span className="mt-1 border-t border-[#e0e8e5] pt-1.5 font-bold text-[#1a1a1a]">${packet.total}</span>
        <small className="col-span-2 text-[12px] text-[#6b7280]">Card payments add {VFS_FEES.cardSurchargePct}%. From the VFS USA fee table, Nov 2026.</small>
      </div>
    </div>
  );
}
