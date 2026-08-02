const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/instagram');

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
};

// Meta's Graph API fetches the image from a public HTTPS URL - it cannot
// resolve data: URLs, so any data URL (primary photo or custom graphic) has
// to be written out as a real file under /uploads first.
function saveDataUrlAsPublicFile(dataUrl, filenamePrefix) {
  const match = /^data:(image\/[a-zA-Z+]+);base64,(.+)$/.exec(dataUrl || '');
  if (!match) {
    throw new Error('Image must be a base64 data URL');
  }

  const [, mimeType, base64Data] = match;
  const ext = MIME_EXTENSIONS[mimeType.toLowerCase()] || 'jpg';

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const filename = `${filenamePrefix}-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), Buffer.from(base64Data, 'base64'));

  return `/uploads/instagram/${filename}`;
}

function resolvePublicBaseUrl(req) {
  const configured = process.env.PUBLIC_BASE_URL;
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return `${req.protocol}://${req.get('host')}`;
}

module.exports = { saveDataUrlAsPublicFile, resolvePublicBaseUrl };
