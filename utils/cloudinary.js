const cloudinary = require("cloudinary").v2;

// Validate Cloudinary configuration
const validateCloudinaryConfig = () => {
  const errors = [];

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    errors.push("CLOUDINARY_CLOUD_NAME is not set");
  }
  if (!process.env.CLOUDINARY_API_KEY) {
    errors.push("CLOUDINARY_API_KEY is not set");
  }
  if (!process.env.CLOUDINARY_API_SECRET) {
    errors.push("CLOUDINARY_API_SECRET is not set");
  }

  if (errors.length > 0) {
    console.error("❌ Cloudinary Configuration Error:");
    errors.forEach((error) => console.error(`   - ${error}`));
    console.error("\nPlease add these variables to your .env file:");
    console.error("CLOUDINARY_CLOUD_NAME=your_cloud_name");
    console.error("CLOUDINARY_API_KEY=your_api_key");
    console.error("CLOUDINARY_API_SECRET=your_api_secret");
    console.error(
      "\nYou can find these values at: https://cloudinary.com/console\n"
    );
    return false;
  }

  return true;
};

// Configure Cloudinary
if (validateCloudinaryConfig()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("✅ Cloudinary configured successfully");
} else {
  console.warn("⚠️  Cloudinary not configured - image uploads will fail");
}

// Get Cloudinary signature for frontend upload
const getSignature = () => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    throw new Error(
      "Cloudinary configuration is missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file."
    );
  }

  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = "drip_drop/heroes";

  // Parameters to sign (must match exactly what client sends)
  const paramsToSign = {
    timestamp: timestamp,
    folder: folder,
  };

  // Generate signature using Cloudinary's signing method
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  console.log("Generated signature for upload:", {
    timestamp,
    folder,
    hasSignature: !!signature,
  });

  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    folder: folder,
  };
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Error deleting image:", error);
  }
};

module.exports = {
  cloudinary,
  getSignature,
  deleteImage,
};
