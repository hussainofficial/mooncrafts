const { validationResult } = require('express-validator');
const productRepository = require('../repositories/product.repository');

// Helper function to convert image buffers to base64
function convertImageToBase64(product) {
  if (product && product.image && Buffer.isBuffer(product.image)) {
    product.image = `data:image/jpeg;base64,${product.image.toString('base64')}`;
  }
  return product;
}

// Helper function for array of products
function convertProductsImages(products) {
  return products.map(product => convertImageToBase64(product));
}

async function createProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, description, price, category_id, material, material_id, stock, image, is_trending, is_new_arrival, is_best_seller, is_featured } = req.body;
    const categoryId = category_id || req.body.categoryId;
    const materialId = material_id || material;

    // Handle primary image
    let imageData = null;
    if (req.file) {
      const base64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';
      imageData = `data:${mimeType};base64,${base64}`;
    } else if (image) {
      if (typeof image === 'string') {
        if (image.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(image)) {
          imageData = image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid image format. Expected data URL or base64 string.'
          });
        }
      }
    }

    const productId = await productRepository.createProduct(
      name,
      description,
      price,
      categoryId,
      imageData,
      stock,
      is_trending || false,
      is_new_arrival || false,
      is_best_seller || false,
      is_featured || false,
      materialId ? parseInt(materialId) : null
    );

    const createdProduct = await productRepository.getProductById(productId);

    // Convert image buffer to base64 if it exists
    if (createdProduct && createdProduct.image && Buffer.isBuffer(createdProduct.image)) {
      createdProduct.image = `data:image/jpeg;base64,${createdProduct.image.toString('base64')}`;
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId,
      data: createdProduct
    });
  } catch (error) {
    next(error);
  }
}

async function listProducts(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const filters = {
      categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : null,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : null,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : null,
      search: req.query.search || null,
      status: req.query.status || 'active'
    };

    const products = await productRepository.getAllProducts(limit, offset, filters);
    const total = await productRepository.getProductCount(filters);

    // Convert image buffers to base64
    const convertedProducts = convertProductsImages(products);

    res.json({
      success: true,
      products: convertedProducts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const product = await productRepository.getProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Convert image buffer to base64
    convertImageToBase64(product);

    res.json({ success: true, product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId } = req.params;
    const { name, description, price, category_id, material, material_id, stock, status, image, is_trending, is_new_arrival, is_best_seller, is_featured } = req.body;
    const categoryId = category_id || req.body.categoryId; // Support both formats
    const materialId = material_id || material; // Support both material and material_id

    const product = await productRepository.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Handle image data
    let imageData = product.image; // Keep existing image by default
    if (req.file) {
      // Convert binary file to base64 data URL
      const base64 = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';
      imageData = `data:${mimeType};base64,${base64}`;
    } else if (image) {
      // Validate that image is in proper format
      if (typeof image === 'string') {
        if (image.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(image)) {
          // Accept both data URL and raw base64
          imageData = image.startsWith('data:image') ? image : `data:image/jpeg;base64,${image}`;
        } else if (image === '') {
          // Allow explicit empty string to mean "no change"
          imageData = product.image;
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid image format. Expected data URL or base64 string.'
          });
        }
      }
    }

    // Use existing values as defaults for fields not provided
    const updateData = {
      name: name !== undefined && name !== '' ? name : product.name,
      description: description !== undefined && description !== '' ? description : product.description,
      price: price !== undefined && price !== null ? price : product.price,
      categoryId: categoryId !== undefined && categoryId !== null ? categoryId : product.category_id,
      imageData: imageData,
      stock: stock !== undefined && stock !== null ? stock : product.stock,
      status: status !== undefined && status !== '' ? status : product.status,
      isTrending: is_trending !== undefined ? is_trending : (product.is_trending || false),
      isNewArrival: is_new_arrival !== undefined ? is_new_arrival : (product.is_new_arrival || false),
      isBestSeller: is_best_seller !== undefined ? is_best_seller : (product.is_best_seller || false),
      isFeatured: is_featured !== undefined ? is_featured : (product.is_featured || false)
    };

    // Ensure no undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        updateData[key] = null;
      }
    });

    await productRepository.updateProduct(
      productId,
      updateData.name,
      updateData.description,
      updateData.price,
      updateData.categoryId,
      updateData.imageData,
      updateData.stock,
      updateData.status,
      updateData.isTrending,
      updateData.isNewArrival,
      updateData.isBestSeller,
      updateData.isFeatured,
      materialId ? parseInt(materialId) : (product.material_id || null)
    );

    const updatedProduct = await productRepository.getProductById(productId);

    // Convert image buffer to base64 if it exists
    if (updatedProduct && updatedProduct.image && Buffer.isBuffer(updatedProduct.image)) {
      updatedProduct.image = `data:image/jpeg;base64,${updatedProduct.image.toString('base64')}`;
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const { productId } = req.params;
    const product = await productRepository.getProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const deleted = await productRepository.deleteProduct(productId);

    if (!deleted) {
      return res.status(400).json({ success: false, message: 'Failed to delete product' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function searchProducts(req, res, next) {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Search term too short' });
    }

    const products = await productRepository.searchProducts(q);

    // Convert image buffers to base64
    const convertedProducts = convertProductsImages(products);

    res.json({
      success: true,
      products: convertedProducts,
      count: convertedProducts.length
    });
  } catch (error) {
    next(error);
  }
}

async function getLowStockProducts(req, res, next) {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    const products = await productRepository.getLowStockProducts(threshold);

    // Convert image buffers to base64
    const convertedProducts = convertProductsImages(products);

    res.json({
      success: true,
      products: convertedProducts,
      count: convertedProducts.length
    });
  } catch (error) {
    next(error);
  }
}

async function getProductStats(req, res, next) {
  try {
    const stats = await productRepository.getProductStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
}

async function getTopProducts(req, res, next) {
  try {
    // Parse and validate query parameters
    let limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'price';
    const order = req.query.order || 'DESC';

    // Validate limit (must be positive and not exceed max of 100)
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100'
      });
    }

    // Validate sortBy parameter
    const allowedSortBy = ['price', 'rating', 'reviews', 'stock', 'created_at'];
    if (!allowedSortBy.includes(sortBy)) {
      return res.status(400).json({
        success: false,
        message: `sortBy must be one of: ${allowedSortBy.join(', ')}`
      });
    }

    // Validate order parameter
    if (!['ASC', 'DESC'].includes(order.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'order must be ASC or DESC'
      });
    }

    const products = await productRepository.getTopProducts(limit, sortBy, order);

    res.json({
      success: true,
      data: products.map(product => {
        let imageData = product.image;
        if (Buffer.isBuffer(product.image)) {
          imageData = `data:image/jpeg;base64,${product.image.toString('base64')}`;
        }
        return {
          id: product.id,
          name: product.name,
          price: parseFloat(product.price),
          category: product.category,
          image: imageData,
          rating: parseFloat(product.rating),
          reviews: parseInt(product.reviews),
          inStock: product.inStock === 1 || product.inStock === true,
          stock: product.stock,
          description: product.description
        };
      }),
      count: products.length,
      pagination: {
        limit: limit,
        sortBy: sortBy,
        order: order.toUpperCase()
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getProductImage(req, res, next) {
  try {
    const { productId } = req.params;
    const product = await productRepository.getProductById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!product.image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // If image is already a data URL, return it as-is
    // If it's a BLOB, convert to base64
    let imageUrl = product.image;
    if (product.image && !product.image.startsWith('data:')) {
      // Check if it's a buffer/blob
      if (Buffer.isBuffer(product.image)) {
        const base64Image = product.image.toString('base64');
        imageUrl = `data:image/jpeg;base64,${base64Image}`;
      }
    }

    res.json({
      success: true,
      image: imageUrl
    });
  } catch (error) {
    next(error);
  }
}

async function uploadProductImages(req, res, next) {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await productRepository.getProductById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Limit to 5 images
    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 images allowed'
      });
    }

    // Convert uploaded files to URLs
    const imageUrls = req.files.map(file => {
      return `/uploads/products/${file.filename}`;
    });

    // Save image URLs to database
    await productRepository.updateProductImages(productId, imageUrls);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls,
      productId: productId
    });
  } catch (error) {
    // Clean up uploaded files if error occurs
    if (req.files) {
      const fs = require('fs');
      const path = require('path');
      req.files.forEach(file => {
        const filepath = path.join(__dirname, '../../public/uploads/products', file.filename);
        fs.unlink(filepath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    next(error);
  }
}

// NEW: Product Images Gallery Methods

async function getProductGallery(req, res, next) {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await productRepository.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Get all images for this product
    const images = await productRepository.getProductImages(productId);

    res.json({
      success: true,
      productId,
      images: images || [],
      count: images?.length || 0
    });
  } catch (error) {
    next(error);
  }
}

async function addProductGalleryImages(req, res, next) {
  try {
    const { productId } = req.params;
    const { images } = req.body;

    // Verify product exists
    const product = await productRepository.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate images array
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required and must not be empty'
      });
    }

    // Limit to 10 images per product
    if (images.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 images allowed per product'
      });
    }

    // Validate each image is base64
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.url && !img.image_url) {
        return res.status(400).json({
          success: false,
          message: `Image ${i + 1}: url field is required`
        });
      }
      if (typeof img.url !== 'string' && typeof img.image_url !== 'string') {
        return res.status(400).json({
          success: false,
          message: `Image ${i + 1}: url must be a string`
        });
      }
    }

    // Add images to database
    await productRepository.addProductImages(productId, images);

    // Get updated images list
    const updatedImages = await productRepository.getProductImages(productId);

    res.status(201).json({
      success: true,
      message: `${images.length} image(s) added successfully`,
      productId,
      images: updatedImages,
      count: updatedImages.length
    });
  } catch (error) {
    next(error);
  }
}

async function updateProductGalleryImageOrder(req, res, next) {
  try {
    const { productId } = req.params;
    const { images } = req.body;

    // Verify product exists
    const product = await productRepository.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Validate images
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Images array is required'
      });
    }

    // Update image order
    await productRepository.updateImageOrder(productId, images);

    // Get updated images
    const updatedImages = await productRepository.getProductImages(productId);

    res.json({
      success: true,
      message: 'Image order updated successfully',
      images: updatedImages
    });
  } catch (error) {
    next(error);
  }
}

async function deleteProductGalleryImage(req, res, next) {
  try {
    const { productId, imageId } = req.params;

    // Verify product exists
    const product = await productRepository.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete image
    const deleted = await productRepository.deleteProductImage(imageId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    // Get updated images list
    const updatedImages = await productRepository.getProductImages(productId);

    res.json({
      success: true,
      message: 'Image deleted successfully',
      images: updatedImages,
      count: updatedImages.length
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  listProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getLowStockProducts,
  getProductStats,
  getTopProducts,
  getProductImage,
  uploadProductImages,
  getProductGallery,
  addProductGalleryImages,
  updateProductGalleryImageOrder,
  deleteProductGalleryImage
};
