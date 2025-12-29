const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const googleSheetsService = require("../utils/googleSheets");

// @desc    Create new order
// @route   POST /api/orders
// @access  Public (supports both authenticated and guest orders)
exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      discountPercent = 20,
      deliveryFee = 15,
      isGuestOrder = false,
    } = req.body;

    // For authenticated users, get cart from database
    if (req.user && !isGuestOrder) {
      const cart = await Cart.findOne({ user: req.user.id }).populate(
        "items.product"
      );

      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Cart is empty",
        });
      }

      // Build order items from cart
      const cartOrderItems = cart.items.map((item) => ({
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
        isGuestOrder: false,
        orderItems: cartOrderItems,
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
            console.error(
              "Failed to sync order to Google Sheets:",
              err.message
            );
          });
        }
      });

      return res.status(201).json({
        success: true,
        order,
      });
    }

    // For guest orders, use orderItems from request body
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order items are required",
      });
    }

    // Validate required fields for guest orders
    if (!shippingAddress || !shippingAddress.email || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: "Email and phone number are required for guest orders",
      });
    }

    // Validate products and calculate totals
    const validatedOrderItems = [];
    let subtotal = 0;

    for (const item of orderItems) {
      const product = await Product.findById(item.product || item.productId);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.name || "unknown"} is not available`,
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      validatedOrderItems.push({
        product: product._id,
        name: product.name,
        image: item.image || product.images[0] || "/logo.jpeg",
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: item.price || product.price,
      });

      subtotal += (item.price || product.price) * item.quantity;
    }

    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount + deliveryFee;

    // Create guest order
    const order = await Order.create({
      isGuestOrder: true,
      guestInfo: {
        email: shippingAddress.email,
        phone: shippingAddress.phone,
      },
      orderItems: validatedOrderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cash",
      subtotal,
      discount,
      deliveryFee,
      total,
    });

    // Update product stock
    for (const item of validatedOrderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

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

// @desc    Track guest order by phone and order ID
// @route   POST /api/orders/track-guest
// @access  Public
exports.trackGuestOrder = async (req, res, next) => {
  try {
    const { phone, orderId } = req.body;

    if (!phone || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Phone number and Order ID are required",
      });
    }

    // Find order by ID and phone number
    const order = await Order.findOne({
      _id: orderId,
      isGuestOrder: true,
      "shippingAddress.phone": phone,
    }).populate("orderItems.product", "name images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found. Please check your Order ID and phone number.",
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

// @desc    Export filtered orders to Google Sheets
// @route   POST /api/orders/export-to-sheets
// @access  Private/Admin
exports.exportOrdersToSheets = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    // Build query
    let query = {};

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateTime;
      }
    }

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("orderItems.product", "name")
      .populate("user", "firstName lastName");

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the selected date range",
      });
    }

    // Prepare data for Google Sheets
    const exportData = [];

    // Add header row
    exportData.push([
      "Order ID",
      "Name",
      "Mobile Number",
      "Email",
      "Address",
      "Product Name",
      "Quantity",
      "Color",
      "Size",
      "Item Price",
      "Item Total",
      "Subtotal",
      "Delivery Fee",
      "Discount",
      "Total Bill",
      "Payment Method",
      "Payment Status",
      "Order Status",
      "Order Time",
      "Note",
    ]);

    // Add data rows
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        exportData.push([
          `#${order._id.toString().slice(-8)}`,
          `${order.shippingAddress?.firstName || ""} ${
            order.shippingAddress?.lastName || ""
          }`.trim(),
          order.shippingAddress?.phone || order.guestInfo?.phone || "N/A",
          order.shippingAddress?.email || order.guestInfo?.email || "N/A",
          `${order.shippingAddress?.streetAddress || ""}, ${
            order.shippingAddress?.townCity || ""
          }, ${order.shippingAddress?.state || ""} ${
            order.shippingAddress?.zipCode || ""
          }`.replace(/^[,\s]+|[,\s]+$/g, ""),
          item.name,
          item.quantity,
          item.color,
          item.size,
          `৳${item.price.toFixed(2)}`,
          `৳${(item.price * item.quantity).toFixed(2)}`,
          `৳${order.subtotal.toFixed(2)}`,
          `৳${order.deliveryFee.toFixed(2)}`,
          `৳${order.discount.toFixed(2)}`,
          `৳${order.total.toFixed(2)}`,
          order.paymentMethod,
          order.paymentStatus,
          order.orderStatus,
          order.createdAt.toLocaleString(),
          order.notes || "N/A",
        ]);
      });
    });

    // Export to Google Sheets
    const initialized = await googleSheetsService.initialize();
    if (!initialized) {
      return res.status(500).json({
        success: false,
        message: "Google Sheets API is not configured",
      });
    }

    const result = await googleSheetsService.exportBulkData(exportData);

    res.status(200).json({
      success: true,
      message: `Successfully exported ${orders.length} orders (${
        exportData.length - 1
      } items) to Google Sheets`,
      ordersCount: orders.length,
      itemsCount: exportData.length - 1,
      sheetUrl: result.sheetUrl,
    });
  } catch (error) {
    console.error("Export error:", error);
    next(error);
  }
};
