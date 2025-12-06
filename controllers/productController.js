const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      category,
      color,
      size,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 12,
      featured
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (color) {
      query.colors = { $in: Array.isArray(color) ? color : [color] };
    }

    if (size) {
      query.sizes = { $in: Array.isArray(size) ? size : [size] };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Sort options
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price-low':
          sortOption = { price: 1 };
          break;
        case 'price-high':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findOne({
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ]
    }).populate('reviews', 'rating comment user createdAt');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    // Validate required fields
    const { name, price, stock, category, colors, sizes, images } = req.body;

    if (!name || !price || stock === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, price, stock, and category are required'
      });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one image is required'
      });
    }

    if (!colors || !Array.isArray(colors) || colors.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one color is required'
      });
    }

    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one size is required'
      });
    }

    // Filter out empty image URLs
    const validImages = images.filter(img => img && img.trim());
    if (validImages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid image URL is required'
      });
    }

    const product = await Product.create({
      ...req.body,
      images: validImages
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    // Handle duplicate slug error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A product with this name already exists'
      });
    }
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }))
    });
  } catch (error) {
    next(error);
  }
};

