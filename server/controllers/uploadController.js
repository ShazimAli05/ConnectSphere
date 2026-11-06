const { uploadMedia } = require('../config/cloudinary');

// @desc    Upload file or image (Cloudinary or local static fallback)
// @route   POST /api/uploads
// @access  Private
const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const result = await uploadMedia(req.file, 'connectsphere');

    // Categorize file type
    let fileCategory = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      fileCategory = 'image';
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileCategory = 'audio';
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully.',
      file: {
        url: result.url,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        category: fileCategory,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFile,
};
