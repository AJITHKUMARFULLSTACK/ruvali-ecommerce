const { cloudinary, configureCloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const { HttpError } = require('../utils/httpError');

// streamifier is not in deps; implement tiny stream wrapper without extra dep:
function bufferToStream(buffer) {
  const { Readable } = require('stream');
  const s = new Readable();
  s.push(buffer);
  s.push(null);
  return s;
}

configureCloudinary();

async function uploadImageBuffer({ buffer, filename, folder }) {
  if (!isCloudinaryConfigured()) {
    throw new HttpError(500, 'Cloudinary is not configured. Set CLOUDINARY_* env vars.');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'ruvali',
        public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    bufferToStream(buffer).pipe(uploadStream);
  });
}

module.exports = { uploadImageBuffer };

