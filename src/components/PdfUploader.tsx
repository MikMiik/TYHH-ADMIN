"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageKitUploader, {
  UploadResponse,
  UploadOptions,
} from "./ImagekitAuth";

interface PdfUploaderProps {
  currentPdf?: string;
  onUploadSuccess?: (url: string, fileName?: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  uploadFolder?: string;
  title?: string;
}

const PdfUploader: React.FC<PdfUploaderProps> = ({
  currentPdf,
  onUploadSuccess,
  onUploadError,
  className = "",
  uploadFolder = "documents",
  title = "PDF Document",
}) => {
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);

  const handleFileSelect = (
    file: File,
    uploadFile: (
      file: File,
      options?: UploadOptions
    ) => Promise<UploadResponse | null>
  ) => {
    // Validate file type
    if (file.type !== "application/pdf") {
      onUploadError?.("Please select a PDF file");
      return;
    }

    // Validate file size (max 50MB for documents)
    if (file.size > 50 * 1024 * 1024) {
      onUploadError?.("PDF size must be less than 50MB");
      return;
    }

    // Set uploading file for display
    setUploadingFile(file);

    // Upload file
    uploadFile(file, {
      fileName: `document_${Date.now()}.pdf`,
      folder: `/${uploadFolder}`,
      tags: ["document", "pdf", uploadFolder],
    });
  };

  const clearUploadingFile = () => {
    setUploadingFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const extractFileName = (url: string): string => {
    try {
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      return fileName || "document.pdf";
    } catch {
      return "document.pdf";
    }
  };

  return (
    <div className={className}>
      <ImageKitUploader
        onUploadSuccess={(response) => {
          clearUploadingFile();
          if (response.url) {
            const fileName =
              uploadingFile?.name || extractFileName(response.url);
            onUploadSuccess?.(response.url, fileName);
          }
        }}
        onUploadError={(error) => {
          clearUploadingFile();
          onUploadError?.(error.message);
        }}
      >
        {({ uploadFile, isUploading, progress, error, resetError }) => (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm flex items-center">
                <FileText className="mr-2 h-4 w-4" />
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
                    Upload PDF
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
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
                {isUploading && uploadingFile ? (
                  <div className="space-y-3">
                    <div className="w-full p-4 bg-muted rounded border flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {uploadingFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadingFile.size)}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Uploading...
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>
                  </div>
                ) : currentPdf ? (
                  <div className="w-full p-4 bg-muted rounded border flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-red-500" />
                      <div>
                        <p className="font-medium text-sm">
                          {extractFileName(currentPdf)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF Document
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="bg-green-500 text-white p-1 rounded">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(currentPdf, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full p-8 bg-muted rounded border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      No PDF uploaded
                      <br />
                      Click &quot;Upload PDF&quot; to add one
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

export default PdfUploader;
