import { Image, buildSrc } from "@imagekit/react";
import { useState, useCallback, RefCallback } from "react";

export interface ImageLazyProps {
  src: string;
  className?: string;
  alt?: string;
  w?: number;
  h?: number;
}

export default function ImageLazy({
  src,
  className,
  alt,
  w,
  h,
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
      src={src}
      alt={alt}
      width={w}
      height={h}
      transformation={[
        {
          width: w,
          height: h,
        },
      ]}
      className={className}
      urlEndpoint={process.env.NEXT_PUBLIC_IK_URL_ENDPOINT || ""}
      loading="lazy"
      ref={imgRef}
      style={
        showPlaceholder
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
          : {}
      }
    />
  );
}
