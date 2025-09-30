import { Video, buildSrc } from "@imagekit/next";

interface VideoIKProps {
  className?: string;
  src?: string;
}
export default function VideoIK({ className, src }: VideoIKProps) {
  return (
    <Video
      urlEndpoint={process.env.NEXT_PUBLIC_IK_URL_ENDPOINT}
      src={src || "/video-test.mp4"}
      controls
      className={className}
      preload="none"
      poster={buildSrc({
        urlEndpoint: process.env.NEXT_PUBLIC_IK_URL_ENDPOINT || "",
        src: `/${src || "/video-test.mp4"}/ik-thumbnail.jpg`,
      })}
    />
  );
}
