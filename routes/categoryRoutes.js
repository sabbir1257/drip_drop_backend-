const express = require("express");
const router = express.Router();
<<<<<<< HEAD
=======
const { protect, authorize } = require("../middleware/auth");
>>>>>>> 8009cdbae02630327764d1503dadb2996d88d230
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
<<<<<<< HEAD
const { protect, admin } = require("../middleware/auth");

router.route("/").get(getCategories).post(protect, admin, createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);
=======

// Public routes
router.get("/", getCategories);
router.get("/:id", getCategory);

// Admin routes
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);
>>>>>>> 8009cdbae02630327764d1503dadb2996d88d230

module.exports = router;
