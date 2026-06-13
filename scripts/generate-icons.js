const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const sizes = [
  { file: '32x32.png', size: 32 },
  { file: '128x128.png', size: 128 },
  { file: '128x128@2x.png', size: 256 },
];

const iconsDir = path.join(__dirname, '..', 'src-tauri', 'icons');

for (const { file, size } of sizes) {
  const buf = createMinimalPNG(size, size, [37, 99, 235]);
  fs.writeFileSync(path.join(iconsDir, file), buf);
  console.log(`Created ${file}`);
}

// Create .ico (32x32 PNG wrapped in ICO format)
const pngData = fs.readFileSync(path.join(iconsDir, '32x32.png'));
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
const dirEntry = Buffer.alloc(16);
dirEntry.writeUInt8(32, 0);
dirEntry.writeUInt8(32, 1);
dirEntry.writeUInt8(0, 2);
dirEntry.writeUInt8(0, 3);
dirEntry.writeUInt16LE(1, 4);
dirEntry.writeUInt16LE(32, 6);
dirEntry.writeUInt32LE(pngData.length, 8);
dirEntry.writeUInt32LE(22, 12);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), Buffer.concat([icoHeader, dirEntry, pngData]));
console.log('Created icon.ico');

// Create .icns placeholder (Tauri v2 also accepts PNGs here)
fs.writeFileSync(path.join(iconsDir, 'icon.icns'), pngData);
console.log('Created icon.icns (placeholder)');

function createMinimalPNG(width, height, color) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(2, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = createChunk('IHDR', ihdrData);

  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0);
    for (let x = 0; x < width; x++) {
      rawData.push(color[0], color[1], color[2]);
    }
  }
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
