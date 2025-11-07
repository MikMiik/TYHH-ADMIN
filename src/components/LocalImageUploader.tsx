"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ImageIcon, Upload, X, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import LocalUploader, { UploadResponse, UploadOptions } from "./LocalUploader";
import Image from "next/image";

interface LocalImageUploaderProps {
  currentImage?: string;
  onUploadSuccess?: (response: UploadResponse) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  title?: string;
  fileName?: string;
  height?: number;
}

/**
 * LocalImageUploader - Image upload component using local storage
 * Replaces ImageKit ThumbnailUploader with local file upload
 *
 * Usage:
 * <LocalImageUploader
 *   currentImage="uploads/image.jpg"
 *   onUploadSuccess={(response) => console.log(response.filePath)}
 *   title="Thumbnail"
 * />
 */
const LocalImageUploader: React.FC<LocalImageUploaderProps> = ({
  currentImage,
  onUploadSuccess,
  onUploadError,
  className = "",
  title = "Thumbnail",
  fileName = "image",
  height = 200,
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

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Upload file
    uploadFile(file, {
      fileName: `${fileName}_${Date.now()}.${file.name.split(".").pop()}`,
    });
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  // Construct current image URL
  const currentImageUrl = currentImage
    ? currentImage.startsWith("http") || currentImage.startsWith("https")
      ? currentImage
      : `${process.env.NEXT_PUBLIC_SERVER_URL}/${currentImage}`
    : null;

  return (
    <div className={className}>
      <LocalUploader
        onUploadSuccess={(response) => {
          clearPreview();
          if (response) {
            onUploadSuccess?.(response);
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
                {title}
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
                    <div
                      className="w-full bg-muted rounded border flex flex-col items-center justify-center"
                      style={{ height: `${height}px` }}
                    >
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
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={400}
                      height={height}
                      className="w-full object-cover rounded border"
                      style={{ height: `${height}px` }}
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
                ) : currentImageUrl ? (
                  <div className="relative">
                    <Image
                      src={currentImageUrl}
                      alt="Current image"
                      width={400}
                      height={height}
                      className="w-full object-cover rounded border"
                      style={{ height: `${height}px` }}
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full bg-muted rounded border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center"
                    style={{ height: `${height}px` }}
                  >
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      No image uploaded
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
      </LocalUploader>
    </div>
  );
};

export default LocalImageUploader;
