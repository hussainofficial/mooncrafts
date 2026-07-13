const collectionRepository = require('../repositories/collection.repository');

class CollectionService {
  async createCollection(data) {
    const { name, slug, description, image, is_active } = data;

    if (!name || name.trim().length < 2) {
      throw new Error('Collection name must be at least 2 characters long');
    }

    if (!slug || slug.trim().length < 2) {
      throw new Error('Slug must be at least 2 characters long');
    }

    const slugExists = await collectionRepository.checkSlugExists(slug);
    if (slugExists) {
      throw new Error('Slug already exists');
    }

    const collectionId = await collectionRepository.createCollection(
      name,
      slug,
      description || '',
      image || null,
      is_active !== undefined ? is_active : true
    );
    return { collectionId, message: 'Collection created successfully' };
  }

  async getCollectionById(collectionId) {
    if (!Number.isInteger(parseInt(collectionId))) {
      throw new Error('Invalid collection ID');
    }

    const collection = await collectionRepository.getCollectionById(collectionId);
    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  async getCollectionBySlug(slug) {
    const collection = await collectionRepository.getCollectionBySlug(slug);
    if (!collection) {
      throw new Error('Collection not found');
    }

    return collection;
  }

  async getAllCollections(limit = 20, offset = 0) {
    const collections = await collectionRepository.getAllCollections(limit, offset);
    const total = await collectionRepository.getCollectionCount();

    return {
      collections,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }

  async updateCollection(collectionId, data) {
    const { name, slug, description, image, is_active } = data;

    const collection = await collectionRepository.getCollectionById(collectionId);
    if (!collection) {
      throw new Error('Collection not found');
    }

    if (name && name.trim().length < 2) {
      throw new Error('Collection name must be at least 2 characters long');
    }

    if (slug) {
      const slugExists = await collectionRepository.checkSlugExists(slug, collectionId);
      if (slugExists) {
        throw new Error('Slug already exists');
      }
    }

    const updateData = {
      name: name || collection.name,
      slug: slug || collection.slug,
      description: description !== undefined ? description : collection.description,
      image: image !== undefined ? image : collection.image,
      is_active: is_active !== undefined ? is_active : collection.is_active
    };

    await collectionRepository.updateCollection(collectionId, updateData);
    return await this.getCollectionById(collectionId);
  }

  async deleteCollection(collectionId) {
    const collection = await collectionRepository.getCollectionById(collectionId);
    if (!collection) {
      throw new Error('Collection not found');
    }

    await collectionRepository.deleteCollection(collectionId);
    return { message: 'Collection deleted successfully' };
  }

  async getActiveCollections(limit = 50, offset = 0) {
    const collections = await collectionRepository.getActiveCollections(limit, offset);
    const total = await collectionRepository.getActiveCollectionCount();

    return {
      collections,
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit)
    };
  }
}

module.exports = new CollectionService();
