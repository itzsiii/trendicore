import { URLMetadataService } from './URLMetadataService';

// Mock fetch
global.fetch = jest.fn();

describe('URLMetadataService', () => {
  let service;

  beforeEach(() => {
    service = new URLMetadataService();
    fetch.mockClear();
  });

  it('should extract metadata from HTML with open graph tags', async () => {
    const mockHtml = `
      <html>
        <head>
          <meta property="og:title" content="Test Product" />
          <meta property="og:image" content="https://example.com/image.jpg" />
          <meta property="og:description" content="A great test product" />
        </head>
      </html>
    `;

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
    });

    const result = await service.extract('https://example.com/product');

    expect(result).toEqual({
      title: 'Test Product',
      image: 'https://example.com/image.jpg',
      description: 'A great test product',
      site_name: null
    });
  });

  it('should fallback to title tag if og:title is missing', async () => {
    const mockHtml = `
      <html>
        <head>
          <title>Fallback Title</title>
        </head>
      </html>
    `;

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
    });

    const result = await service.extract('https://example.com/product');

    expect(result.title).toBe('Fallback Title');
  });

  it('should extract specific Amazon titles if present', async () => {
    const mockHtml = `
      <html>
        <body>
          <span id="productTitle">   Amazon Real Title   </span>
        </body>
      </html>
    `;

    fetch.mockResolvedValueOnce({
      text: () => Promise.resolve(mockHtml),
    });

    const result = await service.extract('https://amazon.es/dp/B000');

    expect(result.title).toBe('Amazon Real Title');
  });
});
