const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
<<<<<<< HEAD
      required: false,
      unique: true,
      lowercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
=======
      required: true,
      unique: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
>>>>>>> 8009cdbae02630327764d1503dadb2996d88d230
    },
  },
  {
    timestamps: true,
  }
);

<<<<<<< HEAD
// Generate slug from name before saving
categorySchema.pre("save", function (next) {
  if (this.isNew || !this.slug || this.isModified("name")) {
    if (this.name) {
      this.slug = this.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
=======
// Generate slug before saving
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
>>>>>>> 8009cdbae02630327764d1503dadb2996d88d230
  }
  next();
});

<<<<<<< HEAD
=======
// Static method to check if category exists (case-insensitive)
categorySchema.statics.findByNameCaseInsensitive = function (name) {
  return this.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
};

>>>>>>> 8009cdbae02630327764d1503dadb2996d88d230
module.exports = mongoose.model("Category", categorySchema);
