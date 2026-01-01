const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  size: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Changed to false to support guest orders
    },
    isGuestOrder: {
      type: Boolean,
      default: false,
    },
    guestInfo: {
      email: String,
      phone: String,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      streetAddress: String,
      townCity: String,
      state: String,
      zipCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "paypal"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    // Pathao Integration Fields
    deliveryStatus: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "failed",
      ],
      default: "placed",
    },
    pathaoConsignmentId: {
      type: String,
      default: null,
    },
    pathaoOrderId: {
      type: String,
      default: null,
    },
    trackingHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastStatusUpdate: {
      type: Date,
      default: Date.now,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 15,
    },
    total: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: "",
    },
    syncedToSheet: {
      type: Boolean,
      default: false,
    },
    syncedAt: {
      type: Date,
      default: null,
    },
    deliveredAt: Date,
    cancelledAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for user orders
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
