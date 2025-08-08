/**
 * ImagesStep - Property images upload and management step
 * 
 * Handles image upload, reordering, captions, and primary image selection
 */

'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Star, 
  StarOff, 
  Edit3,
  Move,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PropertyImage } from '@/types/property.types';

// ============================================================
// TYPES
// ============================================================

interface ImagesStepProps {
  propertyId?: string;
  readonly?: boolean;
}

// Mock data for demonstration
const MOCK_IMAGES: PropertyImage[] = [
  {
    id: '1',
    propertyId: 'mock',
    url: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/200/150',
    caption: 'Vardagsrum med öppen spis',
    isPrimary: true,
    isFloorplan: false,
    displayOrder: 1,
    width: 400,
    height: 300,
    sizeBytes: 85000,
    createdAt: new Date()
  },
  {
    id: '2',
    propertyId: 'mock',
    url: '/api/placeholder/400/300',
    thumbnailUrl: '/api/placeholder/200/150',
    caption: 'Kök med köksö',
    isPrimary: false,
    isFloorplan: false,
    displayOrder: 2,
    width: 400,
    height: 300,
    sizeBytes: 92000,
    createdAt: new Date()
  }
];

// ============================================================
// GLASSMORPHISM STYLES
// ============================================================

const glassStyles = {
  container: cn(
    "backdrop-blur-xl",
    "bg-white/10",
    "border border-white/20",
    "shadow-2xl",
    "rounded-2xl"
  ),
  dropzone: cn(
    "border-2 border-dashed border-white/30",
    "rounded-xl p-8",
    "bg-white/5",
    "hover:bg-white/10",
    "transition-all duration-200",
    "cursor-pointer",
    "text-center"
  ),
  dropzoneActive: "border-blue-400 bg-blue-500/10",
  imageCard: cn(
    "relative group",
    "bg-white/5 backdrop-blur-sm",
    "border border-white/10",
    "rounded-lg overflow-hidden",
    "transition-all duration-200",
    "hover:bg-white/10 hover:border-white/20"
  ),
  imageCardPrimary: "ring-2 ring-blue-400/50",
  button: cn(
    "px-3 py-2",
    "bg-gradient-to-r from-blue-500/80 to-purple-500/80",
    "hover:from-blue-600/80 hover:to-purple-600/80",
    "text-white font-medium text-sm",
    "rounded-lg",
    "transition-all duration-200",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "flex items-center gap-2"
  ),
  iconButton: cn(
    "p-2",
    "bg-black/50 hover:bg-black/70",
    "text-white",
    "rounded-lg",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50"
  ),
  input: cn(
    "w-full px-3 py-2",
    "bg-white/5",
    "border border-white/10",
    "rounded",
    "text-white text-sm placeholder-white/50",
    "focus:outline-none focus:ring-2 focus:ring-blue-400/50",
    "focus:border-transparent"
  ),
  fieldGroup: "space-y-6",
  helpText: "text-sm text-white/60",
  error: cn(
    "mt-1 text-sm text-red-400",
    "flex items-center gap-1"
  ),
  success: cn(
    "mt-1 text-sm text-green-400",
    "flex items-center gap-1"
  )
};

// ============================================================
// COMPONENT
// ============================================================

export function ImagesStep({
  propertyId,
  readonly = false
}: ImagesStepProps) {
  const [images, setImages] = useState<PropertyImage[]>(MOCK_IMAGES);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');

  // Dropzone configuration
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (readonly || images.length >= 50) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Mock upload process
      for (const file of acceptedFiles.slice(0, 50 - images.length)) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay
        
        const newImage: PropertyImage = {
          id: Math.random().toString(36).substr(2, 9),
          propertyId: propertyId || 'mock',
          url: URL.createObjectURL(file),
          thumbnailUrl: URL.createObjectURL(file),
          caption: '',
          isPrimary: images.length === 0, // First image is primary
          isFloorplan: false,
          displayOrder: images.length + 1,
          width: 400,
          height: 300,
          sizeBytes: file.size,
          createdAt: new Date()
        };

        setImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      setUploadError('Något gick fel vid uppladdning av bilder');
    } finally {
      setIsUploading(false);
    }
  }, [images, propertyId, readonly]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 50 - images.length,
    disabled: readonly || images.length >= 50
  });

  // Image management functions
  const deleteImage = (imageId: string) => {
    if (readonly) return;
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const setPrimaryImage = (imageId: string) => {
    if (readonly) return;
    setImages(prev => prev.map(img => ({
      ...img,
      isPrimary: img.id === imageId
    })));
  };

  const startEditingCaption = (imageId: string, currentCaption?: string) => {
    setEditingCaption(imageId);
    setCaptionText(currentCaption || '');
  };

  const saveCaption = (imageId: string) => {
    if (readonly) return;
    setImages(prev => prev.map(img => 
      img.id === imageId ? { ...img, caption: captionText } : img
    ));
    setEditingCaption(null);
    setCaptionText('');
  };

  const cancelEditing = () => {
    setEditingCaption(null);
    setCaptionText('');
  };

  const moveImage = (imageId: string, direction: 'up' | 'down') => {
    if (readonly) return;
    const currentIndex = images.findIndex(img => img.id === imageId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
    
    // Update display order
    newImages.forEach((img, index) => {
      img.displayOrder = index + 1;
    });
    
    setImages(newImages);
  };

  const primaryImage = images.find(img => img.isPrimary);
  const remainingSlots = 50 - images.length;

  return (
    <div className={glassStyles.fieldGroup}>
      {/* Upload Section */}
      {!readonly && remainingSlots > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Upload size={20} />
            Ladda upp bilder ({images.length}/50)
          </h3>
          
          <div
            {...getRootProps()}
            className={cn(
              glassStyles.dropzone,
              isDragActive && !isDragReject && glassStyles.dropzoneActive,
              isDragReject && "border-red-500 bg-red-500/10"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white/10 rounded-full">
                <Upload size={32} className="text-white" />
              </div>
              
              {isDragActive ? (
                <div className="text-center">
                  <p className="text-white text-lg font-medium">
                    {isDragReject ? 'Filformatet stöds inte' : 'Släpp bilderna här...'}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-white text-lg font-medium mb-2">
                    Dra och släpp bilder här eller klicka för att välja
                  </p>
                  <p className="text-white/60 text-sm">
                    JPEG, PNG eller WebP • Max 10MB per bild • Max {remainingSlots} fler bilder
                  </p>
                </div>
              )}
              
              {!isDragActive && (
                <button
                  type="button"
                  className={glassStyles.button}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Laddar upp...
                    </>
                  ) : (
                    <>
                      <ImageIcon size={16} />
                      Välj bilder
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {uploadError && (
            <p className={glassStyles.error}>
              <AlertCircle size={14} />
              {uploadError}
            </p>
          )}
        </section>
      )}

      {/* Image Guidelines */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-white font-medium mb-3">Riktlinjer för bilder</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/70">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Hög upplösning och god belysning</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Visa alla rum och viktiga områden</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Inkludera exteriörbilder</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Ordna bilder logiskt (entré → kök → vardagsrum)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Använd beskrivande bildtexter</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Sätt den bästa bilden som huvudbild</span>
            </div>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <ImageIcon size={20} />
              Uppladdade bilder ({images.length})
            </h3>
            {primaryImage && (
              <div className="text-sm text-white/60">
                <Star size={14} className="inline mr-1 text-yellow-400" />
                Huvudbild: {primaryImage.caption || 'Utan bildtext'}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  glassStyles.imageCard,
                  image.isPrimary && glassStyles.imageCardPrimary
                )}
              >
                {/* Image */}
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.caption || `Bild ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Primary Badge */}
                  {image.isPrimary && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded text-xs font-medium">
                      <Star size={12} className="inline mr-1" />
                      Huvudbild
                    </div>
                  )}

                  {/* Actions Overlay */}
                  {!readonly && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-2">
                        {/* Move Up */}
                        <button
                          type="button"
                          onClick={() => moveImage(image.id, 'up')}
                          disabled={index === 0}
                          className={cn(glassStyles.iconButton, "disabled:opacity-30")}
                          title="Flytta upp"
                        >
                          <Move size={16} />
                        </button>

                        {/* Set Primary */}
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(image.id)}
                          className={glassStyles.iconButton}
                          title={image.isPrimary ? "Är huvudbild" : "Sätt som huvudbild"}
                        >
                          {image.isPrimary ? (
                            <Star size={16} className="text-yellow-400" />
                          ) : (
                            <StarOff size={16} />
                          )}
                        </button>

                        {/* Move Down */}
                        <button
                          type="button"
                          onClick={() => moveImage(image.id, 'down')}
                          disabled={index === images.length - 1}
                          className={cn(glassStyles.iconButton, "disabled:opacity-30")}
                          title="Flytta ner"
                        >
                          <Move size={16} className="rotate-180" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => deleteImage(image.id)}
                          className={cn(glassStyles.iconButton, "bg-red-500/50 hover:bg-red-600/70")}
                          title="Ta bort bild"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Caption */}
                <div className="p-3">
                  {editingCaption === image.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={captionText}
                        onChange={(e) => setCaptionText(e.target.value)}
                        placeholder="Bildtext..."
                        className={glassStyles.input}
                        maxLength={255}
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => saveCaption(image.id)}
                          className={cn(glassStyles.button, "text-xs px-2 py-1")}
                        >
                          <CheckCircle size={12} />
                          Spara
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className={cn(glassStyles.button, "bg-gray-500/50 hover:bg-gray-600/50 text-xs px-2 py-1")}
                        >
                          Avbryt
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-white text-sm flex-1 min-h-[1.25rem]">
                        {image.caption || (
                          <span className="text-white/50 italic">Ingen bildtext</span>
                        )}
                      </p>
                      {!readonly && (
                        <button
                          type="button"
                          onClick={() => startEditingCaption(image.id, image.caption)}
                          className="text-white/50 hover:text-white p-1"
                          title="Redigera bildtext"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Image Info */}
                  <div className="mt-2 text-xs text-white/50 flex items-center justify-between">
                    <span>
                      {(image.sizeBytes / 1024).toFixed(0)} KB
                    </span>
                    <span>
                      #{image.displayOrder}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Status Summary */}
      {images.length > 0 && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <CheckCircle size={16} />
            Bildsammanfattning
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-white/70">Totalt antal bilder:</span>
              <span className="text-white ml-2 font-medium">{images.length}/50</span>
            </div>
            <div>
              <span className="text-white/70">Huvudbild:</span>
              <span className="text-white ml-2 font-medium">
                {primaryImage ? 'Vald' : 'Inte vald'}
              </span>
            </div>
            <div>
              <span className="text-white/70">Med bildtext:</span>
              <span className="text-white ml-2 font-medium">
                {images.filter(img => img.caption).length}/{images.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="text-center py-12">
          <div className="p-4 bg-white/5 rounded-full inline-block mb-4">
            <ImageIcon size={48} className="text-white/50" />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">
            Inga bilder uppladdade än
          </h3>
          <p className="text-white/60 text-sm max-w-md mx-auto">
            {readonly 
              ? 'Inga bilder finns uppladdade för detta objekt.'
              : 'Ladda upp bilder för att visa objektet på bästa sätt. Du kan ladda upp upp till 50 bilder.'
            }
          </p>
        </div>
      )}
    </div>
  );
}