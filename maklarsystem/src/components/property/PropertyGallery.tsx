/**
 * PropertyGallery - Advanced image gallery for property listings
 * 
 * Features modal viewing, fullscreen, thumbnails navigation, 
 * and keyboard controls with Swedish translations.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  Star,
  Eye,
  Grid3X3,
  RotateCw,
  Download,
  Share2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyGalleryProps, PropertyImage } from '@/types/property.types';

// ============================================================
// GLASSMORPHISM STYLES
// ============================================================

const glassStyles = {
  container: cn(
    "relative",
    "backdrop-blur-xl",
    "bg-white/10",
    "border border-white/20",
    "shadow-2xl",
    "rounded-2xl",
    "overflow-hidden"
  ),
  thumbnail: cn(
    "relative cursor-pointer",
    "bg-white/5 backdrop-blur-sm",
    "border border-white/10",
    "rounded-lg overflow-hidden",
    "transition-all duration-200",
    "hover:bg-white/20 hover:border-white/30",
    "hover:scale-105"
  ),
  thumbnailActive: "ring-2 ring-blue-400/70 bg-blue-500/20",
  thumbnailPrimary: "ring-2 ring-yellow-400/70",
  modal: cn(
    "fixed inset-0 z-50",
    "bg-black/80 backdrop-blur-sm",
    "flex items-center justify-center",
    "p-4"
  ),
  modalContent: cn(
    "relative w-full max-w-7xl max-h-[90vh]",
    "bg-black/40 backdrop-blur-xl",
    "border border-white/10",
    "rounded-2xl overflow-hidden",
    "shadow-3xl"
  ),
  mainImage: cn(
    "relative w-full",
    "bg-black/20",
    "flex items-center justify-center"
  ),
  controls: cn(
    "absolute inset-0 opacity-0",
    "hover:opacity-100 transition-opacity duration-300",
    "pointer-events-none"
  ),
  controlsContent: "pointer-events-auto",
  button: cn(
    "p-3 rounded-full",
    "bg-black/50 hover:bg-black/70",
    "text-white",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "disabled:opacity-30 disabled:cursor-not-allowed"
  ),
  navButton: cn(
    "absolute top-1/2 -translate-y-1/2",
    "p-4 rounded-full",
    "bg-black/60 hover:bg-black/80",
    "text-white text-xl",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "disabled:opacity-30 disabled:cursor-not-allowed"
  ),
  bottomBar: cn(
    "absolute bottom-0 left-0 right-0",
    "bg-gradient-to-t from-black/80 to-transparent",
    "p-6"
  ),
  thumbnailStrip: cn(
    "flex gap-2 overflow-x-auto scrollbar-hide",
    "pb-2"
  ),
  caption: "text-white text-center mt-2 text-sm",
  imageInfo: "text-white/70 text-xs text-center",
  gridContainer: "grid gap-4",
  gridCols: {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2", 
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  },
  aspectRatio: {
    square: "aspect-square",
    video: "aspect-video", 
    auto: "aspect-auto",
    portrait: "aspect-[3/4]"
  },
  badge: cn(
    "absolute top-2 right-2",
    "px-2 py-1 rounded-full",
    "text-xs font-medium",
    "bg-black/50 text-white backdrop-blur-sm"
  )
};

// ============================================================
// TYPES
// ============================================================

interface GalleryState {
  isModalOpen: boolean;
  currentIndex: number;
  zoom: number;
  rotation: number;
  isFullscreen: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function PropertyGallery({
  images,
  title,
  viewMode = 'grid',
  columns = 3,
  aspectRatio = 'video',
  showThumbnails = true,
  enableZoom = true,
  enableFullscreen = true,
  enableDownload = false,
  enableShare = false,
  onImageClick,
  onShare,
  onDownload,
  className
}: PropertyGalleryProps) {
  const [state, setState] = useState<GalleryState>({
    isModalOpen: false,
    currentIndex: 0,
    zoom: 1,
    rotation: 0,
    isFullscreen: false
  });

  // Get current image
  const currentImage = images[state.currentIndex];
  const hasPreviousImage = state.currentIndex > 0;
  const hasNextImage = state.currentIndex < images.length - 1;

  // Modal control functions
  const openModal = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      isModalOpen: true,
      currentIndex: index,
      zoom: 1,
      rotation: 0
    }));
    onImageClick?.(images[index], index);
  }, [images, onImageClick]);

  const closeModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isModalOpen: false,
      zoom: 1,
      rotation: 0,
      isFullscreen: false
    }));
  }, []);

  const previousImage = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.max(0, prev.currentIndex - 1),
      zoom: 1,
      rotation: 0
    }));
  }, []);

  const nextImage = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentIndex: Math.min(images.length - 1, prev.currentIndex + 1),
      zoom: 1,
      rotation: 0
    }));
  }, [images.length]);

  const zoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.5, 5)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.5, 0.5)
    }));
  }, []);

  const rotate = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }));
  }, []);

  const toggleFullscreen = useCallback(() => {
    setState(prev => ({
      ...prev,
      isFullscreen: !prev.isFullscreen
    }));
  }, []);

  const goToImage = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentIndex: index,
      zoom: 1,
      rotation: 0
    }));
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!state.isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          if (hasPreviousImage) previousImage();
          break;
        case 'ArrowRight':
          if (hasNextImage) nextImage();
          break;
        case '+':
        case '=':
          if (enableZoom) zoomIn();
          break;
        case '-':
          if (enableZoom) zoomOut();
          break;
        case 'r':
        case 'R':
          rotate();
          break;
        case 'f':
        case 'F':
          if (enableFullscreen) toggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    state.isModalOpen,
    hasPreviousImage,
    hasNextImage,
    enableZoom,
    enableFullscreen,
    closeModal,
    previousImage,
    nextImage,
    zoomIn,
    zoomOut,
    rotate,
    toggleFullscreen
  ]);

  // Handle share
  const handleShare = useCallback(async (image: PropertyImage) => {
    if (navigator.share && enableShare) {
      try {
        await navigator.share({
          title: image.caption || title || 'Fastighetsbild',
          text: `Kolla in denna bild: ${image.caption || 'Fastighetsbild'}`,
          url: image.url
        });
      } catch (err) {
        // Fallback to custom share function
        onShare?.(image);
      }
    } else {
      onShare?.(image);
    }
  }, [enableShare, title, onShare]);

  // Handle download
  const handleDownload = useCallback(async (image: PropertyImage) => {
    if (enableDownload) {
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title || 'fastighetsbild'}-${image.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        onDownload?.(image);
      } catch (err) {
        onDownload?.(image);
      }
    }
  }, [enableDownload, title, onDownload]);

  if (images.length === 0) {
    return (
      <div className={cn(glassStyles.container, "p-12", className)}>
        <div className="text-center">
          <div className="p-4 bg-white/5 rounded-full inline-block mb-4">
            <Eye size={48} className="text-white/50" />
          </div>
          <img
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            alt="Ingen bild tillgänglig"
            width={1}
            height={1}
            style={{ opacity: 0 }}
          />
          <h3 className="text-white text-lg font-medium mb-2">
            Inga bilder tillgängliga
          </h3>
          <p className="text-white/60 text-sm">
            Det finns inga bilder att visa för detta objekt.
          </p>
        </div>
      </div>
    );
  }

  const gridImages = images
    .filter(img => !img.isFloorplan)
    .filter(img => (img.thumbnailUrl || img.url));

  if (gridImages.length === 0) {
    return (
      <div className={cn(glassStyles.container, "p-12", className)}>
        <div className="text-center">
          <div className="p-4 bg-white/5 rounded-full inline-block mb-4">
            <Eye size={48} className="text-white/50" />
          </div>
          <img
            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
            alt="Ingen bild tillgänglig"
            width={1}
            height={1}
            style={{ opacity: 0 }}
          />
          <h3 className="text-white text-lg font-medium mb-2">
            Inga bilder tillgängliga
          </h3>
          <p className="text-white/60 text-sm">
            Det finns inga bilder att visa för detta objekt.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid */}
      <div className={cn(glassStyles.container, className)}>
        {!state.isModalOpen && (
          <div
            role="region"
            aria-label={title ? `${title} bildgalleri` : 'Bildgalleri'}
            className={cn(
              glassStyles.gridContainer,
              glassStyles.gridCols[columns as keyof typeof glassStyles.gridCols],
              viewMode === 'carousel' && 'relative',
              viewMode === 'masonry' && 'columns-1 md:columns-2 lg:columns-3',
              "p-4"
            )}
          >
            {/* Carousel navigation controls (outside modal) */}
            {viewMode === 'carousel' && (
              <div className="absolute inset-y-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 pointer-events-none">
                <button onClick={previousImage} className={cn(glassStyles.navButton, 'static pointer-events-auto')} aria-label="Föregående bild">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextImage} className={cn(glassStyles.navButton, 'static pointer-events-auto')} aria-label="Nästa bild">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
            {gridImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  glassStyles.thumbnail,
                  glassStyles.aspectRatio[aspectRatio as keyof typeof glassStyles.aspectRatio] || glassStyles.aspectRatio.video,
                  index === state.currentIndex && state.isModalOpen && glassStyles.thumbnailActive,
                  image.isPrimary && glassStyles.thumbnailPrimary
                )}
                onClick={() => openModal(index)}
                data-testid={`image-container-${index}`}
              >
                <Image
                  src={image.thumbnailUrl || image.url}
                  alt={image.caption || `Bild ${index + 1}`}
                  fill
                  loading="lazy"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes={`(max-width: 768px) 100vw, (max-width: 1200px) ${100/columns}vw, ${100/columns}vw`}
                />
                
                {/* Badges */}
                {image.isPrimary && (
                  <div className={cn(glassStyles.badge, "bg-yellow-500/90")}>
                    <Star size={12} className="inline mr-1" />
                    Huvudbild
                  </div>
                )}
                
                {image.isFloorplan && (
                  <div className={cn(glassStyles.badge, "top-2 left-2 bg-blue-500/90")}>
                    <Grid3X3 size={12} className="inline mr-1" />
                    Planlösning
                  </div>
                )}

                {/* Caption overlay */}
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-xs line-clamp-2">
                      {image.caption}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Image counter */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {gridImages.length} {gridImages.length === 1 ? 'bild' : 'bilder'}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {state.isModalOpen && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(glassStyles.modal, state.isFullscreen && "p-0")}
            role="dialog"
            aria-label="Bildvisning"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                glassStyles.modalContent,
                state.isFullscreen && "max-w-none max-h-none rounded-none border-0"
              )}
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                aria-label="Stäng galleri"
              >
                <X size={24} />
              </button>

              {/* Main image */}
              <div className={cn(glassStyles.mainImage, "min-h-[60vh]")}>
                <div 
                  className="relative transform transition-transform duration-300"
                  style={{ 
                    transform: `scale(${state.zoom}) rotate(${state.rotation}deg)`,
                    transformOrigin: 'center'
                  }}
                >
                  <Image
                    src={currentImage.url}
                    alt={currentImage.caption || `Bild ${state.currentIndex + 1}`}
                    width={currentImage.width || 800}
                    height={currentImage.height || 600}
                    className="max-w-full max-h-[80vh] object-contain"
                    priority
                  />
                </div>

                {/* Navigation controls */}
                <div className={glassStyles.controls}>
                  <div className={glassStyles.controlsContent}>
                    {/* Previous button */}
                    {hasPreviousImage && (
                      <button
                        onClick={previousImage}
                        className={cn(glassStyles.navButton, "left-4")}
                        aria-label="Föregående bild"
                      >
                        <ChevronLeft size={32} />
                      </button>
                    )}

                    {/* Next button */}
                    {hasNextImage && (
                      <button
                        onClick={nextImage}
                        className={cn(glassStyles.navButton, "right-4")}
                        aria-label="Nästa bild"
                      >
                        <ChevronRight size={32} />
                      </button>
                    )}

                    {/* Top controls */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      {enableZoom && (
                        <>
                          <button
                            onClick={zoomOut}
                            disabled={state.zoom <= 0.5}
                            className={glassStyles.button}
                            title="Zooma ut"
                          >
                            <ZoomOut size={20} />
                          </button>
                          <button
                            onClick={zoomIn}
                            disabled={state.zoom >= 5}
                            className={glassStyles.button}
                            title="Zooma in"
                          >
                            <ZoomIn size={20} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={rotate}
                        className={glassStyles.button}
                        title="Rotera bild"
                      >
                        <RotateCw size={20} />
                      </button>

                      {enableFullscreen && (
                        <button
                          onClick={toggleFullscreen}
                          className={glassStyles.button}
                          title="Helskärm"
                        >
                          <Maximize2 size={20} />
                        </button>
                      )}

                      {enableShare && (
                        <button
                          onClick={() => handleShare(currentImage)}
                          className={glassStyles.button}
                          title="Dela bild"
                        >
                          <Share2 size={20} />
                        </button>
                      )}

                      {enableDownload && (
                        <button
                          onClick={() => handleDownload(currentImage)}
                          className={glassStyles.button}
                          title="Ladda ner bild"
                        >
                          <Download size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar with thumbnails and info */}
              {!state.isFullscreen && (
                <div className={glassStyles.bottomBar}>
                  {/* Image info */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white text-sm font-medium">
                        Bild {state.currentIndex + 1} av {images.length}
                      </p>
                      <div className="flex items-center gap-2 text-white/60 text-xs">
                        {currentImage.width && currentImage.height && (
                          <span>{currentImage.width} × {currentImage.height}</span>
                        )}
                        {currentImage.sizeBytes && (
                          <span>
                            {(currentImage.sizeBytes / 1024 / 1024).toFixed(1)} MB
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {currentImage.caption && (
                      <p className={glassStyles.caption}>
                        {currentImage.caption}
                      </p>
                    )}
                  </div>

                  {/* Thumbnail navigation */}
                  {showThumbnails && images.length > 1 && (
                    <div className={glassStyles.thumbnailStrip} role="navigation" aria-label="Bildgalleri för miniatyrbilder">
                      {images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => goToImage(index)}
                          className={cn(
                            "relative w-16 h-12 rounded border-2 transition-colors overflow-hidden flex-shrink-0",
                            index === state.currentIndex 
                              ? "border-blue-400" 
                              : "border-white/30 hover:border-white/60"
                          )}
                        >
                          <Image
                            src={image.thumbnailUrl || image.url}
                            alt={`Miniatyr ${index + 1}`}
                            fill
                            loading="lazy"
                            className="object-cover"
                            sizes="64px"
                          />
                          {image.isPrimary && (
                            <div className="absolute top-0 right-0 bg-yellow-500 rounded-full p-1">
                              <Star size={8} className="text-black" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Keyboard shortcuts info */}
                  <div className="mt-3 text-center">
                    <p className="text-white/50 text-xs">
                      Använd piltangenterna för att navigera • ESC för att stänga • + / - för zoom
                      {enableFullscreen && ' • F för helskärm'}
                      {' • R för att rotera'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}