// Copied from lesser@d62e7418 plus uncommitted changes (lib/passport/vfs-fees.ts) by scripts/sync-passport-forms.sh.
// Do not edit here: change it in the lesser repo and re-run the script.
/**
 * Every VFS USA fee for an Indian passport re-issue, in one place (LD-75).
 * The paid assistant (lib/passport/assistant-plan.ts, checklist.ts) and the
 * free forms (lib/passport-forms/packet.ts) both read these numbers, so a fee
 * change is one edit here.
 *
 * Source: the VFS USA fee table, checked 8 Oct 2026 (adult) and Nov 2026
 * (lost, damaged, minor). Totals VFS shows at registration include the ICWF
 * and VFS service fee: adult $146 (36 pages) / $196 (60 pages), lost or
 * damaged $271 / $321, minor $111; Tatkal adds $125. Paying by card adds
 * 3.75%; personal checks are refused.
 */
export const VFS_FEES = {
  /** Passport fee, adult 10-year re-issue, by booklet. */
  adult: { booklet36: 125, jumbo: 175 },
  /** Passport fee in lieu of a lost or damaged passport, by booklet. */
  lostOrDamaged: { booklet36: 250, jumbo: 300 },
  /** Passport fee for a minor (under 15, or 15 to 17 choosing a passport valid until 18). */
  minor: { normal: 90, lostOrDamaged: 215 },
  /** Indian Community Welfare Fund, on every application. */
  icwf: 2,
  /** VFS service fee, on every application. */
  vfs: 19,
  tatkal: 125,
  cardSurchargePct: 3.75,
} as const;
