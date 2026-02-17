const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { asyncHandler } = require('../utils/asyncHandler');
const { uploadImageBuffer } = require('../services/cloudinary.service');
const { HttpError } = require('../utils/httpError');

const localUploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(localUploadDir)) fs.mkdirSync(localUploadDir, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({ storage });

const singleImageMiddleware = upload.single('image');

const CLOUDINARY_HELP =
  'Configure Cloudinary on Render: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET';

/** Shared: upload buffer to Cloudinary or local, return URL */
async function uploadBufferToUrl({ buffer, originalname, storeId }) {
  try {
    const result = await uploadImageBuffer({
      buffer,
      filename: originalname,
      folder: `stores/${storeId || 'default'}`
    });
    return result.secure_url;
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      console.error('[Upload] Cloudinary failed:', err.message);
      throw new HttpError(
        503,
        `Image upload failed. ${CLOUDINARY_HELP}`
      );
    }
    // eslint-disable-next-line no-console
    console.warn('Cloudinary upload failed, falling back to local:', err.message);
    const ext = path.extname(originalname) || '.png';
    const safeName = `${Date.now()}${ext}`;
    const dest = path.join(localUploadDir, safeName);
    await fs.promises.writeFile(dest, buffer);
    return `/uploads/${safeName}`;
  }
}

const uploadImage = [
  singleImageMiddleware,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No file provided under field name `image`');
    const url = await uploadBufferToUrl({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      storeId: req.adminUser.storeId
    });
    res.json({
      url,
      provider: url.startsWith('http') ? 'cloudinary' : 'local'
    });
  })
];

module.exports = { uploadImage, uploadBufferToUrl };

