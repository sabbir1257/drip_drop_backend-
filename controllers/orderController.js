const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const googleSheetsService = require("../utils/googleSheets");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      discountPercent = 20,
      deliveryFee = 15,
    } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Build order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0] || "/logo.jpeg",
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      price: item.price,
    }));

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount + deliveryFee;

    // Create order
    const order = await Order.create({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cash",
      subtotal,
      discount,
      deliveryFee,
      total,
    });

    // Update product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    await order.populate("orderItems.product", "name images");

    // Auto-sync to Google Sheets (async, non-blocking)
    googleSheetsService.initialize().then((initialized) => {
      if (initialized) {
        googleSheetsService.syncOrder(order, Order).catch((err) => {
          console.error("Failed to sync order to Google Sheets:", err.message);
        });
      }
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders (or all orders for admin)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    // If user is admin, return all orders; otherwise return only user's orders
    const query = req.user.role === "admin" ? {} : { user: req.user.id };

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("orderItems.product", "name images")
      .populate("user", "firstName lastName email");

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "orderItems.product",
      "name images price"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Make sure user owns the order
    if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    if (orderStatus === "delivered") {
      order.deliveredAt = new Date();
    }

    if (orderStatus === "cancelled") {
      order.cancelledAt = new Date();
      // Restore stock
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync orders to Google Sheets (only unsynced orders)
// @route   POST /api/orders/sync-sheets
// @access  Private/Admin
exports.syncOrdersToSheets = async (req, res, next) => {
  try {
    const { date, orderIds, syncAll = false } = req.body;

    // Initialize Google Sheets
    const initialized = await googleSheetsService.initialize();
    if (!initialized) {
      return res.status(503).json({
        success: false,
        message:
          "Google Sheets service not configured. Please add credentials to .env file.",
      });
    }

    let query = {};

    // Only sync unsynced orders by default (unless syncAll is true)
    if (!syncAll) {
      query.syncedToSheet = { $ne: true };
    }

    // If specific order IDs provided
    if (orderIds && orderIds.length > 0) {
      query._id = { $in: orderIds };
    }
    // If date filter provided
    else if (date) {
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.createdAt = {
        $gte: targetDate,
        $lt: nextDay,
      };
    }

    const orders = await Order.find(query).populate(
      "orderItems.product",
      "name images"
    );

    if (!orders || orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No new orders to sync",
        stats: {
          total: 0,
          synced: 0,
          skipped: 0,
          failed: 0,
        },
      });
    }

    // Sync to Google Sheets (pass Order model for updating sync status)
    const result = await googleSheetsService.syncOrders(orders, Order);

    res.status(200).json({
      success: true,
      message: result.message,
      stats: {
        total: orders.length,
        synced: result.synced,
        skipped: result.skipped,
        failed: result.failed,
      },
    });
  } catch (error) {
    console.error("Sync error:", error);
    next(error);
  }
};

// @desc    Get count of unsynced orders
// @route   GET /api/orders/unsynced-count
// @access  Private/Admin
exports.getUnsyncedCount = async (req, res, next) => {
  try {
    const count = await Order.countDocuments({ syncedToSheet: { $ne: true } });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    next(error);
  }
};
