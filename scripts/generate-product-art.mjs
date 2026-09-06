// Build-time art generator. Produces the on-brand SVG product photography
// stand-ins referenced by lib/products.ts and lib/bundles data. Run with:
//   node scripts/generate-product-art.mjs
// No network access, no binary assets — pure vector composition graded to
// the VELARIO palette (obsidian / forest / gold / amber / parchment).
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(__dirname, "..", "public", "images");

const GOLD = "#C5A059";
const AMBER = "#E6C588";
const OBSIDIAN = "#050505";
const FOREST = "#0E1411";
const PARCHMENT = "#F5F4F0";

function treeMark(x, y, scale, flip = false) {
  const s = scale * (flip ? -1 : 1);
  return `
  <g transform="translate(${x} ${y}) scale(${s} ${scale})" fill="none" stroke="${GOLD}" stroke-width="1.4" stroke-linecap="round">
    <path d="M0 40 L0 -6" />
    <path d="M0 -4 C -14 -8, -18 -22, -8 -34 C -12 -40, -2 -48, 4 -42 C 12 -50, 24 -42, 20 -32 C 30 -28, 26 -12, 12 -8 C 16 -2, 8 4, 0 -4 Z" />
    <circle cx="-6" cy="-24" r="1.6" fill="${GOLD}" />
    <circle cx="8" cy="-30" r="1.6" fill="${GOLD}" />
    <circle cx="2" cy="-14" r="1.6" fill="${GOLD}" />
  </g>`;
}

function background(w, h) {
  return `
  <defs>
    <radialGradient id="bg" cx="50%" cy="34%" r="75%">
      <stop offset="0%" stop-color="${FOREST}" />
      <stop offset="55%" stop-color="${OBSIDIAN}" />
      <stop offset="100%" stop-color="#000000" />
    </radialGradient>
    <radialGradient id="spot" cx="50%" cy="22%" r="35%">
      <stop offset="0%" stop-color="${AMBER}" stop-opacity="0.16" />
      <stop offset="100%" stop-color="${AMBER}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)" />
  <rect width="${w}" height="${h}" fill="url(#spot)" />`;
}

function bottle({ cx, groundY, height, width, name, accent, cropLabel = false, dewdrop = false, uid }) {
  const bodyH = height * 0.62;
  const bodyW = width;
  const bodyY = groundY - bodyH;
  const neckW = bodyW * 0.34;
  const neckH = height * 0.1;
  const neckY = bodyY - neckH;
  const capR = neckW * 0.62;
  const capCy = neckY - capR * 0.55;
  const labelW = bodyW * 0.74;
  const labelH = bodyH * 0.5;
  const labelX = cx - labelW / 2;
  const labelY = bodyY + bodyH * 0.22;
  const gid = `liquid-${uid}`;
  const glassId = `glass-${uid}`;

  return `
  <defs>
    <linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.95" />
      <stop offset="55%" stop-color="#3a2410" />
      <stop offset="100%" stop-color="#160d05" />
    </linearGradient>
    <linearGradient id="${glassId}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${PARCHMENT}" stop-opacity="0.06" />
      <stop offset="12%" stop-color="${PARCHMENT}" stop-opacity="0.22" />
      <stop offset="20%" stop-color="${PARCHMENT}" stop-opacity="0.04" />
      <stop offset="100%" stop-color="${PARCHMENT}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <ellipse cx="${cx}" cy="${groundY + 10}" rx="${bodyW * 0.62}" ry="${bodyW * 0.1}" fill="#000000" opacity="0.55" />

  <!-- cap -->
  <circle cx="${cx}" cy="${capCy}" r="${capR}" fill="#0a0a0a" stroke="${GOLD}" stroke-width="1" />
  <circle cx="${cx - capR * 0.3}" cy="${capCy - capR * 0.35}" r="${capR * 0.28}" fill="${PARCHMENT}" opacity="0.12" />

  <!-- gold band -->
  <rect x="${cx - neckW / 2}" y="${neckY + neckH * 0.55}" width="${neckW}" height="${neckH * 0.3}" fill="${GOLD}" />

  <!-- neck -->
  <rect x="${cx - neckW / 2}" y="${neckY}" width="${neckW}" height="${neckH}" rx="2" fill="url(#${gid})" stroke="#000" stroke-opacity="0.4" />

  <!-- body -->
  <rect x="${cx - bodyW / 2}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${bodyW * 0.08}" fill="url(#${gid})" stroke="#000" stroke-opacity="0.5" />
  <rect x="${cx - bodyW / 2}" y="${bodyY}" width="${bodyW}" height="${bodyH}" rx="${bodyW * 0.08}" fill="url(#${glassId})" />

  ${dewdrop ? `<circle cx="${cx + bodyW * 0.22}" cy="${bodyY + bodyH * 0.16}" r="${bodyW * 0.045}" fill="${PARCHMENT}" opacity="0.5" />` : ""}

  <!-- label -->
  <rect x="${labelX}" y="${labelY}" width="${labelW}" height="${labelH}" fill="#050505" stroke="${GOLD}" stroke-width="1.2" />
  <rect x="${labelX + 4}" y="${labelY + 4}" width="${labelW - 8}" height="${labelH - 8}" fill="none" stroke="${GOLD}" stroke-width="0.5" opacity="0.6" />

  ${!cropLabel ? treeMark(cx - labelW * 0.18, labelY + labelH * 0.24, 0.34) : ""}
  ${!cropLabel ? treeMark(cx + labelW * 0.18, labelY + labelH * 0.24, 0.34, true) : ""}

  <text x="${cx}" y="${labelY + labelH * 0.46}" text-anchor="middle" fill="${GOLD}" font-family="Georgia, 'Times New Roman', serif" font-size="${labelW * 0.135}" letter-spacing="${labelW * 0.012}">VELARIO</text>
  <text x="${cx}" y="${labelY + labelH * 0.63}" text-anchor="middle" fill="${PARCHMENT}" font-family="Georgia, serif" font-size="${labelW * 0.088}" letter-spacing="${labelW * 0.01}">${name.toUpperCase()}</text>
  <text x="${cx}" y="${labelY + labelH * 0.76}" text-anchor="middle" fill="${GOLD}" font-family="Helvetica, Arial, sans-serif" font-size="${labelW * 0.045}" letter-spacing="${labelW * 0.018}">EXTRAIT DE PARFUM</text>
  ${!cropLabel ? `<text x="${cx}" y="${labelY + labelH * 0.92}" text-anchor="middle" fill="${PARCHMENT}" font-family="Helvetica, Arial, sans-serif" font-size="${labelW * 0.05}" opacity="0.85">MADE IN USA</text>` : ""}
  `;
}

function productSVG({ name, accent, uid, variant }) {
  const w = 900,
    h = 1200;
  const cropLabel = variant === "detail";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  ${background(w, h)}
  ${bottle({
    cx: w / 2,
    groundY: cropLabel ? h * 0.78 : h * 0.86,
    height: cropLabel ? h * 0.92 : h * 0.66,
    width: cropLabel ? w * 0.72 : w * 0.46,
    name,
    accent,
    cropLabel,
    dewdrop: variant === "detail",
    uid,
  })}
</svg>`;
  return svg;
}

function bundleSVG({ names, accents, box }) {
  const w = 1200,
    h = 900;
  const n = names.length;
  const spacing = w / (n + 1);
  const bottles = names
    .map((name, i) =>
      bottle({
        cx: spacing * (i + 1),
        groundY: h * 0.84,
        height: h * (n === 2 ? 0.56 : 0.48),
        width: w * (n === 2 ? 0.16 : 0.13),
        name,
        accent: accents[i],
        uid: `bundle-${i}-${name.replace(/\s+/g, "")}`,
      })
    )
    .join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  ${background(w, h)}
  ${box ? `<rect x="${w * 0.06}" y="${h * 0.18}" width="${w * 0.88}" height="${h * 0.68}" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="1.5" />` : ""}
  ${bottles}
</svg>`;
}

const products = [
  { id: "santal-noir", name: "Santal Noir", accent: "#C5A059" },
  { id: "nocturne", name: "Nocturne", accent: "#E6C588" },
  { id: "aether-bloom", name: "Aether Bloom", accent: "#F5F4F0" },
];

mkdirSync(join(PUBLIC, "products"), { recursive: true });
mkdirSync(join(PUBLIC, "bundles"), { recursive: true });

for (const p of products) {
  writeFileSync(
    join(PUBLIC, "products", `${p.id}-01.svg`),
    productSVG({ name: p.name, accent: p.accent, uid: `${p.id}-1`, variant: "hero" })
  );
  writeFileSync(
    join(PUBLIC, "products", `${p.id}-02.svg`),
    productSVG({ name: p.name, accent: p.accent, uid: `${p.id}-2`, variant: "detail" })
  );
}

writeFileSync(
  join(PUBLIC, "bundles", "discovery-set.svg"),
  bundleSVG({ names: products.map((p) => p.name), accents: products.map((p) => p.accent), box: false })
);
writeFileSync(
  join(PUBLIC, "bundles", "archive-duo.svg"),
  bundleSVG({ names: ["Santal Noir", "Nocturne"], accents: ["#C5A059", "#E6C588"], box: false })
);
writeFileSync(
  join(PUBLIC, "bundles", "flagship-edition.svg"),
  bundleSVG({ names: products.map((p) => p.name), accents: products.map((p) => p.accent), box: true })
);

// --- Editorial lookbook imagery (Act III grid insert) ---------------------
function editorialSVG({ motif, accent }) {
  const w = 900,
    h = 1100;
  const cx = w / 2,
    cy = h / 2;
  const motifs = {
    groves: `
      <g fill="none" stroke="${accent}" stroke-width="2" opacity="0.85">
        <path d="M${cx - 180} ${cy + 220} C ${cx - 140} ${cy + 40}, ${cx - 60} ${cy - 120}, ${cx} ${cy - 260}" />
        <path d="M${cx} ${cy - 260} C ${cx + 60} ${cy - 120}, ${cx + 140} ${cy + 40}, ${cx + 180} ${cy + 220}" />
        <circle cx="${cx - 40}" cy="${cy - 40}" r="70" />
        <circle cx="${cx + 60}" cy="${cy + 40}" r="46" />
        <circle cx="${cx - 20}" cy="${cy + 120}" r="30" />
      </g>`,
    fields: `
      <g fill="none" stroke="${accent}" stroke-width="2" opacity="0.85">
        <path d="M${cx} ${cy - 240} C ${cx - 140} ${cy - 160}, ${cx - 150} ${cy}, ${cx} ${cy + 40} C ${cx + 150} ${cy}, ${cx + 140} ${cy - 160}, ${cx} ${cy - 240} Z" />
        <path d="M${cx} ${cy + 40} L ${cx} ${cy + 260}" />
        <path d="M${cx} ${cy + 120} C ${cx - 60} ${cy + 100}, ${cx - 90} ${cy + 180}, ${cx - 70} ${cy + 220}" />
        <path d="M${cx} ${cy + 160} C ${cx + 60} ${cy + 140}, ${cx + 90} ${cy + 220}, ${cx + 70} ${cy + 260}" />
      </g>`,
    roots: `
      <g fill="none" stroke="${accent}" stroke-width="2" opacity="0.85">
        <path d="M${cx} ${cy - 260} L ${cx} ${cy - 60}" />
        <path d="M${cx} ${cy - 60} C ${cx - 90} ${cy}, ${cx - 130} ${cy + 120}, ${cx - 110} ${cy + 260}" />
        <path d="M${cx} ${cy - 60} C ${cx + 40} ${cy + 40}, ${cx + 20} ${cy + 140}, ${cx - 30} ${cy + 240}" />
        <path d="M${cx} ${cy - 60} C ${cx + 100} ${cy - 10}, ${cx + 140} ${cy + 110}, ${cx + 120} ${cy + 250}" />
      </g>`,
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  ${background(w, h)}
  ${motifs[motif]}
</svg>`;
}

mkdirSync(join(PUBLIC, "editorial"), { recursive: true });

writeFileSync(join(PUBLIC, "editorial", "the-groves.svg"), editorialSVG({ motif: "groves", accent: GOLD }));
writeFileSync(join(PUBLIC, "editorial", "the-fields.svg"), editorialSVG({ motif: "fields", accent: AMBER }));
writeFileSync(join(PUBLIC, "editorial", "the-roots.svg"), editorialSVG({ motif: "roots", accent: GOLD }));

// --- About page team monograms ---------------------------------------------
function monogramSVG(initials) {
  const w = 400,
    h = 400;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
  ${background(w, h)}
  <circle cx="${w / 2}" cy="${h / 2}" r="${w * 0.32}" fill="none" stroke="${GOLD}" stroke-width="1.5" />
  <text x="${w / 2}" y="${h / 2 + w * 0.09}" text-anchor="middle" fill="${GOLD}" font-family="Georgia, serif" font-size="${w * 0.22}">${initials}</text>
</svg>`;
}

mkdirSync(join(PUBLIC, "about"), { recursive: true });
for (const initials of ["EV", "MR", "SK"]) {
  writeFileSync(join(PUBLIC, "about", `monogram-${initials.toLowerCase()}.svg`), monogramSVG(initials));
}

console.log("Generated product + bundle + editorial + monogram art in public/images/");
