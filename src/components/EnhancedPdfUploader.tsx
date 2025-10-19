"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle, Download, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LocalUploader, {
  UploadResponse,
  UploadOptions,
} from "./LocalUploader";

interface DocumentFormData {
  title: string;
  vip: boolean;
  livestreamId: string;
  url: string;
}

interface EnhancedPdfUploaderProps {
  onDocumentCreate?: (data: DocumentFormData) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  uploadFolder?: string;
  title?: string;
  livestreams?: Array<{
    id: number;
    title: string;
  }>;
  isCreating?: boolean;
}

const EnhancedPdfUploader: React.FC<EnhancedPdfUploaderProps> = ({
  onDocumentCreate,
  onUploadError,
  className = "",
  title = "Upload PDF Document",
  livestreams = [],
  isCreating = false,
}) => {
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    vip: false,
    livestreamId: "none",
  });

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

    // Auto-fill title from filename if empty
    if (!formData.title && file.name) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setFormData((prev) => ({ ...prev, title: nameWithoutExt }));
    }

    // Set uploading file for display
    setUploadingFile(file);

    // Upload file
    uploadFile(file, {
      fileName: `document_${Date.now()}.pdf`,
      maxSize: 50 * 1024 * 1024, // 50MB max for PDFs
    });
  };

  const handleUploadSuccess = (url: string) => {
    setUploadedUrl(url);
    setUploadingFile(null);
  };

  const handleUploadFailed = (error: string) => {
    setUploadingFile(null);
    onUploadError?.(error);
  };

  const handleCreateDocument = () => {
    if (!uploadedUrl) {
      onUploadError?.("Please upload a PDF file first");
      return;
    }

    if (!formData.title.trim()) {
      onUploadError?.("Please enter a document title");
      return;
    }

    // Extract relative path from ImageKit URL
    const extractImageKitPath = (url: string): string => {
      try {
        const urlObj = new URL(url);
        const path = urlObj.pathname.substring(1);
        const pathParts = path.split("/");
        if (pathParts.length > 1) {
          return pathParts.slice(1).join("/");
        }
        return path;
      } catch (error) {
        console.error("Error extracting ImageKit path:", error);
        return url;
      }
    };

    const documentData: DocumentFormData = {
      title: formData.title.trim(),
      vip: formData.vip,
      livestreamId:
        formData.livestreamId === "none" ? "" : formData.livestreamId,
      url: extractImageKitPath(uploadedUrl),
    };

    onDocumentCreate?.(documentData);
  };

  const resetForm = () => {
    setFormData({ title: "", vip: false, livestreamId: "none" });
    setUploadedUrl("");
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

  const canCreateDocument = uploadedUrl && formData.title.trim() && !isCreating;

  return (
    <div className={className}>
      <LocalUploader
        onUploadSuccess={(response) => {
          if (response.filePath) {
            handleUploadSuccess(response.filePath);
          }
        }}
        onUploadError={(error) => {
          handleUploadFailed(error.message);
        }}
      >
        {({ uploadFile, isUploading, progress, error, resetError }) => (
          <div className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  {title}
                </h4>
                {!isUploading && !uploadedUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="cursor-pointer"
                  >
                    <label>
                      <Upload className="mr-2 h-4 w-4" />
                      Select PDF
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

              {/* File Preview */}
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
                  ) : uploadedUrl ? (
                    <div className="w-full p-4 bg-muted rounded border flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">
                            {extractFileName(uploadedUrl)}
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
                          onClick={() => window.open(uploadedUrl, "_blank")}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={resetForm}
                          disabled={isCreating}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full p-8 bg-muted rounded border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center">
                        No PDF selected
                        <br />
                        Click &quot;Select PDF&quot; to choose a file
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

            {/* Document Information Form */}
            {uploadedUrl && (
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Document Information</h4>

                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="doc-title">Title *</Label>
                  <Input
                    id="doc-title"
                    placeholder="Enter document title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    disabled={isCreating}
                  />
                </div>

                {/* VIP Checkbox */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="doc-vip"
                    checked={formData.vip}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, vip: !!checked }))
                    }
                    disabled={isCreating}
                  />
                  <Label htmlFor="doc-vip" className="text-sm">
                    VIP Document (requires VIP access)
                  </Label>
                </div>

                {/* Livestream Selection */}
                <div className="space-y-2">
                  <Label htmlFor="doc-livestream">
                    Related Livestream (Optional)
                  </Label>
                  <Select
                    value={formData.livestreamId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, livestreamId: value }))
                    }
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a livestream (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No livestream</SelectItem>
                      {livestreams.map((livestream) => (
                        <SelectItem
                          key={livestream.id}
                          value={livestream.id.toString()}
                        >
                          <span
                            className="truncate block max-w-[300px]"
                            title={livestream.title}
                          >
                            {livestream.title}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Create Button */}
                <Button
                  onClick={handleCreateDocument}
                  disabled={!canCreateDocument}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isCreating ? "Creating Document..." : "Create Document"}
                </Button>
              </div>
            )}
          </div>
        )}
      </LocalUploader>
    </div>
  );
};

export default EnhancedPdfUploader;
