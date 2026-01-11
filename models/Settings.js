const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    // Site Identity
    siteName: {
      type: String,
      default: "DeshWear",
    },
    logo: {
      type: String,
      default: "/logo.jpeg",
    },
    favicon: {
      type: String,
      default: "/favicon.ico",
    },
    tagline: {
      type: String,
      default: "Your Premium Fashion Destination",
    },

    // Contact Information
    email: {
      type: String,
      default: "support@dripdrop.com",
    },
    phone: {
      type: String,
      default: "+1 (234) 567-890",
    },
    address: {
      type: String,
      default: "",
    },

    // Social Media Links
    socialMedia: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      youtube: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },

    // Business Settings
    currency: {
      type: String,
      default: "BDT",
    },
    currencySymbol: {
      type: String,
      default: "৳",
    },
    timezone: {
      type: String,
      default: "Asia/Dhaka",
    },

    // Shipping Settings
    defaultDeliveryFee: {
      type: Number,
      default: 15,
    },
    freeShippingThreshold: {
      type: Number,
      default: 50,
    },

    // Combo Offer Settings
    comboOfferEnabled: {
      type: Boolean,
      default: true,
    },
    comboOfferMinQuantity: {
      type: Number,
      default: 2,
      min: 1,
    },
    comboOfferMinLikes: {
      type: Number,
      default: 2,
      min: 1,
      max: 5,
    },
    comboOfferApplyToAll: {
      type: Boolean,
      default: true,
    },
    comboOfferProductIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    // Discount Settings
    defaultDiscountPercent: {
      type: Number,
      default: 20,
    },

    // Footer Content
    footerAbout: {
      type: String,
      default:
        "Discover the latest trends in fashion with DeshWear. Quality clothing for every style.",
    },
    copyrightText: {
      type: String,
      default: "© 2024 DeshWear. All rights reserved.",
    },

    // Maintenance
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default: "We are currently updating our website. Please check back soon!",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function (updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model("Settings", settingsSchema);
