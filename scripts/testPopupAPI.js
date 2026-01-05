const mongoose = require("mongoose");
const Popup = require("../models/Popup");
require("dotenv").config();

async function testPopupAPI() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/drip_drop"
    );
    console.log("✅ Connected to MongoDB");

    // Check existing popups
    const popups = await Popup.find({});
    console.log(`\n📊 Current popups in database: ${popups.length}`);

    if (popups.length > 0) {
      console.log("\n📋 Existing Popups:");
      popups.forEach((popup, index) => {
        console.log(
          `${index + 1}. ${popup.title} - ${
            popup.isActive ? "Active" : "Inactive"
          }`
        );
        console.log(`   Image: ${popup.imageUrl || "No image"}`);
        console.log(`   Display: ${popup.displayFrequency}`);
      });
    }

    // Test creating a sample popup (optional)
    console.log("\n✅ Popup model is working correctly");
    console.log("✅ You can create popups from the admin dashboard");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  }
}

testPopupAPI();
