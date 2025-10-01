import { Image, buildSrc } from "@imagekit/react";
import { useState, useCallback, RefCallback } from "react";

export interface ImageLazyProps {
  src: string;
  className?: string;
  alt?: string;
  w?: number;
  h?: number;
  quality?: number;
  focus?: string;
  onError?: () => void;
}

export default function ImageLazy({
  src,
  className,
  alt,
  w,
  h,
  quality = 90,
  focus = "auto",
  onError,
}: ImageLazyProps) {
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  const hidePlaceholder = () => setShowPlaceholder(false);

  const imgRef: RefCallback<HTMLImageElement> = useCallback((img) => {
    if (!img) return; // unmount
    if ((img as HTMLImageElement).complete) {
      hidePlaceholder();
      return;
    }
  }, []);

  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt || "image"}
      width={w}
      height={h}
      transformation={[
        {
          width: w,
          height: h,
          crop: "maintain_ratio",
          quality: quality,
          format: "webp",
          progressive: true,
          cropMode: "extract",
          focus: focus,
        },
      ]}
      className={`${className} image-render-crisp`}
      urlEndpoint={process.env.NEXT_PUBLIC_IK_URL_ENDPOINT || ""}
      loading="lazy"
      ref={imgRef}
      onError={onError}
      style={{
        imageRendering: "crisp-edges",
        ...(showPlaceholder
          ? {
              backgroundImage: `url(${buildSrc({
                urlEndpoint: process.env.NEXT_PUBLIC_IK_URL_ENDPOINT || "",
                src: "/placeholder.svg",
                transformation: [
                  {
                    quality: 10,
                    blur: 50,
                  },
                ],
              } as Parameters<typeof buildSrc>[0])})`,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }
          : {}),
      }}
    />
  );
}
