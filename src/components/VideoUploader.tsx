"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Video, Upload, X, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VideoIK from "@/components/VideoIK";
import ImageKitUploader, {
  UploadResponse,
  UploadOptions,
} from "./ImagekitAuth";

interface VideoUploaderProps {
  currentVideoUrl?: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  currentVideoUrl,
  onUploadSuccess,
  onUploadError,
  className = "",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (
    file: File,
    uploadFile: (
      file: File,
      options?: UploadOptions
    ) => Promise<UploadResponse | null>
  ) => {
    // Validate file type
    if (!file.type.startsWith("video/")) {
      onUploadError?.("Please select a video file");
      return;
    }

    // Validate file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      onUploadError?.("Video size must be less than 100MB");
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload file
    uploadFile(file, {
      fileName: `intro_video_${Date.now()}.${file.name.split(".").pop()}`,
      folder: "/course-intro",
      tags: ["video", "course", "intro"],
    });
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className={className}>
      <ImageKitUploader
        onUploadSuccess={(response) => {
          clearPreview();
          if (response.url) {
            onUploadSuccess?.(response.url);
          }
        }}
        onUploadError={(error) => {
          clearPreview();
          onUploadError?.(error.message);
        }}
      >
        {({ uploadFile, isUploading, progress, error, resetError }) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm flex items-center">
                <Video className="mr-2 h-4 w-4" />
                Intro Video
              </h4>
              {!isUploading && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="cursor-pointer"
                >
                  <label>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          resetError();
                          handleFileSelect(file, uploadFile);
                        }
                      }}
                    />
                  </label>
                </Button>
              )}
            </div>

            {/* Preview Area */}
            <Card>
              <CardContent className="p-4">
                {isUploading ? (
                  <div className="space-y-3">
                    <div className="w-full h-48 bg-muted rounded border flex flex-col items-center justify-center">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2 animate-pulse" />
                      <p className="text-sm text-muted-foreground">
                        Uploading video...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        This may take a while
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Upload Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  </div>
                ) : previewUrl ? (
                  <div className="relative">
                    <video
                      src={previewUrl}
                      className="w-full h-48 object-cover rounded border"
                      controls
                      preload="metadata"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={clearPreview}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : currentVideoUrl ? (
                  <div className="relative">
                    <div className="w-full h-48 bg-muted rounded border flex items-center justify-center overflow-hidden">
                      <VideoIK src={currentVideoUrl} />
                    </div>
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-muted rounded border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      No intro video uploaded
                      <br />
                      Click &quot;Upload Video&quot; to add one
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </ImageKitUploader>
    </div>
  );
};

export default VideoUploader;
