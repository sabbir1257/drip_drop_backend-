const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/Category");

dotenv.config();

const defaultCategories = [];

const seedCategories = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");

    // Check existing categories
    const existingCategories = await Category.find();
    console.log(`📊 Found ${existingCategories.length} existing categories`);

    // Add only new categories
    let addedCount = 0;
    for (const categoryName of defaultCategories) {
      const exists = await Category.findOne({
        name: { $regex: new RegExp(`^${categoryName}$`, "i") },
      });

      if (!exists) {
        await Category.create({ name: categoryName });
        console.log(`✅ Added category: ${categoryName}`);
        addedCount++;
      } else {
        console.log(`⏭️  Skipped existing category: ${categoryName}`);
      }
    }

    console.log(`\n✅ Categories seeded successfully!`);
    console.log(`📊 Added ${addedCount} new categories`);
    console.log(
      `📊 Total categories: ${existingCategories.length + addedCount}`
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
};

seedCategories();
