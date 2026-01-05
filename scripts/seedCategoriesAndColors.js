const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Category = require("../models/Category");
const Color = require("../models/Color");

// Load environment variables
dotenv.config();

const categories = [];

const colors = [
  { name: "Black", hexCode: "#000000" },
  { name: "White", hexCode: "#FFFFFF" },
  { name: "Red", hexCode: "#FF0000" },
  { name: "Blue", hexCode: "#0000FF" },
  { name: "Green", hexCode: "#008000" },
  { name: "Yellow", hexCode: "#FFFF00" },
  { name: "Gray", hexCode: "#808080" },
  { name: "Brown", hexCode: "#A52A2A" },
  { name: "Pink", hexCode: "#FFC0CB" },
  { name: "Purple", hexCode: "#800080" },
  { name: "Orange", hexCode: "#FFA500" },
  { name: "Navy", hexCode: "#000080" },
  { name: "Beige", hexCode: "#F5F5DC" },
];

const seedCategoriesAndColors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Category.deleteMany({});
    // await Color.deleteMany({});
    // console.log('🗑️  Cleared existing categories and colors');

    // Seed categories
    console.log("📦 Seeding categories...");
    for (const category of categories) {
      const existing = await Category.findByNameCaseInsensitive(category.name);
      if (!existing) {
        await Category.create(category);
        console.log(`  ✓ Added category: ${category.name}`);
      } else {
        console.log(`  ⊘ Category already exists: ${category.name}`);
      }
    }

    // Seed colors
    console.log("🎨 Seeding colors...");
    for (const color of colors) {
      const existing = await Color.findByNameCaseInsensitive(color.name);
      if (!existing) {
        await Color.create(color);
        console.log(`  ✓ Added color: ${color.name} (${color.hexCode})`);
      } else {
        console.log(`  ⊘ Color already exists: ${color.name}`);
      }
    }

    console.log("\n✅ Seeding completed successfully!");
    console.log(`📊 Total categories: ${await Category.countDocuments()}`);
    console.log(`🎨 Total colors: ${await Color.countDocuments()}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
};

seedCategoriesAndColors();
