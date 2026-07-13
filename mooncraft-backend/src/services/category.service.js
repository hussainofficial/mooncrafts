const categoryRepository = require('../repositories/category.repository');

class CategoryService {
  // Create category
  async createCategory(data) {
    const { name, slug, description, type } = data;

    if (!name || name.trim().length < 2) {
      throw new Error('Category name must be at least 2 characters long');
    }

    if (!slug || slug.trim().length < 2) {
      throw new Error('Slug must be at least 2 characters long');
    }

    if (!type || !['material', 'type', 'collection'].includes(type)) {
      throw new Error('Type must be one of: material, type, collection');
    }

    const slugExists = await categoryRepository.checkSlugExists(slug);
    if (slugExists) {
      throw new Error('Slug already exists');
    }

    const categoryId = await categoryRepository.createCategory(name, slug, description || '', type);
    return { categoryId, message: 'Category created successfully' };
  }

  // Get category by ID
  async getCategoryById(categoryId) {
    if (!Number.isInteger(parseInt(categoryId))) {
      throw new Error('Invalid category ID');
    }

    const category = await categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  // Get category by slug
  async getCategoryBySlug(slug) {
    const category = await categoryRepository.getCategoryBySlug(slug);
    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  // Get all categories with pagination
  async getAllCategories(limit = 20, offset = 0) {
    const categories = await categoryRepository.getCategoriesWithCount(limit, offset);
    const total = await categoryRepository.getCategoryCount();

    return {
      categories,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Update category
  async updateCategory(categoryId, data) {
    const { name, slug, description, type, is_active } = data;

    const category = await categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    if (name && name.trim().length < 2) {
      throw new Error('Category name must be at least 2 characters long');
    }

    if (slug) {
      const slugExists = await categoryRepository.checkSlugExists(slug, categoryId);
      if (slugExists) {
        throw new Error('Slug already exists');
      }
    }

    if (type && !['material', 'type', 'collection'].includes(type)) {
      throw new Error('Type must be one of: material, type, collection');
    }

    const updateData = {
      name: name || category.name,
      slug: slug || category.slug,
      description: description !== undefined ? description : category.description,
      type: type || category.type,
      is_active: is_active !== undefined ? is_active : category.is_active
    };

    await categoryRepository.updateCategory(categoryId, updateData);
    return await this.getCategoryById(categoryId);
  }

  // Delete category
  async deleteCategory(categoryId) {
    const category = await categoryRepository.getCategoryById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    await categoryRepository.deleteCategory(categoryId);
    return { message: 'Category deleted successfully' };
  }

  // Get categories by type
  async getCategoriesByType(type, limit = 20, offset = 0) {
    if (!['material', 'type', 'collection'].includes(type)) {
      throw new Error('Type must be one of: material, type, collection');
    }

    const categories = await categoryRepository.getCategoriesByType(type, limit, offset);
    const total = await categoryRepository.getCategoriesByTypeCount(type);

    return {
      categories,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  // Get active categories
  async getActiveCategories(limit = 50, offset = 0) {
    const categories = await categoryRepository.getActiveCategories(limit, offset);
    const total = await categoryRepository.getActiveCategoriesCount();

    return {
      categories,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }
}

module.exports = new CategoryService();
