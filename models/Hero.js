const mongoose = require("mongoose");

const heroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [500, "Subtitle cannot exceed 500 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    desktopImage: {
      type: String,
      required: [true, "Desktop image is required"],
    },
    mobileImage: {
      type: String,
    },
    ctaButtonText: {
      type: String,
      default: "Shop Now",
      trim: true,
    },
    ctaButtonLink: {
      type: String,
      default: "/shop",
      trim: true,
    },
    textAlignment: {
      type: String,
      enum: ["left", "center", "right"],
      default: "left",
    },
    overlayOpacity: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    textColor: {
      type: String,
      default: "text-black",
    },
    buttonColor: {
      type: String,
      default: "bg-black",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Statistics (optional)
    statistics: {
      brands: {
        type: String,
        default: "200+",
      },
      products: {
        type: String,
        default: "2,000+",
      },
      customers: {
        type: String,
        default: "30,000+",
      },
      showStats: {
        type: Boolean,
        default: true,
      },
    },
    // Analytics
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
heroSchema.index({ isActive: 1, priority: -1 });
heroSchema.index({ createdAt: -1 });

// Virtual for click-through rate
heroSchema.virtual("ctr").get(function () {
  if (this.impressions === 0) return 0;
  return ((this.clicks / this.impressions) * 100).toFixed(2);
});

// Ensure virtuals are included in JSON
heroSchema.set("toJSON", { virtuals: true });
heroSchema.set("toObject", { virtuals: true });

// Static method to get all active heroes sorted by priority
heroSchema.statics.getActiveHeroes = function () {
  return this.find({ isActive: true })
    .sort({ priority: -1, createdAt: -1 })
    .select("-__v");
};

// Method to increment impressions
heroSchema.methods.trackImpression = function () {
  this.impressions += 1;
  return this.save();
};

// Method to increment clicks
heroSchema.methods.trackClick = function () {
  this.clicks += 1;
  return this.save();
};

const Hero = mongoose.model("Hero", heroSchema);

module.exports = Hero;
