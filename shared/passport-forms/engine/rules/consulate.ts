// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport/consulate.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/**
 * ZIP code -> Indian mission (embassy / consulate) for passport services in
 * the USA, per the jurisdiction in force since 15 Jul 2025 (CGI Chicago
 * jurisdiction notice, Sep 2025).
 *
 * The ZIP is mapped to a state by its first 3 digits. California is split
 * between Los Angeles (10 southern counties) and San Francisco by COUNTY, which
 * a ZIP prefix can't tell, so a California applicant picks their county and
 * the mission follows from it. Until they do, the ZIP gives a best guess and
 * the result is flagged `needsCounty`.
 */

export type MissionId = "dc" | "atl" | "bos" | "chi" | "hou" | "la" | "ny" | "sf" | "sea";

export const MISSIONS: Record<MissionId, string> = {
  dc: "Embassy of India, Washington DC",
  atl: "Consulate General of India, Atlanta",
  bos: "Consulate General of India, Boston",
  chi: "Consulate General of India, Chicago",
  hou: "Consulate General of India, Houston",
  la: "Consulate General of India, Los Angeles",
  ny: "Consulate General of India, New York",
  sf: "Consulate General of India, San Francisco",
  sea: "Consulate General of India, Seattle",
};

const STATE_MISSION: Record<string, MissionId> = {
  DC: "dc", KY: "dc", MD: "dc", NC: "dc", VA: "dc", WV: "dc",
  AL: "atl", FL: "atl", GA: "atl", MS: "atl", SC: "atl", TN: "atl", PR: "atl", VI: "atl",
  ME: "bos", MA: "bos", NH: "bos", RI: "bos", VT: "bos",
  IL: "chi", IN: "chi", IA: "chi", MI: "chi", MN: "chi", MO: "chi", WI: "chi",
  AR: "hou", KS: "hou", LA: "hou", OK: "hou", TX: "hou",
  AZ: "la", NV: "la", NM: "la",
  CT: "ny", DE: "ny", NJ: "ny", NY: "ny", OH: "ny", PA: "ny",
  CO: "sf", HI: "sf", UT: "sf", WY: "sf", GU: "sf",
  AK: "sea", ID: "sea", MT: "sea", NE: "sea", ND: "sea", SD: "sea", OR: "sea", WA: "sea",
};

/** [first ZIP3, last ZIP3, state], USPS prefix allocation. */
const ZIP3: [number, number, string][] = [
  [5, 5, "NY"], [6, 9, "PR"], [8, 8, "VI"],
  [10, 27, "MA"], [28, 29, "RI"], [30, 38, "NH"], [39, 49, "ME"], [50, 59, "VT"],
  [60, 69, "CT"], [70, 89, "NJ"], [100, 149, "NY"], [150, 196, "PA"], [197, 199, "DE"],
  [200, 200, "DC"], [201, 201, "VA"], [202, 205, "DC"], [206, 219, "MD"], [220, 246, "VA"],
  [247, 268, "WV"], [270, 289, "NC"], [290, 299, "SC"], [300, 319, "GA"], [320, 349, "FL"],
  [350, 369, "AL"], [370, 385, "TN"], [386, 397, "MS"], [398, 399, "GA"], [400, 427, "KY"],
  [430, 459, "OH"], [460, 479, "IN"], [480, 499, "MI"], [500, 528, "IA"], [530, 549, "WI"],
  [550, 567, "MN"], [569, 569, "DC"], [570, 577, "SD"], [580, 588, "ND"], [590, 599, "MT"],
  [600, 629, "IL"], [630, 658, "MO"], [660, 679, "KS"], [680, 693, "NE"], [700, 714, "LA"],
  [716, 729, "AR"], [730, 749, "OK"], [750, 799, "TX"], [800, 816, "CO"], [820, 831, "WY"],
  [832, 838, "ID"], [840, 847, "UT"], [850, 865, "AZ"], [870, 884, "NM"], [885, 885, "TX"],
  [889, 898, "NV"], [900, 961, "CA"], [967, 968, "HI"], [969, 969, "GU"], [970, 979, "OR"],
  [980, 994, "WA"], [995, 999, "AK"],
];

/** All 58 California counties, for the county picker. */
export const CA_COUNTIES = [
  "Alameda", "Alpine", "Amador", "Butte", "Calaveras", "Colusa", "Contra Costa", "Del Norte",
  "El Dorado", "Fresno", "Glenn", "Humboldt", "Imperial", "Inyo", "Kern", "Kings", "Lake",
  "Lassen", "Los Angeles", "Madera", "Marin", "Mariposa", "Mendocino", "Merced", "Modoc", "Mono",
  "Monterey", "Napa", "Nevada", "Orange", "Placer", "Plumas", "Riverside", "Sacramento",
  "San Benito", "San Bernardino", "San Diego", "San Francisco", "San Joaquin", "San Luis Obispo",
  "San Mateo", "Santa Barbara", "Santa Clara", "Santa Cruz", "Shasta", "Sierra", "Siskiyou",
  "Solano", "Sonoma", "Stanislaus", "Sutter", "Tehama", "Trinity", "Tulare", "Tuolumne",
  "Ventura", "Yolo", "Yuba",
] as const;

/** The 10 southern counties under CGI Los Angeles; the other 48 are San Francisco's. */
const LA_COUNTIES = new Set([
  "Imperial", "Kern", "Los Angeles", "Orange", "Riverside", "San Bernardino", "San Diego",
  "San Luis Obispo", "Santa Barbara", "Ventura",
]);

export const VFS_JURISDICTION_URL = "https://services.vfsglobal.com/usa/en/ind/attend-centre";

export interface MissionResult {
  mission: MissionId;
  name: string;
  state: string;
  /** California without a county picked yet: `mission` is only a ZIP-based guess. */
  needsCounty: boolean;
}

export function isUsZip(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}

export function stateForZip(zip: string): string | null {
  if (!isUsZip(zip)) return null;
  const z3 = Number(zip.trim().slice(0, 3));
  // Later, narrower ranges (VI inside PR's block) win.
  let hit: string | null = null;
  for (const [lo, hi, st] of ZIP3) if (z3 >= lo && z3 <= hi) hit = st;
  return hit;
}

export function missionForZip(zip: string, county?: string | null): MissionResult | null {
  const state = stateForZip(zip);
  if (!state) return null;
  if (state === "CA") {
    const known = county && (CA_COUNTIES as readonly string[]).includes(county);
    // Without a county, ZIP3 900-935 roughly covers the 10 southern counties.
    const mission: MissionId = known ? (LA_COUNTIES.has(county) ? "la" : "sf") : Number(zip.slice(0, 3)) <= 935 ? "la" : "sf";
    return { mission, name: MISSIONS[mission], state, needsCounty: !known };
  }
  const mission = STATE_MISSION[state];
  return mission ? { mission, name: MISSIONS[mission], state, needsCounty: false } : null;
}
