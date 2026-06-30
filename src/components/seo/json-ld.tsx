type JsonLdObj = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdObj | JsonLdObj[] }) {
  const payload = Array.isArray(data)
    ? { "@context": "https://schema.org", "@graph": data }
    : data;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
