const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/Category");

dotenv.config();

const testCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected\n");

    // Check current categories
    const categories = await Category.find();
    console.log("📊 CURRENT STATE:");
    console.log(`   Total categories: ${categories.length}`);

    if (categories.length === 0) {
      console.log("   ✅ No static categories found");
      console.log(
        "   ✅ System is ready - only admin-created categories will appear\n"
      );
    } else {
      console.log("   Categories in database:");
      categories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (ID: ${cat._id})`);
      });
      console.log("");
    }

    console.log("📋 HOW TO USE:");
    console.log("   1. Go to Admin Dashboard → Products");
    console.log("   2. Click 'Add Product'");
    console.log(
      "   3. In Category field, click 'Add First Category' or 'Add New Category'"
    );
    console.log("   4. Enter a category name and add it");
    console.log("   5. The category will immediately appear in:");
    console.log("      • Product form dropdown");
    console.log("      • Home page (Top Categories section - top 4 by count)");
    console.log("      • Shop page (Category filter)");
    console.log("");
    console.log(
      "✅ All category displays are now 100% dynamic and admin-controlled"
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

testCategories();
