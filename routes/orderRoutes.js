const express = require("express");
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  syncOrdersToSheets,
  getUnsyncedCount,
  trackGuestOrder,
  exportOrdersToSheets,
  trackOrder,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/", createOrder);
router.post("/track-guest", trackGuestOrder);
router.get("/track/:orderId", trackOrder); // New tracking endpoint

// All other order routes require authentication
router.use(protect);

router.get("/", getOrders);
router.get("/unsynced-count", authorize("admin"), getUnsyncedCount);
router.post("/sync-sheets", authorize("admin"), syncOrdersToSheets);
router.post("/export-to-sheets", authorize("admin"), exportOrdersToSheets);
router.get("/:id", getOrder);
router.put("/:id/status", authorize("admin"), updateOrderStatus);

module.exports = router;
