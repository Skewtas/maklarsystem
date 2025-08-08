/**
 * PropertyGallery Component Tests
 * 
 * Tests for the image gallery component including modal functionality,
 * navigation, zoom features, and accessibility.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { PropertyGallery } from '../PropertyGallery';
import type { PropertyImage } from '@/types/property.types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn()
  })
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

// Mock window methods
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const mockImages: PropertyImage[] = [
  {
    id: '1',
    url: 'https://example.com/image1.jpg',
    thumbnailUrl: 'https://example.com/thumb1.jpg',
    caption: 'Vardagsrum med öppen spis',
    isPrimary: true,
    isFloorplan: false,
    displayOrder: 1,
    width: 800,
    height: 600,
    mimeType: 'image/jpeg'
  },
  {
    id: '2',
    url: 'https://example.com/image2.jpg',
    thumbnailUrl: 'https://example.com/thumb2.jpg',
    caption: 'Kök med köksö',
    isPrimary: false,
    isFloorplan: false,
    displayOrder: 2,
    width: 800,
    height: 600,
    mimeType: 'image/jpeg'
  },
  {
    id: '3',
    url: 'https://example.com/floorplan.jpg',
    thumbnailUrl: 'https://example.com/floorplan_thumb.jpg',
    caption: 'Planlösning',
    isPrimary: false,
    isFloorplan: true,
    displayOrder: 3,
    width: 1200,
    height: 900,
    mimeType: 'image/jpeg'
  }
];

describe('PropertyGallery', () => {
  const defaultProps = {
    images: mockImages,
    title: 'Test Property Gallery'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ============================================================
  // BASIC RENDERING TESTS
  // ============================================================

  it('should render gallery with images', () => {
    render(<PropertyGallery {...defaultProps} />);
    
    expect(screen.getByRole('region', { name: /bildgalleri/i })).toBeInTheDocument();
    
    // Should show all non-floorplan images in grid
    const regularImages = mockImages.filter(img => !img.isFloorplan);
    const imageElements = screen.getAllByRole('img');
    expect(imageElements).toHaveLength(regularImages.length);
  });

  it('should render with custom title', () => {
    render(<PropertyGallery {...defaultProps} title="Elegant 3:a på Strandvägen" />);
    
    expect(screen.getByRole('region', { name: /elegant 3:a på strandvägen bildgalleri/i }))
      .toBeInTheDocument();
  });

  it('should render empty state when no images provided', () => {
    render(<PropertyGallery images={[]} title="Empty Gallery" />);
    
    expect(screen.getByText(/inga bilder tillgängliga/i)).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Ingen bild tillgänglig');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PropertyGallery {...defaultProps} className="custom-gallery" />
    );
    
    expect(container.firstChild).toHaveClass('custom-gallery');
  });

  // ============================================================
  // VIEW MODE TESTS
  // ============================================================

  it('should render grid view by default', () => {
    render(<PropertyGallery {...defaultProps} />);
    
    expect(screen.getByRole('region')).toHaveClass('grid');
  });

  it('should render carousel view when specified', () => {
    render(<PropertyGallery {...defaultProps} viewMode="carousel" />);
    
    const carousel = screen.getByRole('region');
    expect(carousel).toHaveClass('relative');
    
    // Should show navigation buttons
    expect(screen.getByRole('button', { name: /föregående bild/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nästa bild/i })).toBeInTheDocument();
  });

  it('should render masonry layout when specified', () => {
    render(<PropertyGallery {...defaultProps} viewMode="masonry" />);
    
    // Masonry layout should have specific classes
    const gallery = screen.getByRole('region');
    expect(gallery).toHaveClass('columns-1', 'md:columns-2', 'lg:columns-3');
  });

  it('should respect column settings in grid view', () => {
    render(<PropertyGallery {...defaultProps} columns={4} />);
    
    const gallery = screen.getByRole('region');
    expect(gallery).toHaveClass('md:grid-cols-2', 'lg:grid-cols-4');
  });

  // ============================================================
  // INTERACTION TESTS
  // ============================================================

  it('should open modal when image is clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyGallery {...defaultProps} />);
    
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    // Modal should be open
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /bildvisning/i })).toBeInTheDocument();
    });
    
    // Should show the clicked image in modal
    expect(screen.getByAltText('Vardagsrum med öppen spis')).toBeInTheDocument();
  });

  it('should navigate between images in modal', async () => {
    const user = userEvent.setup();
    render(<PropertyGallery {...defaultProps} />);
    
    // Open modal
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Navigate to next image
    const nextButton = screen.getByRole('button', { name: /nästa bild/i });
    await user.click(nextButton);
    
    // Should show second image
    expect(screen.getByAltText('Kök med köksö')).toBeInTheDocument();
  });

  it('should close modal with escape key', async () => {
    const user = userEvent.setup();
    render(<PropertyGallery {...defaultProps} />);
    
    // Open modal
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Press escape
    await user.keyboard('{Escape}');
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close modal when clicking backdrop', async () => {
    const user = userEvent.setup();
    render(<PropertyGallery {...defaultProps} />);
    
    // Open modal
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Click backdrop (modal container)
    const modal = screen.getByRole('dialog');
    await user.click(modal);
    
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // ============================================================
  // KEYBOARD NAVIGATION TESTS
  // ============================================================

  it('should support arrow key navigation in modal', async () => {
    const user = userEvent.setup();
    render(<PropertyGallery {...defaultProps} />);
    
    // Open modal
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Press right arrow
    await user.keyboard('{ArrowRight}');
    expect(screen.getByAltText('Kök med köksö')).toBeInTheDocument();
    
    // Press left arrow
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByAltText('Vardagsrum med öppen spis')).toBeInTheDocument();
  });

  it('should focus management in modal', async () => {
    const user = userEvent.setup();
    render(<PropertyGallery {...defaultProps} />);
    
    // Open modal
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Close button should be focusable
    const closeButton = screen.getByRole('button', { name: /stäng/i });
    expect(closeButton).toBeInTheDocument();
    
    // Tab should cycle through modal controls
    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  // ============================================================
  // THUMBNAILS TESTS
  // ============================================================

  it('should show thumbnails when enabled', () => {
    render(<PropertyGallery {...defaultProps} showThumbnails={true} />);
    
    // Open modal to see thumbnails
    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);
    
    // Should have thumbnail navigation
    waitFor(() => {
      expect(screen.getByRole('navigation', { name: /miniatyrbilder/i })).toBeInTheDocument();
    });
  });

  it('should hide thumbnails when disabled', async () => {
    render(<PropertyGallery {...defaultProps} showThumbnails={false} />);
    
    // Open modal
    const firstImage = screen.getAllByRole('img')[0];
    fireEvent.click(firstImage);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Should not have thumbnail navigation
    expect(screen.queryByRole('navigation', { name: /miniatyrbilder/i }))
      .not.toBeInTheDocument();
  });

  // ============================================================
  // ASPECT RATIO TESTS
  // ============================================================

  it('should apply square aspect ratio when specified', () => {
    render(<PropertyGallery {...defaultProps} aspectRatio="square" />);
    
    const imageContainers = screen.getAllByTestId(/image-container/i);
    imageContainers.forEach(container => {
      expect(container).toHaveClass('aspect-square');
    });
  });

  it('should apply portrait aspect ratio when specified', () => {
    render(<PropertyGallery {...defaultProps} aspectRatio="portrait" />);
    
    const imageContainers = screen.getAllByTestId(/image-container/i);
    imageContainers.forEach(container => {
      expect(container).toHaveClass('aspect-[3/4]');
    });
  });

  // ============================================================
  // CALLBACK TESTS
  // ============================================================

  it('should call onImageClick when image is clicked', async () => {
    const onImageClick = jest.fn();
    const user = userEvent.setup();
    
    render(
      <PropertyGallery 
        {...defaultProps} 
        onImageClick={onImageClick}
      />
    );
    
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    expect(onImageClick).toHaveBeenCalledWith(mockImages[0], 0);
  });

  it('should call onShare when share is enabled and clicked', async () => {
    const onShare = jest.fn();
    const user = userEvent.setup();
    
    render(
      <PropertyGallery 
        {...defaultProps} 
        enableShare={true}
        onShare={onShare}
      />
    );
    
    // Open modal
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Click share button
    const shareButton = screen.getByRole('button', { name: /dela/i });
    await user.click(shareButton);
    
    expect(onShare).toHaveBeenCalledWith(mockImages[0]);
  });

  it('should call onDownload when download is enabled and clicked', async () => {
    const onDownload = jest.fn();
    const user = userEvent.setup();
    
    render(
      <PropertyGallery 
        {...defaultProps} 
        enableDownload={true}
        onDownload={onDownload}
      />
    );
    
    // Open modal
    const firstImage = screen.getAllByRole('img')[0];
    await user.click(firstImage);
    
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    
    // Click download button
    const downloadButton = screen.getByRole('button', { name: /ladda ner/i });
    await user.click(downloadButton);
    
    expect(onDownload).toHaveBeenCalledWith(mockImages[0]);
  });

  // ============================================================
  // ACCESSIBILITY TESTS
  // ============================================================

  it('should have proper ARIA labels', () => {
    render(<PropertyGallery {...defaultProps} />);
    
    // Gallery should have region role with label
    expect(screen.getByRole('region', { name: /bildgalleri/i })).toBeInTheDocument();
    
    // Images should have alt text
    const images = screen.getAllByRole('img');
    images.forEach((img, index) => {
      expect(img).toHaveAttribute('alt');
    });
  });

  it('should announce image count to screen readers', () => {
    render(<PropertyGallery {...defaultProps} />);
    
    // Should have accessible description of image count
    const regularImages = mockImages.filter(img => !img.isFloorplan);
    expect(screen.getByText(`${regularImages.length} bilder`)).toBeInTheDocument();
  });

  it('should support high contrast mode', () => {
    // Mock high contrast preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => {
        if (query.includes('prefers-contrast')) {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
          };
        }
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        };
      }),
    });
    
    render(<PropertyGallery {...defaultProps} />);
    
    // Should render without errors in high contrast mode
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  // ============================================================
  // ERROR HANDLING TESTS
  // ============================================================

  it('should handle image load errors gracefully', async () => {
    render(<PropertyGallery {...defaultProps} />);
    
    const firstImage = screen.getAllByRole('img')[0];
    
    // Simulate image load error
    fireEvent.error(firstImage);
    
    // Should still be in the document
    expect(firstImage).toBeInTheDocument();
  });

  it('should handle missing image URLs', () => {
    const imagesWithMissingUrl = [
      {
        ...mockImages[0],
        url: '',
        thumbnailUrl: ''
      }
    ];
    
    render(<PropertyGallery images={imagesWithMissingUrl} title="Test" />);
    
    // Should render placeholder
    expect(screen.getByText(/inga bilder tillgängliga/i)).toBeInTheDocument();
  });

  // ============================================================
  // PERFORMANCE TESTS
  // ============================================================

  it('should lazy load images outside viewport', () => {
    render(<PropertyGallery {...defaultProps} />);
    
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('should use thumbnail URLs for initial load', () => {
    render(<PropertyGallery {...defaultProps} />);
    
    const images = screen.getAllByRole('img');
    images.forEach((img, index) => {
      const expectedSrc = mockImages.filter(i => !i.isFloorplan)[index]?.thumbnailUrl || 
                         mockImages.filter(i => !i.isFloorplan)[index]?.url;
      expect(img).toHaveAttribute('src', expectedSrc);
    });
  });

  // ============================================================
  // RESPONSIVE TESTS
  // ============================================================

  it('should adapt to mobile viewport', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375
    });
    
    render(<PropertyGallery {...defaultProps} />);
    
    const gallery = screen.getByRole('region');
    expect(gallery).toHaveClass('grid-cols-1');
  });

  it('should show appropriate number of columns on different screen sizes', () => {
    render(<PropertyGallery {...defaultProps} columns={3} />);
    
    const gallery = screen.getByRole('region');
    // Should have responsive classes
    expect(gallery).toHaveClass('md:grid-cols-2', 'lg:grid-cols-3');
  });
});