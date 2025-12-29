const express = require("express");
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  syncOrdersToSheets,
  getUnsyncedCount,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Public route for order creation (supports guest checkout)
router.post("/", createOrder);

// All other order routes require authentication
router.use(protect);

router.get("/", getOrders);
router.get("/unsynced-count", authorize("admin"), getUnsyncedCount);
router.post("/sync-sheets", authorize("admin"), syncOrdersToSheets);
router.get("/:id", getOrder);
router.put("/:id/status", authorize("admin"), updateOrderStatus);

module.exports = router;
