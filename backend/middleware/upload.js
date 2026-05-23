const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Temporary directory for uploads
  },
  filename: function (req, file, cb) {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

// Memory storage for direct Cloudinary uploads
const memoryStorage = multer.memoryStorage();


// File filters
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const attachmentFilter = (req, file, cb) => {
  const allowedMimetypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'video/mp4', 'video/webm', 'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedMimetypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported! Only images, videos, PDFs, and documents are allowed.'), false);
  }
};

// Multer instances
const uploadProfile = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadAttachment = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: attachmentFilter
});

const uploadToMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: attachmentFilter
});

module.exports = {
  uploadProfile,
  uploadAttachment,
  uploadToMemory
};
