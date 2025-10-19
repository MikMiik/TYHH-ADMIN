"use client";

import React from "react";

export interface LocalImageLazyProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  w?: number;
  h?: number;
  placeholder?: string;
}

/**
 * LocalImageLazy - Simple lazy loading image component for local images
 * Constructs proper image URLs from relative paths
 * 
 * Usage:
 * <LocalImageLazy src="uploads/image.jpg" alt="My image" w={400} h={300} />
 */
export default function LocalImageLazy({
  src,
  alt,
  w,
  h,
  placeholder,
  style,
  ...props
}: LocalImageLazyProps) {
  // Construct image URL
  let imageSrc = src;
  if (src && !src.startsWith("http") && !src.startsWith("/")) {
    const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
    imageSrc = baseURL ? `${baseURL}/${src}` : `/${src}`;
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (placeholder) {
      e.currentTarget.src = placeholder;
    }
  };

  return (
    <img
      src={imageSrc || placeholder || "/placeholder-image.svg"}
      alt={alt || "image"}
      width={w}
      height={h}
      loading="lazy"
      onError={handleError}
      style={{
        objectFit: "cover",
        ...style,
      }}
      {...props}
    />
  );
}

