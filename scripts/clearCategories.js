const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/Category");
const Product = require("../models/Product");

dotenv.config();

const clearCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Get all categories
    const allCategories = await Category.find();
    console.log(`📊 Found ${allCategories.length} categories in database`);

    if (allCategories.length > 0) {
      console.log("\n📋 Current categories:");
      allCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name}`);
      });

      // Check if any products reference these categories
      const productsWithCategories = await Product.find({
        category: { $in: allCategories.map((c) => c.name) },
      });

      if (productsWithCategories.length > 0) {
        console.log(
          `\n⚠️  Warning: ${productsWithCategories.length} products are using these categories`
        );
        console.log(
          "   Products will need to be updated after category deletion"
        );
      }

      // Delete all categories
      const result = await Category.deleteMany({});
      console.log(`\n✅ Deleted ${result.deletedCount} categories`);
      console.log(
        "📊 Database is now empty - categories will be created only by admin"
      );
    } else {
      console.log("\n✅ No categories found - database is already clean");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing categories:", error);
    process.exit(1);
  }
};

clearCategories();
