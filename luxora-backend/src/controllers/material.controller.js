const { validationResult } = require('express-validator');
const { STATUS_CODES } = require('../../config/constants');
const materialService = require('../services/material.service');

async function createMaterial(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, image, slug, is_active } = req.body;

    const result = await materialService.createMaterial({
      name,
      slug,
      description,
      image,
      is_active
    });

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: result.message,
      materialId: result.materialId
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

async function listMaterials(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const result = await materialService.getAllMaterials(limit, offset);

    res.json({
      success: true,
      data: result.materials,
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

async function getMaterial(req, res, next) {
  try {
    const { materialId } = req.params;

    const material = await materialService.getMaterialById(materialId);

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    if (error.message === 'Material not found') {
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

async function getMaterialBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const material = await materialService.getMaterialBySlug(slug);

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    if (error.message === 'Material not found') {
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

async function updateMaterial(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        errors: errors.array()
      });
    }

    const { materialId } = req.params;
    const { name, description, image, slug, is_active } = req.body;

    const updatedMaterial = await materialService.updateMaterial(materialId, {
      name,
      slug,
      description,
      image,
      is_active
    });

    res.json({
      success: true,
      message: 'Material updated successfully',
      data: updatedMaterial
    });
  } catch (error) {
    if (error.message === 'Material not found') {
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

async function deleteMaterial(req, res, next) {
  try {
    const { materialId } = req.params;

    const result = await materialService.deleteMaterial(materialId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (error.message === 'Material not found') {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
}

async function getActiveMaterials(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await materialService.getActiveMaterials(limit, offset);

    res.json({
      success: true,
      data: result.materials,
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
  createMaterial,
  listMaterials,
  getMaterial,
  getMaterialBySlug,
  updateMaterial,
  deleteMaterial,
  getActiveMaterials
};
