// "What's your situation?": who the passport is for, its condition, what's
// changing, US status, ZIP (the consulate; California by county where the ZIP
// straddles the line), speed and booklet. Ported from the app.

import { CA_COUNTIES } from "../engine/rules/consulate";
import { CHANGES, LINKS, STATUS, missionFor, needsCounty, tatkalBlock, type Situation } from "../engine/packet";
import { Chips, Question } from "./bits";
import { FIELD_HINT, FIELD_LABEL, fieldClass } from "./styles";

export function SituationPicker({
  situ,
  idPrefix,
  onChange,
}: {
  situ: Situation;
  idPrefix: string;
  onChange: (key: keyof Situation, value: string, checked?: boolean) => void;
}) {
  const block = tatkalBlock(situ);
  const mission = missionFor(situ.zip, situ.county);
  const askCounty = needsCounty(situ.zip);
  const n = (s: string) => `${idPrefix}-${s}`;

  return (
    <div className="flex flex-col gap-6">
      <Question legend="Who is the passport for?">
        <Chips name={n("who")} value={situ.who} options={[["adult", "Me (18 or over)"], ["minor", "My child (under 18)"]]} onToggle={(v) => onChange("who", v)} />
      </Question>
      {situ.who === "minor" && (
        <Question legend="Can both parents sign Annexure D?">
          <Chips name={n("both")} value={situ.both} options={[["yes", "Yes, both sign"], ["no", "No, one parent can’t (adds Annexure C)"]]} onToggle={(v) => onChange("both", v)} />
        </Question>
      )}
      <Question legend="The current passport is…">
        <Chips name={n("cond")} value={situ.cond} options={[["valid", "Valid or expired, I have it"], ["lost", "Lost"], ["damaged", "Damaged"]]} onToggle={(v) => onChange("cond", v)} />
      </Question>
      <Question legend="Is anything changing?" hint="Pick all that apply.">
        <Chips name={n("changes")} multi value={situ.changes} options={CHANGES} onToggle={(v, c) => onChange("changes", v, c)} />
      </Question>
      <Question legend="US status document">
        <Chips name={n("status")} value={situ.status} options={STATUS} onToggle={(v) => onChange("status", v)} />
      </Question>
      <div className="flex flex-col gap-2">
        <span className="text-[15px] font-semibold text-[#1a1a1a]">Where you live</span>
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-36">
            <label htmlFor={n("zip")} className={FIELD_LABEL}>
              Home ZIP code
            </label>
            <input
              id={n("zip")}
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={5}
              placeholder="94110"
              value={situ.zip}
              className={fieldClass()}
              onChange={(e) => onChange("zip", e.target.value.replace(/\D/g, "").slice(0, 5))}
            />
          </div>
          {askCounty && (
            <div className="w-56">
              <label htmlFor={n("county")} className={FIELD_LABEL}>
                California county
              </label>
              <select id={n("county")} value={situ.county ?? ""} className={fieldClass()} onChange={(e) => onChange("county", e.target.value)}>
                <option value="">Pick your county</option>
                {CA_COUNTIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="min-w-[200px] flex-1 pt-7 text-sm" aria-live="polite">
            {mission ? (
              <>
                <b className="block text-[#1a1a1a]">{mission.name}</b>
                <span className="text-[#6b7280]">
                  {askCounty && !situ.county ? "Your ZIP crosses the Los Angeles / San Francisco line: pick your county to be sure. " : "Select this jurisdiction on the government form. "}
                </span>
                <a className="text-[13px] font-semibold text-[#034f46] hover:underline" href={LINKS.jur} target="_blank" rel="noopener noreferrer">
                  Check on VFS
                </a>
              </>
            ) : situ.zip.length === 5 ? (
              <span className="text-red-600">We don’t recognise that ZIP. Check it, or look up your consulate on VFS.</span>
            ) : (
              <span className="text-[#6b7280]">Your consulate depends on where you live, not where you work.</span>
            )}
          </div>
        </div>
      </div>
      <Question legend="Speed and booklet">
        <Chips name={n("speed")} value={situ.speed} options={[["normal", "Normal"], ["tatkal", "Tatkal"]]} isDisabled={(v) => v === "tatkal" && !!block} onToggle={(v) => onChange("speed", v)} />
        {block && <span className={FIELD_HINT}>Tatkal isn’t allowed for {block}.</span>}
        <Chips
          name={n("pages")}
          value={situ.pages}
          options={[["36", "36 pages"], ["60", "60 pages (jumbo)"]]}
          isDisabled={(v) => v === "60" && situ.who === "minor"}
          onToggle={(v) => onChange("pages", v)}
        />
      </Question>
    </div>
  );
}
