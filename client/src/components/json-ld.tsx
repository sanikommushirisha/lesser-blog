// JSON-LD rendered with the page, so it is in the prerendered HTML and always
// describes exactly the content on the page (e.g. the FAQs it shows).
// Route-level structured data (Organization, Service, BreadcrumbList) lives in
// shared/page-meta.ts instead.

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // "<" is escaped so a value can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

/** FAQPage structured data for the questions a page shows. */
export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}
