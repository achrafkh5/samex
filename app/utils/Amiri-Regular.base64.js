/**
 * Amiri Regular Font - Base64 Encoded
 * 
 * This file contains the Amiri font in base64 format for embedding in PDFs.
 * Amiri is a classical Arabic typeface that provides excellent glyph shaping.
 * 
 * To generate this file from a TTF:
 * 
 * Node.js:
 *   const fs = require('fs');
 *   const font = fs.readFileSync('Amiri-Regular.ttf');
 *   const base64 = font.toString('base64');
 *   fs.writeFileSync('Amiri-Regular.base64.js', `export default '${base64}';`);
 * 
 * Or use online converter: https://base64.guru/converter/encode/file
 * 
 * Download Amiri from: https://github.com/aliftype/amiri/releases
 */

// TODO: Replace this placeholder with actual base64 font data
// For now, this will trigger runtime loading as fallback
const amiriFont = null;
export default amiriFont;

/**
 * INSTRUCTIONS TO ADD REAL FONT:
 * 
 * 1. Download Amiri-Regular.ttf from:
 *    https://github.com/aliftype/amiri/releases/latest
 * 
 * 2. Convert to base64:
 *    node -e "console.log('export default \\'' + require('fs').readFileSync('Amiri-Regular.ttf', 'base64') + '\\';')" > Amiri-Regular.base64.js
 * 
 * 3. The file will be ~400KB - this is normal for a full Arabic font
 * 
 * 4. If the file is too large for your bundle, you can:
 *    - Use a CDN URL instead (but requires internet)
 *    - Subset the font to only include characters you need
 *    - Use a lighter Arabic font like Cairo
 */
