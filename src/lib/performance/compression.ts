import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';

interface CompressionOptions {
  threshold?: number; // Minimum size in bytes to compress (default: 1024)
  level?: number; // Compression level 0-9 (default: 6)
  memLevel?: number; // Memory level 1-9 (default: 8)
  strategy?: number; // Compression strategy (default: Z_DEFAULT_STRATEGY)
  enabledMimeTypes?: string[]; // MIME types to compress
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  threshold: 1024, // 1KB
  level: 6,
  memLevel: 8,
  strategy: 0, // Z_DEFAULT_STRATEGY
  enabledMimeTypes: [
    'text/html',
    'text/css',
    'text/plain',
    'text/xml',
    'text/javascript',
    'application/javascript',
    'application/json',
    'application/xml',
    'application/rss+xml',
    'application/atom+xml',
    'application/x-font-ttf',
    'application/x-font-opentype',
    'application/vnd.ms-fontobject',
    'image/svg+xml',
    'image/x-icon',
  ],
};

export class CompressionMiddleware {
  private options: Required<CompressionOptions>;

  constructor(options: CompressionOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options } as Required<CompressionOptions>;
  }

  /**
   * Check if content should be compressed
   */
  private shouldCompress(
    contentType: string | null,
    contentLength: number,
    acceptEncoding: string | null
  ): boolean {
    // Check if client accepts compression
    if (!acceptEncoding || !acceptEncoding.includes('gzip')) {
      return false;
    }

    // Check content length threshold
    if (contentLength < this.options.threshold) {
      return false;
    }

    // Check content type
    if (!contentType) {
      return false;
    }

    const mimeType = contentType.split(';')[0].trim();
    return this.options.enabledMimeTypes!.includes(mimeType);
  }

  /**
   * Compress response body
   */
  private async compressBody(body: string | Buffer): Promise<Buffer> {
    const { promisify } = require('util');
    const zlib = require('zlib');
    const gzip = promisify(zlib.gzip);

    const input = typeof body === 'string' ? Buffer.from(body) : body;
    
    return gzip(input, {
      level: this.options.level,
      memLevel: this.options.memLevel,
    });
  }

  /**
   * Apply compression middleware
   */
  async middleware(
    req: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const response = await handler(req);
    
    // Skip if already encoded
    if (response.headers.get('content-encoding')) {
      return response;
    }

    const acceptEncoding = req.headers.get('accept-encoding');
    const contentType = response.headers.get('content-type');
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);

    // Check if we should compress
    if (!this.shouldCompress(contentType, contentLength, acceptEncoding)) {
      return response;
    }

    try {
      // Get response body
      const originalBody = await response.text();
      
      // Compress body
      const compressedBody = await this.compressBody(originalBody);
      
      // Create new response with compressed body
      const compressedResponse = new NextResponse(compressedBody, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });

      // Update headers
      compressedResponse.headers.set('content-encoding', 'gzip');
      compressedResponse.headers.set('content-length', compressedBody.length.toString());
      compressedResponse.headers.delete('content-length'); // Let Next.js handle this
      compressedResponse.headers.set('vary', 'Accept-Encoding');

      return compressedResponse;
    } catch (error) {
      console.error('Compression error:', error);
      // Return original response on error
      return response;
    }
  }
}

// Default compression instance
export const compressionMiddleware = new CompressionMiddleware();

/**
 * Middleware wrapper for easy use
 */
export async function withCompression(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options?: CompressionOptions
): Promise<NextResponse> {
  const compression = options ? new CompressionMiddleware(options) : compressionMiddleware;
  return compression.middleware(req, handler);
}

/**
 * Response helpers for manual compression
 */
export const compressionHelpers = {
  /**
   * Create a compressed JSON response
   */
  async compressedJson(
    data: any,
    init?: ResponseInit,
    acceptEncoding?: string | null
  ): Promise<NextResponse> {
    const jsonString = JSON.stringify(data);
    
    if (!acceptEncoding?.includes('gzip')) {
      return NextResponse.json(data, init);
    }

    const { promisify } = require('util');
    const zlib = require('zlib');
    const gzip = promisify(zlib.gzip);
    
    const compressed = await gzip(Buffer.from(jsonString));
    
    const response = new NextResponse(compressed, {
      ...init,
      headers: {
        ...init?.headers,
        'content-type': 'application/json',
        'content-encoding': 'gzip',
        'vary': 'Accept-Encoding',
      },
    });
    
    return response;
  },

  /**
   * Check if a request accepts gzip
   */
  acceptsGzip(req: NextRequest): boolean {
    const acceptEncoding = req.headers.get('accept-encoding');
    return acceptEncoding?.includes('gzip') || false;
  },

  /**
   * Get compression ratio
   */
  getCompressionRatio(originalSize: number, compressedSize: number): number {
    if (originalSize === 0) return 0;
    return ((originalSize - compressedSize) / originalSize) * 100;
  },
};