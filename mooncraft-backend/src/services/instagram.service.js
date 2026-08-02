const GRAPH_API_VERSION = 'v19.0';
const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

class InstagramService {
  isConfigured() {
    return !!(process.env.INSTAGRAM_USER_ID && process.env.META_PAGE_ACCESS_TOKEN);
  }

  // Two-step publish: create a media container, then publish it.
  // Never throws - callers must be able to save the product regardless of
  // whether the Instagram post succeeds.
  async publishImage(imageUrl, caption) {
    const igUserId = process.env.INSTAGRAM_USER_ID;
    const accessToken = process.env.META_PAGE_ACCESS_TOKEN;

    if (!igUserId || !accessToken) {
      return {
        success: false,
        error: 'Instagram is not configured (missing INSTAGRAM_USER_ID or META_PAGE_ACCESS_TOKEN)'
      };
    }

    try {
      const creationId = await this.createMediaContainer(igUserId, accessToken, imageUrl, caption);
      const postId = await this.publishMediaContainer(igUserId, accessToken, creationId);
      return { success: true, postId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async createMediaContainer(igUserId, accessToken, imageUrl, caption) {
    const response = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
      method: 'POST',
      body: new URLSearchParams({
        image_url: imageUrl,
        caption: caption || '',
        access_token: accessToken
      })
    });

    const data = await response.json();
    if (!response.ok || !data.id) {
      throw new Error(data.error?.message || 'Failed to create Instagram media container');
    }
    return data.id;
  }

  async publishMediaContainer(igUserId, accessToken, creationId) {
    const response = await fetch(`${GRAPH_API_BASE}/${igUserId}/media_publish`, {
      method: 'POST',
      body: new URLSearchParams({
        creation_id: creationId,
        access_token: accessToken
      })
    });

    const data = await response.json();
    if (!response.ok || !data.id) {
      throw new Error(data.error?.message || 'Failed to publish Instagram media');
    }
    return data.id;
  }
}

module.exports = new InstagramService();
