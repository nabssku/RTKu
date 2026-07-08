const { writeFileSync } = require('fs');
const zlib = require('zlib');

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePNG(w, h, r, g, b) {
  // Build raw image data (filter byte 0 + RGB for each row)
  const rawData = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) {
    rawData[y * (w * 3 + 1)] = 0; // filter: none
    for (let x = 0; x < w; x++) {
      const offset = y * (w * 3 + 1) + 1 + x * 3;
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(w, 0);
  ihdrData.writeUInt32BE(h, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idat = makeChunk('IDAT', deflated);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Generate icons: dark slate blue (#0f172a) matching theme_color in manifest
const icon192 = makePNG(192, 192, 15, 23, 42);
const icon512 = makePNG(512, 512, 15, 23, 42);

writeFileSync('public/icons/icon-192x192.png', icon192);
writeFileSync('public/icons/icon-512x512.png', icon512);
console.log('PWA icons generated: 192x192 and 512x512');
