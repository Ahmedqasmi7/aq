import { config } from "../config.mjs";

const FETCH_TIMEOUT_MS = 15_000;

async function timedFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function parseRssItems(xml, limit = 10) {
  const items = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, limit);
  return items.map((m) => {
    const block = m[0];
    const title = (block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").replace(
      /<!\[CDATA\[|\]\]>/g,
      "",
    ).trim();
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "").trim();
    return `- ${title} (${link})`;
  });
}

export const webTools = [
  {
    definition: {
      type: "function",
      function: {
        name: "web_fetch",
        description: "Fetch a URL and return its readable text content. Requires internet access.",
        parameters: {
          type: "object",
          properties: { url: { type: "string" } },
          required: ["url"],
        },
      },
    },
    async run({ url }) {
      try {
        const res = await timedFetch(url);
        const text = await res.text();
        const clean = stripHtml(text);
        return clean.length > 6000 ? clean.slice(0, 6000) + "... (truncated)" : clean;
      } catch (err) {
        return `Could not fetch ${url}: ${err.message}. (No internet connection, or the site is unreachable.)`;
      }
    },
  },
  {
    definition: {
      type: "function",
      function: {
        name: "web_search",
        description:
          "Search the public web (no API key needed, uses DuckDuckGo) and return top result titles/links. Requires internet access.",
        parameters: {
          type: "object",
          properties: { query: { type: "string" } },
          required: ["query"],
        },
      },
    },
    async run({ query }) {
      try {
        const res = await timedFetch(
          `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
          { headers: { "user-agent": "Mozilla/5.0 (aq-local-agent)" } },
        );
        const html = await res.text();
        const matches = [
          ...html.matchAll(
            /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi,
          ),
        ].slice(0, 8);
        if (matches.length === 0) return "No results found (or DuckDuckGo layout changed).";
        return matches
          .map((m) => `- ${stripHtml(m[2])} (${m[1]})`)
          .join("\n");
      } catch (err) {
        return `Web search unavailable: ${err.message}. (Likely no internet connection right now.)`;
      }
    },
  },
  {
    definition: {
      type: "function",
      function: {
        name: "read_news",
        description:
          "Read the latest headlines from the configured RSS news feeds. Requires internet access.",
        parameters: {
          type: "object",
          properties: {
            feed_url: {
              type: "string",
              description: "Optional specific RSS feed URL. If omitted, reads all configured feeds.",
            },
          },
        },
      },
    },
    async run({ feed_url }) {
      const feeds = feed_url ? [feed_url] : config.newsFeeds;
      const sections = [];
      for (const feed of feeds) {
        try {
          const res = await timedFetch(feed);
          const xml = await res.text();
          const items = parseRssItems(xml, 8);
          sections.push(`## ${feed}\n${items.join("\n") || "(no items found)"}`);
        } catch (err) {
          sections.push(`## ${feed}\nCould not fetch: ${err.message}`);
        }
      }
      return sections.join("\n\n");
    },
  },
];
