const express = require("express");
const router = express.Router();
const {
  likeProduct,
  getLikeCount,
  checkComboOffer,
} = require("../controllers/likeController");
const { protect, optional } = require("../middleware/auth");

// Optional auth middleware - works for both authenticated and guest users
const optionalAuth = (req, res, next) => {
  // Try to authenticate, but don't fail if no token
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
};

// Like a product
router.post("/:productId", optionalAuth, likeProduct);

// Get like count for a product
router.get("/:productId", optionalAuth, getLikeCount);

// Check if combo offer applies
router.post("/check-combo", optionalAuth, checkComboOffer);

module.exports = router;
