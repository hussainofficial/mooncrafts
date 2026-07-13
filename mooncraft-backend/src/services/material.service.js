const materialRepository = require('../repositories/material.repository');

class MaterialService {
  async createMaterial(data) {
    const { name, slug, description, image, is_active } = data;

    if (!name || name.trim().length < 2) {
      throw new Error('Material name must be at least 2 characters long');
    }

    if (!slug || slug.trim().length < 2) {
      throw new Error('Slug must be at least 2 characters long');
    }

    const slugExists = await materialRepository.checkSlugExists(slug);
    if (slugExists) {
      throw new Error('Slug already exists');
    }

    const materialId = await materialRepository.createMaterial(
      name,
      slug,
      description || '',
      image || null,
      is_active !== undefined ? is_active : true
    );
    return { materialId, message: 'Material created successfully' };
  }

  async getMaterialById(materialId) {
    if (!Number.isInteger(parseInt(materialId))) {
      throw new Error('Invalid material ID');
    }

    const material = await materialRepository.getMaterialById(materialId);
    if (!material) {
      throw new Error('Material not found');
    }

    return material;
  }

  async getMaterialBySlug(slug) {
    const material = await materialRepository.getMaterialBySlug(slug);
    if (!material) {
      throw new Error('Material not found');
    }

    return material;
  }

  async getAllMaterials(limit = 20, offset = 0) {
    const materials = await materialRepository.getAllMaterials(limit, offset);
    const total = await materialRepository.getMaterialCount();

    return {
      materials,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  async updateMaterial(materialId, data) {
    const { name, slug, description, image, is_active } = data;

    const material = await materialRepository.getMaterialById(materialId);
    if (!material) {
      throw new Error('Material not found');
    }

    if (name && name.trim().length < 2) {
      throw new Error('Material name must be at least 2 characters long');
    }

    if (slug) {
      const slugExists = await materialRepository.checkSlugExists(slug, materialId);
      if (slugExists) {
        throw new Error('Slug already exists');
      }
    }

    const updateData = {
      name: name || material.name,
      slug: slug || material.slug,
      description: description !== undefined ? description : material.description,
      image: image !== undefined ? image : material.image,
      is_active: is_active !== undefined ? is_active : material.is_active
    };

    await materialRepository.updateMaterial(materialId, updateData);
    return await this.getMaterialById(materialId);
  }

  async deleteMaterial(materialId) {
    const material = await materialRepository.getMaterialById(materialId);
    if (!material) {
      throw new Error('Material not found');
    }

    await materialRepository.deleteMaterial(materialId);
    return { message: 'Material deleted successfully' };
  }

  async getActiveMaterials(limit = 50, offset = 0) {
    const materials = await materialRepository.getActiveMaterials(limit, offset);
    const total = await materialRepository.getActiveMaterialCount();

    return {
      materials,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }
}

module.exports = new MaterialService();
