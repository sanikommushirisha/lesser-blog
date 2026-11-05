/**
 * Top navigation menus, shared by the marketing site's navbar
 * (client/src/components/shared-navbar.tsx) and the blog's
 * (blog/src/components/Nav.tsx), so the two cannot drift apart.
 */
export const NAV_GROUPS = [
  {
    label: "Individual",
    items: [
      { name: "Personal Tax Filing", description: "For W-2 earners & equity compensation", href: "/" },
      { name: "NRI Tax Filing", description: "Cross-border U.S.–India tax services", href: "/nris" },
    ],
  },
  {
    label: "Business",
    items: [
      { name: "Business Tax Filing", description: "Form 1120, 1065, 1120-S", href: "/business" },
      { name: "Partnerships", description: "Form 1065 + K-1s for RE investors", href: "/business/partnerships" },
      { name: "Real Estate", description: "$100/entity for rental LLCs", href: "/business/realestate" },
      { name: "March 15 Deadline", description: "File in 24 hrs before the deadline", href: "/business/deadline" },
    ],
  },
  {
    label: "Services",
    items: [
      { name: "Indian Passport Renewal", description: "For Indian NRIs in the United States", href: "/services/passport-renewal" },
      { name: "India Tax Filing", description: "File your Indian ITR from the U.S.", href: "/services/india-tax-filing" },
    ],
  },
  {
    label: "Offers",
    items: [
      { name: "Nextdoor", description: "Exclusive offer for Nextdoor employees", href: "/offers/nextdoor" },
      { name: "Broadcom", description: "Exclusive offer for Broadcom employees", href: "/offers/broadcom" },
      { name: "Coupa", description: "Exclusive offer for Coupa employees", href: "/offers/coupa" },
      { name: "Google", description: "Exclusive offer for Google employees", href: "/offers/google" },
      { name: "Infosys", description: "Exclusive offer for Infosys employees", href: "/offers/infosys" },
      { name: "River Island", description: "Tax services for River Island residents", href: "/offers/riverisland" },
    ],
  },
];
