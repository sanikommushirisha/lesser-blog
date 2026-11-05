// The six free tools: what each page shows before its app loads, its search
// meta, and the utm_campaign its plan buttons carry so sign-ups can be traced
// back to the tool (see planLink in engine.js).

/**
 * False while the tools are under tax review: pages are noindex and stay out
 * of the sitemap. Before setting it true, connect the report email (engine.js,
 * the gate form), drop the review banner and add the pages to the sitemap.
 */
export const TOOLS_LIVE = false

export interface Tool {
  slug: string
  campaign: string
  name: string
  seoTitle: string
  seoDescription: string
  eyebrow: string
  heading: string
  lede: string
  trust: readonly (readonly [string, string])[]
  thisPath: readonly [string, string]
  otherPath: readonly [string, string]
  related: readonly (readonly [string, string])[]
}

const PRIVATE: readonly [string, string] = ['Private by default', 'Runs in your browser']
const BLOG: readonly [string, string] = ['/blog', 'Tax guides for Indians in the US']
const NRI: readonly [string, string] = ['/nris', 'NRI tax filing with Lesser Tax']
const INDIA: readonly [string, string] = ['/services/india-tax-filing', 'File your India tax return from the US']

export const TOOLS: readonly Tool[] = [
  {
    slug: 'tax-estimator',
    campaign: 'tax_estimator',
    name: '2026 Tax Estimator',
    seoTitle: '2026 Tax Refund Estimator for Tech Workers | Lesser Tax',
    seoDescription:
      'Estimate your 2026 tax refund or balance due in minutes. Free tool for US tech workers and NRIs, covering RSUs, investments and state tax, with ways to save.',
    eyebrow: 'Free tool · 2026 tax year',
    heading: 'See your 2026 refund or balance due',
    lede: 'A real estimate for US tech workers and NRIs, covering federal and state tax, RSUs and investments, with ways to pay less.',
    trust: [['Built on the 2026 rules', 'Brackets, deductions and credits'], ['Made for immigrants in tech', 'RSUs, H-1B and money in India'], PRIVATE],
    thisPath: ['Quick estimate', 'W-2 wages, RSUs, investments and simple side income, in about two minutes.'],
    otherPath: ['Business or complex?', 'K-1s, rentals, ISOs or foreign companies need a CPA, not a calculator.'],
    related: [['/#pricing', 'Compare Lesser Tax plans'], NRI, BLOG],
  },
  {
    slug: 'rsu-tax-planner',
    campaign: 'rsu_tax_planner',
    name: 'RSU Tax Planner',
    seoTitle: 'RSU Tax Calculator and Withholding Planner | Lesser Tax',
    seoDescription:
      'Free RSU tax calculator for tech workers. See what your employer is not withholding, vest by vest, and plan ahead to avoid a surprise tax bill and penalty.',
    eyebrow: 'Free tool · 2026 tax year',
    heading: 'Find out what your RSUs really cost you',
    lede: 'See what your employer is not withholding, vest by vest, and how to avoid a surprise bill and penalty.',
    trust: [['Every employer and vest', 'Built for job changes'], ['Stock price what-if', 'See how a rise changes your bill'], PRIVATE],
    thisPath: ['RSU plan', 'Salary, bonus and every vest, in about three minutes.'],
    otherPath: ['ISOs, NSOs or an IPO?', 'Those need AMT and timing work from a CPA.'],
    related: [['/', 'Tax filing for W-2 earners with equity'], ['/#pricing', 'Compare Lesser Tax plans'], BLOG],
  },
  {
    slug: 'tax-residency-report',
    campaign: 'tax_residency_report',
    name: 'US Tax Residency Report',
    seoTitle: 'US Tax Residency Calculator for Visa Holders | Lesser Tax',
    seoDescription:
      'Free US tax residency calculator for visa holders and NRIs. Log your stays or upload your I-94 to get your day count, start date and the forms you file.',
    eyebrow: 'Free tool · any recent tax year',
    heading: 'Find out if you are a US tax resident',
    lede: 'Log your stays or upload your I-94 for your exact day count, start date and which forms you file.',
    trust: [['Stay-by-stay counting', 'Not just a yearly guess'], ['Exempt years handled', 'F, J, M and Q status'], PRIVATE],
    thisPath: ['Residency report', 'Your stays and visa history, in about three minutes.'],
    otherPath: ['Dual-status or moving?', 'Part-year returns and spouse elections need a CPA.'],
    related: [NRI, INDIA, BLOG],
  },
  {
    slug: 'money-from-india-report',
    campaign: 'money_from_india_report',
    name: 'Money from India Report',
    seoTitle: 'Form 3520 Checker for Money from India | Lesser Tax',
    seoDescription:
      'Free Form 3520 checker for gifts, inheritances and loans from India. Log each transfer to see yearly totals, the forms you need and any late penalty so far.',
    eyebrow: 'Free tool · Form 3520',
    heading: 'Do you need to report money from India',
    lede: 'Log each transfer to see your yearly totals, which Form 3520s you need, and any late penalty so far.',
    trust: [['Dollars or rupees', 'Converted for each date'], ['Related donors added up', 'The way the IRS counts them'], PRIVATE],
    thisPath: ['Transfer report', 'Gifts, inheritances and loans, in about three minutes.'],
    otherPath: ['Trusts or companies?', 'Those follow different rules, so talk to a CPA.'],
    related: [NRI, INDIA, BLOG],
  },
  {
    slug: '401k-exit-planner',
    campaign: '401k_exit_planner',
    name: '401(k) Exit Planner',
    seoTitle: '401(k) Options When Moving Back to India | Lesser Tax',
    seoDescription:
      'Free 401(k) planner for NRIs moving back to India. Compare leaving it, rolling it over, cashing out or spreading it out, with the real tax cost of each option.',
    eyebrow: 'Free tool · moving back to India',
    heading: 'What should you do with your 401(k)',
    lede: 'Compare leaving it, rolling it over, cashing out or spreading it out before you move back to India.',
    trust: [['Every option side by side', 'With real tax costs'], ['Two-year split check', 'See if timing saves tax'], PRIVATE],
    thisPath: ['Exit plan', 'Your balance and income, in about two minutes.'],
    otherPath: ['Green card or exit tax?', 'Covered expatriates have different rules.'],
    related: [NRI, INDIA, BLOG],
  },
  {
    slug: 'founder-filing-calendar',
    campaign: 'founder_filing_calendar',
    name: 'Founder Filing Calendar',
    seoTitle: 'Founder Tax Filing Calendar and Deadlines | Lesser Tax',
    seoDescription:
      'Free filing calendar for founders of LLCs and corporations. Enter your company and owners to get your federal forms, real due dates and penalty exposure.',
    eyebrow: 'Free tool · LLCs and corporations',
    heading: 'Never miss a founder tax deadline',
    lede: 'Enter your company and owners to get your federal forms, real due dates and penalty exposure.',
    trust: [['Real dates for your year', 'Weekends adjusted'], ['Built for foreign owners', 'Form 5472 and S corp checks'], PRIVATE],
    thisPath: ['Filing calendar', 'Your company and owners, in about two minutes.'],
    otherPath: ['Raising money?', 'Entity choice needs planning with a CPA.'],
    related: [['/business', 'Business tax filing with Lesser Tax'], ['/business/deadline', 'File before the March 15 deadline'], BLOG],
  },
]
