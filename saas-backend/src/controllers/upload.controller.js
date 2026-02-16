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

const uploadImage = [
  singleImageMiddleware,
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No file provided under field name `image`');

    // Prefer Cloudinary; fallback to local
    try {
      const result = await uploadImageBuffer({
        buffer: req.file.buffer,
        filename: req.file.originalname,
        folder: `stores/${req.adminUser.storeId}`
      });
      return res.json({
        url: result.secure_url,
        provider: 'cloudinary'
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Cloudinary upload failed, falling back to local file storage:', err.message);

      // Sanitize filename: keep extension, replace spaces/special chars to avoid URL issues
      const ext = path.extname(req.file.originalname) || '.png';
      const safeName = `${Date.now()}${ext}`;
      const dest = path.join(localUploadDir, safeName);
      await fs.promises.writeFile(dest, req.file.buffer);

      res.json({
        url: `/uploads/${safeName}`,
        provider: 'local'
      });
    }
  })
];

module.exports = { uploadImage };

