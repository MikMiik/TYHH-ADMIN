"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImageIcon, Upload, X, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageLazy from "@/components/ImageLazy";
import ImageKitUploader, {
  UploadResponse,
  UploadOptions,
} from "./ImagekitAuth";

interface ThumbnailUploaderProps {
  currentThumbnail?: string;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({
  currentThumbnail,
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
    if (!file.type.startsWith("image/")) {
      onUploadError?.("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.("Image size must be less than 5MB");
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload file
    uploadFile(file, {
      fileName: `thumbnail_${Date.now()}.${file.name.split(".").pop()}`,
      folder: "/course-thumbnails",
      tags: ["thumbnail", "course"],
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
                <ImageIcon className="mr-2 h-4 w-4" />
                Thumbnail
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
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
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
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Uploading...
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  </div>
                ) : previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded border"
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
                ) : currentThumbnail ? (
                  <div className="relative">
                    <ImageLazy
                      src={currentThumbnail}
                      alt="Current thumbnail"
                      className="w-full h-48 object-cover rounded border"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-muted rounded border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      No thumbnail uploaded
                      <br />
                      Click &quot;Upload Image&quot; to add one
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

export default ThumbnailUploader;
