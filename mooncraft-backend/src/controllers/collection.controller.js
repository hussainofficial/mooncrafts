const { validationResult } = require('express-validator');
const { STATUS_CODES } = require('../../config/constants');
const collectionService = require('../services/collection.service');

async function createCollection(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, image, slug, is_active } = req.body;

    const result = await collectionService.createCollection({
      name,
      slug,
      description,
      image,
      is_active
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: result.message,
      collectionId: result.collectionId
    });
  } catch (error) {
    if (error.message.includes('Slug already exists')) {
      return res.status(STATUS_CODES.CONFLICT).json({
        success: false,
        message: error.message
      });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function listCollections(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await collectionService.getAllCollections(limit, offset);

    res.json({
      success: true,
      data: result.collections,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getCollection(req, res, next) {
  try {
    const { collectionId } = req.params;

    const collection = await collectionService.getCollectionById(collectionId);

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    if (error.message === 'Collection not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function getCollectionBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const collection = await collectionService.getCollectionBySlug(slug);

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    if (error.message === 'Collection not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function updateCollection(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { collectionId } = req.params;
    const { name, description, image, slug, is_active } = req.body;

    const updatedCollection = await collectionService.updateCollection(collectionId, {
      name,
      slug,
      description,
      image,
      is_active
    });

    res.json({
      success: true,
      message: 'Collection updated successfully',
      data: updatedCollection
    });
  } catch (error) {
    if (error.message === 'Collection not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    if (error.message.includes('Slug already exists')) {
      return res.status(STATUS_CODES.CONFLICT).json({
        success: false,
        message: error.message
      });
    }
    res.status(STATUS_CODES.BAD_REQUEST).json({
      success: false,
      message: error.message
    });
  }
}

async function deleteCollection(req, res, next) {
  try {
    const { collectionId } = req.params;

    const result = await collectionService.deleteCollection(collectionId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message === 'Collection not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

async function getActiveCollections(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await collectionService.getActiveCollections(limit, offset);

    res.json({
      success: true,
      data: result.collections,
      pagination: {
        total: result.total,
        page,
        limit,
        pages: result.pages
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCollection,
  listCollections,
  getCollection,
  getCollectionBySlug,
  updateCollection,
  deleteCollection,
  getActiveCollections
};
