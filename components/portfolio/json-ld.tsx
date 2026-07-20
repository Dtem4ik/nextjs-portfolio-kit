import type { Thing, WithContext } from "schema-dts";

/**
 * Renders a JSON-LD structured-data block. `<` is escaped to `<` to prevent
 * the serialized JSON from prematurely closing the script tag.
 */
export function JsonLd({ schema }: { schema: WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}
