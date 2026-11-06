const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('[Media] Cloudinary configured successfully.');
} else {
  console.log('[Media] Cloudinary credentials not detected or placeholder. Using robust local storage fallback (/uploads).');
}

/**
 * Uploads a local file buffer or disk path to Cloudinary or falls back to local URL
 * @param {Object} file - Multer file object
 * @param {String} folder - Folder name in Cloudinary
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadMedia = async (file, folder = 'connectsphere') => {
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
      });
      // Remove temporary disk file after Cloudinary upload
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        // ignore
      }
      return {
        url: result.secure_url,
        publicId: result.public_id,
        bytes: result.bytes,
        format: result.format,
      };
    } catch (uploadError) {
      console.warn('[Media Warning] Cloudinary upload failed, falling back to local file path:', uploadError.message);
    }
  }

  // Local fallback: return local static URL path
  const relativePath = `/uploads/${path.basename(file.path)}`;
  return {
    url: relativePath,
    publicId: path.basename(file.path),
    bytes: file.size,
    format: path.extname(file.originalname).replace('.', ''),
  };
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadMedia,
};
