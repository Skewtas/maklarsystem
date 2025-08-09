/**
 * PropertyCard - Property listing card component
 * 
 * Displays property information in a card format for list views
 * with glassmorphism styling and Swedish formatting.
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Home, 
  Ruler, 
  Calendar,
  Eye,
  Star,
  Bed,
  Bath,
  Car,
  Wifi,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  PropertyCardProps, 
  PropertyListItem,
  PropertyTypeIcons,
  PropertyStatusColors 
} from '@/types/property.types';
import { formatRelativeTime } from '@/lib/utils/property.utils';

// ============================================================
// GLASSMORPHISM STYLES
// ============================================================

const glassStyles = {
  card: cn(
    "backdrop-blur-xl",
    "bg-white/10",
    "border border-white/20",
    "shadow-2xl",
    "rounded-2xl",
    "overflow-hidden",
    "transition-all duration-300",
    "hover:bg-white/15",
    "hover:border-white/30",
    "hover:shadow-3xl",
    "hover:-translate-y-1",
    "group"
  ),
  cardCompact: "h-auto",
  cardDefault: "h-auto",
  cardDetailed: "h-auto",
  imageContainer: "relative overflow-hidden",
  image: "w-full object-cover transition-transform duration-500 group-hover:scale-105",
  imageDefault: "h-48",
  imageCompact: "h-32",
  imageDetailed: "h-56",
  content: "p-4",
  contentCompact: "p-3",
  contentDetailed: "p-6",
  badge: cn(
    "absolute top-3 right-3",
    "px-2 py-1",
    "rounded-full",
    "text-xs font-medium",
    "backdrop-blur-sm"
  ),
  statusBadge: "bg-black/50 text-white",
  newBadge: "bg-green-500/90 text-white",
  priceTag: "text-2xl font-bold text-white mb-1",
  priceTagCompact: "text-lg font-bold text-white mb-1",
  title: "text-white font-semibold mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors",
  titleDefault: "text-lg",
  titleCompact: "text-base",
  titleDetailed: "text-xl",
  location: "text-white/70 text-sm mb-3 flex items-center gap-1",
  specs: "space-y-2 mb-4",
  specsCompact: "space-y-1 mb-3",
  specItem: "flex items-center gap-2 text-white/80 text-sm",
  specItemCompact: "text-xs",
  actionBar: "flex items-center justify-between pt-4 border-t border-white/10",
  actionBarCompact: "pt-3",
  button: cn(
    "p-2 rounded-lg",
    "bg-white/5 hover:bg-white/15",
    "border border-white/10 hover:border-white/20",
    "text-white/70 hover:text-white",
    "transition-all duration-200"
  ),
  primaryButton: cn(
    "px-4 py-2 rounded-lg",
    "bg-gradient-to-r from-blue-500/80 to-purple-500/80",
    "hover:from-blue-600/80 hover:to-purple-600/80",
    "text-white font-medium text-sm",
    "transition-all duration-200"
  ),
  features: "flex flex-wrap gap-1 mb-3",
  featureTag: cn(
    "px-2 py-1",
    "bg-blue-500/20",
    "border border-blue-500/30",
    "rounded",
    "text-xs text-blue-200"
  )
};

// Feature icons mapping
const FEATURE_ICONS: Record<string, any> = {
  'balkong': Sun,
  'parkering': Car,
  'hiss': Home,
  'internet': Wifi,
  'default': Home
};

// ============================================================
// COMPONENT
// ============================================================

export function PropertyCard({
  property,
  variant = 'default',
  showImages = true,
  showActions = true,
  onClick,
  onFavorite,
  onShare,
  className
}: PropertyCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle favorite toggle
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    onFavorite?.(property.id);
  };

  // Handle share click
  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onShare?.(property);
  };

  // Handle card click
  const handleCardClick = () => {
    onClick?.(property);
  };

  // Get type icon
  const TypeIcon = PropertyTypeIcons[property.propertyType] 
    ? (PropertyTypeIcons as any)[property.propertyType] 
    : Home;

  // Get status color
  const statusColor = PropertyStatusColors[property.status] || 'gray';

  // Determine image dimensions based on variant
  const imageDimensions = {
    default: { width: 400, height: 192 },
    compact: { width: 400, height: 128 },
    detailed: { width: 400, height: 224 }
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        glassStyles.card,
        glassStyles[`card${variant.charAt(0).toUpperCase()}${variant.slice(1)}` as keyof typeof glassStyles] || glassStyles.cardDefault,
        className
      )}
    >
      <Link 
        href={`/objekt/${property.slug}`}
        className="block"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        {showImages && (
          <div className={cn(
            glassStyles.imageContainer,
            glassStyles[`image${variant.charAt(0).toUpperCase()}${variant.slice(1)}`] || glassStyles.imageDefault
          )}>
            {property.primaryImage && !imageError ? (
              <Image
                src={property.primaryImage.url}
                alt={property.primaryImage.caption || property.title}
                width={imageDimensions.width}
                height={imageDimensions.height}
                className={glassStyles.image}
                onError={() => setImageError(true)}
                priority={variant === 'detailed'}
              />
            ) : (
              <div className={cn(
                "w-full bg-gradient-to-br from-gray-600/50 to-gray-800/50",
                "flex items-center justify-center",
                glassStyles[`image${variant.charAt(0).toUpperCase()}${variant.slice(1)}`] || glassStyles.imageDefault
              )}>
                <TypeIcon size={variant === 'compact' ? 32 : 48} className="text-white/50" />
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
              {/* Status Badge */}
              <div className={cn(
                glassStyles.badge,
                glassStyles.statusBadge,
                `bg-${statusColor}-500/90`
              )}>
                {property.status === 'kommande' && 'Kommande'}
                {property.status === 'till_salu' && 'Till salu'}
                {property.status === 'under_kontrakt' && 'Under kontrakt'}
                {property.status === 'sald' && 'Såld'}
              </div>

              {/* New Badge */}
              {property.isNew && (
                <div className={cn(glassStyles.badge, glassStyles.newBadge)}>
                  <Star size={12} className="inline mr-1" />
                  Nytt
                </div>
              )}
            </div>

            {/* Image Count */}
            {property.imageCount > 1 && (
              <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs backdrop-blur-sm">
                <Eye size={12} className="inline mr-1" />
                {property.imageCount} bilder
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className={cn(
          glassStyles.content,
          glassStyles[`content${variant.charAt(0).toUpperCase()}${variant.slice(1)}`] || glassStyles.content
        )}>
          {/* Price */}
          <div className={cn(
            variant === 'compact' ? glassStyles.priceTagCompact : glassStyles.priceTag
          )}>
            {property.formattedPrice}
          </div>
          <div className="text-white/60 text-sm mb-3">
            {property.pricePerSqm.toLocaleString('sv-SE')} kr/m²
          </div>

          {/* Title */}
          <h3 className={cn(
            glassStyles.title,
            glassStyles[`title${variant.charAt(0).toUpperCase()}${variant.slice(1)}`] || glassStyles.titleDefault
          )}>
            {property.title}
          </h3>

          {/* Short Description - only for detailed variant */}
          {variant === 'detailed' && property.shortDescription && (
            <p className="text-white/70 text-sm mb-3 line-clamp-2">
              {property.shortDescription}
            </p>
          )}

          {/* Location */}
          <div className={glassStyles.location}>
            <MapPin size={14} />
            <span>{property.street}, {property.city}</span>
          </div>

          {/* Specifications */}
          <div className={cn(
            glassStyles.specs,
            variant === 'compact' && glassStyles.specsCompact
          )}>
            <div className={cn(
              glassStyles.specItem,
              variant === 'compact' && glassStyles.specItemCompact
            )}>
              <Ruler size={variant === 'compact' ? 12 : 14} />
              <span>{property.formattedArea}</span>
              <span className="mx-2">•</span>
              <Home size={variant === 'compact' ? 12 : 14} />
              <span>{property.formattedRooms}</span>
            </div>
            
            <div className={cn(
              glassStyles.specItem,
              variant === 'compact' && glassStyles.specItemCompact
            )}>
              <Calendar size={variant === 'compact' ? 12 : 14} />
              <span>Byggår {property.buildYear}</span>
              {property.plotArea && (
                <>
                  <span className="mx-2">•</span>
                  <span>{property.plotArea.toLocaleString('sv-SE')} m² tomt</span>
                </>
              )}
            </div>
            
            {/* Property Type and View Count */}
            <div className={cn(
              glassStyles.specItem,
              variant === 'compact' && glassStyles.specItemCompact
            )}>
              <TypeIcon size={variant === 'compact' ? 12 : 14} />
              <span className="capitalize">
                {property.propertyType === 'villa' ? 'Villa' :
                 property.propertyType === 'lagenhet' ? 'Lägenhet' :
                 property.propertyType === 'radhus' ? 'Radhus' :
                 property.propertyType === 'tomt' ? 'Tomt' : 'Fritidshus'}
              </span>
              {property.viewCount > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <Eye size={variant === 'compact' ? 12 : 14} />
                  <span>{property.viewCount} visningar</span>
                </>
              )}
            </div>
          </div>

          {/* Published Date */}
          {property.publishedAt && (
            <div className="text-white/50 text-xs mb-3">
              Publicerad {formatRelativeTime(property.publishedAt)}
            </div>
          )}

          {/* Action Bar */}
          {showActions && (
            <div className={cn(
              glassStyles.actionBar,
              variant === 'compact' && glassStyles.actionBarCompact
            )}>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleFavoriteClick}
                  className={cn(
                    glassStyles.button,
                    isFavorited && "bg-red-500/20 border-red-500/30 text-red-400"
                  )}
                  title={isFavorited ? 'Ta bort från favoriter' : 'Lägg till i favoriter'}
                >
                  <Heart 
                    size={16} 
                    className={isFavorited ? 'fill-current' : ''} 
                  />
                </button>

                <button
                  type="button"
                  onClick={handleShareClick}
                  className={glassStyles.button}
                  title="Dela objekt"
                >
                  <Share2 size={16} />
                </button>
              </div>

              <Link
                href={`/objekt/${property.slug}`}
                className={glassStyles.primaryButton}
                onClick={(e) => e.stopPropagation()}
              >
                Visa objekt
              </Link>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}