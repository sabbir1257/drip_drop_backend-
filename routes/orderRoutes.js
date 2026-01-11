const express = require("express");
const { body } = require("express-validator");
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  syncOrdersToSheets,
  getUnsyncedCount,
  trackGuestOrder,
  exportOrdersToSheets,
  trackOrder,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validator");

const router = express.Router();

// Public routes with conditional validation
router.post(
  "/",
  [
    // Conditional validation: orderItems required only for guest orders
    body("orderItems")
      .optional()
      .isArray({ min: 1 })
      .withMessage("Order must have at least one item"),
    body("shippingAddress.firstName")
      .trim()
      .notEmpty()
      .withMessage("First name is required"),
    body("shippingAddress.phone")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required"),
    body("shippingAddress.streetAddress")
      .trim()
      .notEmpty()
      .withMessage("Street address is required"),
    body("shippingAddress.townCity")
      .trim()
      .notEmpty()
      .withMessage("City is required"),
    body("paymentMethod")
      .optional()
      .isIn(["cash", "card", "online"])
      .withMessage("Invalid payment method"),
  ],
  validate,
  createOrder
);
router.post("/track-guest", trackGuestOrder);
router.get("/track/:orderId", trackOrder); // New tracking endpoint

// All other order routes require authentication
router.use(protect);

router.get("/", getOrders);
router.get("/unsynced-count", authorize("admin"), getUnsyncedCount);
router.post("/sync-sheets", authorize("admin"), syncOrdersToSheets);
router.post("/export-to-sheets", authorize("admin"), exportOrdersToSheets);
router.get("/:id", getOrder);
router.put("/:id", authorize("admin"), updateOrder);
router.put("/:id/status", authorize("admin"), updateOrderStatus);
router.delete("/:id", authorize("admin"), deleteOrder);

module.exports = router;
