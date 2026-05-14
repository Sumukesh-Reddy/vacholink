const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Uploads a file to Cloudinary and deletes the local temporary file
 * @param {string} filePath - Path to the local file
 * @param {string} folder - Cloudinary folder name
 * @param {string} resourceType - Cloudinary resource type ('image', 'video', 'raw', or 'auto')
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = async (filePath, folder = 'vacholink', resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: resourceType
    });

    // Delete local file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result;
  } catch (error) {
    // Delete local file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Cloudinary resource type
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
};
