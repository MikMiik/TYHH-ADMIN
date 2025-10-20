"use client";

import { useState, ReactNode } from "react";
import httpRequest from "@/lib/utils/httpRequest";

// TypeScript interfaces
interface UploadOptions {
  fileName?: string;
}

interface UploadResponse {
  url: string;
  filePath: string;
  fileId: string;
  name: string;
  size: number;
  fileType: string;
}

interface UploadUtilities {
  uploadFile: (
    file: File,
    options?: UploadOptions
  ) => Promise<UploadResponse | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  resetError: () => void;
}

interface LocalUploaderProps {
  children: (utilities: UploadUtilities) => ReactNode;
  onUploadSuccess?: (response: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
}

/**
 * LocalUploader - TypeScript component for local file uploads
 * Provides upload functionality to children components via render prop pattern
 * 
 * Usage:
 * <LocalUploader>
 *   {({ uploadFile, isUploading, progress, error }) => (
 *     <YourUploadUI onUpload={uploadFile} loading={isUploading} />
 *   )}
 * </LocalUploader>
 */
const LocalUploader: React.FC<LocalUploaderProps> = ({
  children,
  onUploadSuccess,
  onUploadError,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResponse | null> => {
    if (!file) {
      setError("No file provided");
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      // Add fileName if provided
      if (options.fileName) formData.append("fileName", options.fileName);

      // Upload to local backend
      const uploadResponse = await httpRequest.post<{
        url: string;
        filePath: string;
        filename: string;
        originalName: string;
        size: number;
        mimetype: string;
      }>("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progressValue = (progressEvent.loaded / progressEvent.total) * 100;
            setProgress(progressValue);
          }
        },
      });

      setIsUploading(false);

      // Check if upload was successful
      if (uploadResponse?.data) {
        // Transform response to match expected format
        const transformedResponse: UploadResponse = {
          url: uploadResponse.data.url,
          filePath: uploadResponse.data.filePath, // Use the correct filePath from backend
          fileId: Date.now().toString(),
          name: options.fileName || file.name,
          size: file.size,
          fileType: file.type,
        };

        onUploadSuccess?.(transformedResponse);
        return transformedResponse;
      } else {
        throw new Error("Upload failed: No data in response");
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      const errorMessage =
        uploadError instanceof Error ? uploadError.message : "Upload failed";
      setError(errorMessage);
      setIsUploading(false);
      onUploadError?.(
        uploadError instanceof Error ? uploadError : new Error("Upload failed")
      );
      return null;
    }
  };

  const resetError = (): void => {
    setError(null);
  };

  // Render prop pattern - pass upload utilities to children
  return (
    <>
      {children({
        uploadFile,
        isUploading,
        progress,
        error,
        resetError,
      })}
    </>
  );
};

export default LocalUploader;
export type { UploadResponse, UploadOptions, UploadUtilities };

