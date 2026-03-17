export class URLMetadataService {
  /**
   * Extranct metadata from a given URL using OpenGraph and other common tags.
   * @param {string} url 
   * @returns {Promise<object>}
   */
  async extract(url) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
      });
      const html = await response.text();

      const getMeta = (property) => {
        const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
                      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i')) ||
                      html.match(new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i')) ||
                      html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'));
        return match ? match[1] : null;
      };

      const getTitle = () => {
        const match = html.match(/<title>([^<]+)<\/title>/i);
        return match ? match[1] : null;
      };

      // Specific extraction for Amazon (heuristic)
      const amazonTitle = html.match(/id="productTitle"[^>]*>\s*([^<]+)\s*<\/span>/i);
      const amazonImage = html.match(/id="landingImage"[^>]*data-old-hires=["']([^"']+)["']/i) || 
                          html.match(/id="imgBlkFront"[^>]*src=["']([^"']+)["']/i);

      return {
        title: amazonTitle ? amazonTitle[1].trim() : (getMeta('og:title') || getTitle()),
        image: amazonImage ? amazonImage[1] : (getMeta('og:image') || getMeta('twitter:image')),
        description: getMeta('og:description') || getMeta('description'),
        site_name: getMeta('og:site_name')
      };
    } catch (error) {
      console.error('Error extracting metadata:', error);
      throw new Error('No se pudo extraer información del enlace proporcionado');
    }
  }
}
