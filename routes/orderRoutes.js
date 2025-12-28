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

// All order routes require authentication
router.use(protect);

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/unsynced-count", authorize("admin"), getUnsyncedCount);
router.post("/sync-sheets", authorize("admin"), syncOrdersToSheets);
router.get("/:id", getOrder);
router.put("/:id/status", authorize("admin"), updateOrderStatus);

module.exports = router;
