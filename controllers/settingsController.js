const Settings = require("../models/Settings");
const { cloudinary } = require("../utils/cloudinary");

// @desc    Get global settings
// @route   GET /api/settings
// @access  Public
exports.getSettings = async (req, res, next) => {
  try {
    const settings = await Settings.getSettings();

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res, next) => {
  try {
    const settings = await Settings.updateSettings(req.body);

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload logo
// @route   POST /api/settings/logo
// @access  Private/Admin
exports.uploadLogo = async (req, res, next) => {
  try {
    const { imageData } = req.body;

    // Validate image data
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: "Image data is required",
      });
    }

    // Validate base64 format
    if (!imageData.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Please upload a valid image file.",
      });
    }

    // Validate image type
    const supportedFormats = ["png", "jpg", "jpeg", "webp", "svg", "gif"];
    const imageType = imageData.match(/^data:image\/(\w+);base64,/);
    if (!imageType || !supportedFormats.includes(imageType[1].toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Unsupported image format. Supported formats: ${supportedFormats.join(
          ", "
        )}`,
      });
    }

    let logoUrl;
    const hasCloudinaryConfig =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    // Try Cloudinary first if configured
    if (hasCloudinaryConfig) {
      try {
        const result = await cloudinary.uploader.upload(imageData, {
          folder: "logos",
          resource_type: "image",
          allowed_formats: ["png", "jpg", "jpeg", "webp", "svg"],
          transformation: [
            { width: 500, height: 500, crop: "limit", quality: "auto" },
          ],
        });

        if (result && result.secure_url) {
          logoUrl = result.secure_url;
          console.log("✅ Logo uploaded to Cloudinary:", logoUrl);
        }
      } catch (cloudinaryError) {
        console.error("⚠️  Cloudinary upload failed:", cloudinaryError.message);
        console.log("📁 Falling back to local storage...");
        // Don't return error, fall through to local storage
      }
    }

    // Fallback to local storage if Cloudinary not configured or failed
    if (!logoUrl) {
      const fs = require("fs");
      const path = require("path");

      try {
        // Extract base64 data and file extension
        const matches = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Invalid base64 image format");
        }

        const extension = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, "base64");

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(
          __dirname,
          "..",
          "public",
          "uploads",
          "logos"
        );
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const filename = `logo-${Date.now()}.${extension}`;
        const filePath = path.join(uploadsDir, filename);

        // Save file
        fs.writeFileSync(filePath, buffer);

        // Return full URL path (with backend server URL)
        const backendUrl =
          process.env.BACKEND_URL ||
          `http://localhost:${process.env.PORT || 5000}`;
        logoUrl = `${backendUrl}/uploads/logos/${filename}`;
        console.log("✅ Logo saved locally:", logoUrl);
      } catch (localError) {
        console.error("❌ Local storage failed:", localError);
        return res.status(500).json({
          success: false,
          message:
            "Failed to save image. Please try again or contact administrator.",
        });
      }
    }

    // Validate upload result
    if (!logoUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload logo. Please try again.",
      });
    }

    // Update settings with the new logo URL
    const settings = await Settings.updateSettings({ logo: logoUrl });

    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      settings,
      logoUrl: logoUrl,
    });
  } catch (error) {
    console.error("❌ Logo upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload logo. Please try again.",
    });
  }
};
