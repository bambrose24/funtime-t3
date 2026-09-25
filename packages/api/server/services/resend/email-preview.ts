import sanitizeHtml from "sanitize-html";

// Email previews are read-only. Drop tracking images, link destinations, forms,
// scripts, stylesheets and CSS so inspection does not generate engagement events.
export const safeEmailPreview = (html: string | null, text: string | null) => {
  if (html)
    return sanitizeHtml(html, {
      allowedTags: [
        "div",
        "p",
        "span",
        "br",
        "hr",
        "h1",
        "h2",
        "h3",
        "h4",
        "table",
        "thead",
        "tbody",
        "tr",
        "td",
        "th",
        "ul",
        "ol",
        "li",
        "strong",
        "em",
        "b",
        "i",
        "blockquote",
        "a",
        "pre",
      ],
      allowedAttributes: {
        td: ["colspan", "rowspan"],
        th: ["colspan", "rowspan"],
      },
    });
  if (text)
    return `<pre>${text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</pre>`;
  return null;
};
