const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Brand = require('../models/Brand');

dotenv.config();

const cleanBrands = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Find all brands
    const allBrands = await Brand.find({});
    console.log(`Found ${allBrands.length} total brands`);

    // Remove brands with empty or invalid names/logos
    const invalidBrands = await Brand.deleteMany({
      $or: [
        { name: { $exists: false } },
        { name: '' },
        { name: { $regex: /^\s*$/ } },
        { logo: { $exists: false } },
        { logo: '' },
        { logo: { $regex: /^\s*$/ } }
      ]
    });
    console.log(`Deleted ${invalidBrands.deletedCount} invalid brands`);

    // Remove duplicate brands by name (case-insensitive)
    const brands = await Brand.find({}).sort({ createdAt: 1 });
    const seenNames = new Set();
    let duplicatesRemoved = 0;

    for (const brand of brands) {
      const nameLower = brand.name.toLowerCase().trim();
      if (seenNames.has(nameLower)) {
        await Brand.deleteOne({ _id: brand._id });
        duplicatesRemoved++;
        console.log(`Removed duplicate: ${brand.name}`);
      } else {
        seenNames.add(nameLower);
      }
    }

    console.log(`Removed ${duplicatesRemoved} duplicate brands`);

    // Show remaining brands
    const remainingBrands = await Brand.find({});
    console.log(`\nRemaining brands (${remainingBrands.length}):`);
    remainingBrands.forEach(brand => {
      console.log(`  - ${brand.name} (ID: ${brand._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error cleaning brands:', error);
    process.exit(1);
  }
};

cleanBrands();

