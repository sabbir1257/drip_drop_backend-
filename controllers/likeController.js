const ProductLike = require("../models/ProductLike");
const Product = require("../models/Product");

// Generate guest identifier from IP and user agent
const generateGuestId = (ipAddress, userAgent) => {
  const crypto = require("crypto");
  return crypto
    .createHash("sha256")
    .update(ipAddress + userAgent)
    .digest("hex")
    .substring(0, 32);
};

// @desc    Add/increment like for a product
// @route   POST /api/likes/:productId
// @access  Public
exports.likeProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get user identifier
    const identifier = {
      userId: req.user ? req.user.id : null,
      guestId: req.user
        ? null
        : generateGuestId(
            req.ip || req.connection.remoteAddress,
            req.headers["user-agent"]
          ),
    };

    // Check if can like
    const canLikeCheck = await ProductLike.canLike(productId, identifier);
    if (!canLikeCheck.canLike) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${canLikeCheck.maxLikes} likes reached for this product`,
        currentCount: canLikeCheck.currentCount,
        maxLikes: canLikeCheck.maxLikes,
      });
    }

    // Add like
    const like = await ProductLike.addLike(
      productId,
      identifier,
      req.ip || req.connection.remoteAddress,
      req.headers["user-agent"]
    );

    res.status(200).json({
      success: true,
      message: "Product liked successfully",
      likeCount: like.likeCount,
      canLikeMore: like.likeCount < 5,
    });
  } catch (error) {
    console.error("Like product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to like product",
      error: error.message,
    });
  }
};

// @desc    Get like count for a product
// @route   GET /api/likes/:productId
// @access  Public
exports.getLikeCount = async (req, res) => {
  try {
    const { productId } = req.params;

    // Get user identifier
    const identifier = {
      userId: req.user ? req.user.id : null,
      guestId: req.user
        ? null
        : generateGuestId(
            req.ip || req.connection.remoteAddress,
            req.headers["user-agent"]
          ),
    };

    // Get total likes for this user/guest
    const likeCount = await ProductLike.getTotalLikes(productId, identifier);

    // Check if can like more
    const canLikeCheck = await ProductLike.canLike(productId, identifier);

    res.status(200).json({
      success: true,
      likeCount,
      canLikeMore: canLikeCheck.canLike,
      maxLikes: 5,
    });
  } catch (error) {
    console.error("Get like count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get like count",
      error: error.message,
    });
  }
};

// @desc    Check if combo offer applies
// @route   POST /api/likes/check-combo
// @access  Public
exports.checkComboOffer = async (req, res) => {
  try {
    console.log("=== checkComboOffer called ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId) {
      console.log("Error: Product ID is missing");
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Validate ObjectId format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("Error: Invalid ObjectId format:", productId);
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    console.log("Looking for product with ID:", productId);

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log("Error: Product not found");
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log("Product found:", product.name);

    // Default settings if Settings model fails
    let settings = {
      comboOfferEnabled: true,
      comboOfferMinQuantity: 2,
      comboOfferMinLikes: 2,
      comboOfferApplyToAll: true,
      comboOfferProductIds: [],
    };

    try {
      const Settings = require("../models/Settings");
      const fetchedSettings = await Settings.getSettings();
      if (fetchedSettings) {
        settings = fetchedSettings;
      }
    } catch (settingsError) {
      console.warn(
        "Failed to fetch settings, using defaults:",
        settingsError.message
      );
    }

    // Check if combo offer is enabled
    if (!settings.comboOfferEnabled) {
      return res.status(200).json({
        success: true,
        comboApplied: false,
        reason: "Combo offer is currently disabled",
      });
    }

    // Check if product is eligible (if not applying to all)
    if (!settings.comboOfferApplyToAll) {
      const isEligible = settings.comboOfferProductIds.some(
        (id) => id.toString() === productId
      );
      if (!isEligible) {
        return res.status(200).json({
          success: true,
          comboApplied: false,
          reason: "Product not eligible for combo offer",
        });
      }
    }

    // Get user identifier
    const identifier = {
      userId: req.user ? req.user.id : null,
      guestId: req.user
        ? null
        : generateGuestId(
            req.ip || req.connection.remoteAddress,
            req.headers["user-agent"]
          ),
    };

    // Get like count with error handling
    let likeCount = 0;
    try {
      likeCount = await ProductLike.getTotalLikes(productId, identifier);
    } catch (likeError) {
      console.warn("Failed to get like count, using 0:", likeError.message);
    }

    // Check if combo offer applies
    const quantityQualifies = quantity >= settings.comboOfferMinQuantity;
    const likesQualify = likeCount >= settings.comboOfferMinLikes;

    const comboApplied = quantityQualifies || likesQualify;

    res.status(200).json({
      success: true,
      comboApplied,
      reason: comboApplied
        ? quantityQualifies
          ? `${quantity} items qualify for free delivery`
          : `${likeCount} likes qualify for free delivery`
        : `Need ${settings.comboOfferMinQuantity}+ items or ${settings.comboOfferMinLikes}+ likes for free delivery`,
      settings: {
        minQuantity: settings.comboOfferMinQuantity,
        minLikes: settings.comboOfferMinLikes,
      },
      current: {
        quantity,
        likeCount,
      },
      quantityQualifies,
      likesQualify,
    });
  } catch (error) {
    console.error("Check combo offer error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Failed to check combo offer",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
