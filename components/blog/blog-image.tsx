'use client'

import { useState } from 'react'
import Image from 'next/image'

interface BlogImageProps {
  src: string
  alt: string
  title?: string
  className?: string
  priority?: boolean
  sizes?: string
}

export function BlogImage({ 
  src, 
  alt, 
  title, 
  className = "object-cover w-full h-full",
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: BlogImageProps) {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Fallback image path
  const fallbackImage = "/images/blog/default-blog-image.svg"

  // Handle image load error
  const handleError = () => {
    setImageError(true)
    setIsLoading(false)
  }

  // Handle image load success
  const handleLoad = () => {
    setIsLoading(false)
  }

  // Use fallback if there's an error or no src
  const imageSrc = imageError || !src ? fallbackImage : src

  return (
    <div className="relative w-full h-full">
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}
      
      {/* Main image */}
      <Image
        src={imageSrc}
        alt={alt}
        title={title || alt}
        fill
        className={`${className} transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        sizes={sizes}
        quality={85}
      />
      
      {/* Error indicator (only visible in development) */}
      {imageError && process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
          Image Error
        </div>
      )}
    </div>
  )
}

// Responsive blog image with predefined aspect ratios
export function ResponsiveBlogImage({ 
  src, 
  alt, 
  title,
  aspectRatio = "16/9",
  priority = false 
}: BlogImageProps & { aspectRatio?: "16/9" | "4/3" | "1/1" | "3/2" }) {
  const aspectRatioClasses = {
    "16/9": "aspect-[16/9]",
    "4/3": "aspect-[4/3]", 
    "1/1": "aspect-square",
    "3/2": "aspect-[3/2]"
  }

  return (
    <div className={`relative w-full ${aspectRatioClasses[aspectRatio]} rounded-lg overflow-hidden`}>
      <BlogImage
        src={src}
        alt={alt}
        title={title}
        priority={priority}
        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 375px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1920px) 33vw, 25vw"
      />
    </div>
  )
}

// Blog hero image component
export function BlogHeroImage({ 
  src, 
  alt, 
  title,
  priority = true 
}: BlogImageProps) {
  return (
    <div className="relative h-[300px] md:h-[400px] mb-8 rounded-lg overflow-hidden">
      <BlogImage
        src={src}
        alt={alt}
        title={title}
        priority={priority}
        className="object-cover w-full h-full"
        sizes="(max-width: 375px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, (max-width: 1920px) 80vw, 70vw"
      />
    </div>
  )
}

// Related post image component
export function RelatedPostImage({ 
  src, 
  alt, 
  title 
}: BlogImageProps) {
  return (
    <div className="relative h-40 bg-muted rounded-t-lg overflow-hidden">
      <BlogImage
        src={src}
        alt={alt}
        title={title}
        priority={false}
        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 375px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
      />
    </div>
  )
}
