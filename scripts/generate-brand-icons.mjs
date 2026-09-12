import { Buffer } from "node:buffer";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(root, "public", "brand", "glaze-logo.svg");
const roundSvgPath = path.join(root, "public", "brand", "glaze-mark-round.svg");
const appDir = path.join(root, "src", "app");
const publicBrand = path.join(root, "public", "brand");

function extractInnerPaths(svg) {
  const matches = [...svg.matchAll(/<path d="[^"]+" fill="[^"]+"\/>/g)].map((match) => match[0]);
  if (matches.length < 3) throw new Error("Unexpected Glaze logo SVG structure.");
  return {
    teal: matches[1],
    brown: matches[2],
  };
}

function roundLogoSvg(teal, brown) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <clipPath id="glaze-round">
      <circle cx="512" cy="512" r="512"/>
    </clipPath>
  </defs>
  <g clip-path="url(#glaze-round)">
    <circle cx="512" cy="512" r="512" fill="#FBF1E9"/>
    <g transform="translate(512 488) scale(1.2) translate(-512 -488)">
      ${teal}
      ${brown}
    </g>
  </g>
</svg>
`;
}

function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

async function raster(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size, { fit: "cover" }).png({ compressionLevel: 9 }).toBuffer();
}

async function openGraph(roundPng) {
  const width = 1200;
  const height = 630;
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#FBF1E9"/>
      <text x="430" y="292" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="#4A2E1C">Glaze Bakehouse</text>
      <text x="430" y="352" font-family="Georgia, 'Times New Roman', serif" font-size="28" fill="#C0895A">Cakes made for sweet moments in Mysuru</text>
    </svg>
  `;
  const mark = await sharp(roundPng).resize(280, 280).png().toBuffer();
  return sharp(Buffer.from(svg))
    .composite([{ input: mark, left: 96, top: 175 }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const source = await readFile(sourcePath, "utf8");
const { teal, brown } = extractInnerPaths(source);
const roundSvg = roundLogoSvg(teal, brown);
await writeFile(roundSvgPath, roundSvg);

const png16 = await raster(roundSvg, 16);
const png32 = await raster(roundSvg, 32);
const png180 = await raster(roundSvg, 180);
const png192 = await raster(roundSvg, 192);
const png512 = await raster(roundSvg, 512);
const ico = pngToIco(png32, 32);
const og = await openGraph(png512);

await writeFile(path.join(appDir, "favicon.ico"), ico);
await writeFile(path.join(appDir, "icon.png"), png32);
await writeFile(path.join(appDir, "apple-icon.png"), png180);
await writeFile(path.join(appDir, "opengraph-image.png"), og);
await writeFile(path.join(publicBrand, "icon-16.png"), png16);
await writeFile(path.join(publicBrand, "icon-32.png"), png32);
await writeFile(path.join(publicBrand, "icon-192.png"), png192);
await writeFile(path.join(publicBrand, "icon-512.png"), png512);
await writeFile(path.join(publicBrand, "apple-touch-icon.png"), png180);
await writeFile(path.join(publicBrand, "og-image.png"), og);
await writeFile(path.join(root, "public", "brand", "favicon.svg"), roundSvg);

console.log("Generated circular Glaze Bakehouse icons.");
