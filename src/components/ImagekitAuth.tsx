"use client";

import { upload, UploadResponse as IKUploadResponse } from "@imagekit/react";
import { useState, ReactNode } from "react";

// TypeScript interfaces
interface AuthParams {
  signature: string;
  expire: number;
  token: string;
  publicKey: string;
}

interface UploadOptions {
  fileName?: string;
  folder?: string;
  tags?: string[];
}

// Use ImageKit's native UploadResponse type
type UploadResponse = IKUploadResponse;

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

interface ImageKitUploaderProps {
  children: (utilities: UploadUtilities) => ReactNode;
  onUploadSuccess?: (response: UploadResponse) => void;
  onUploadError?: (error: Error) => void;
  baseUrl?: string;
}

/**
 * ImageKitUploader - TypeScript wrapper component for ImageKit file uploads
 * Provides upload functionality to children components via render prop pattern
 *
 * Usage:
 * <ImageKitUploader>
 *   {({ uploadFile, isUploading, progress, error }) => (
 *     <YourUploadUI onUpload={uploadFile} loading={isUploading} />
 *   )}
 * </ImageKitUploader>
 */
const ImageKitUploader: React.FC<ImageKitUploaderProps> = ({
  children,
  onUploadSuccess,
  onUploadError,
  baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const authenticator = async (): Promise<AuthParams> => {
    try {
      // Call backend authentication endpoint
      const response = await fetch(`${baseUrl}/imagekit/auth`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      const { signature, expire, token, publicKey } = data.data || data;

      if (!signature || !expire || !token || !publicKey) {
        throw new Error("Invalid authentication response");
      }

      return { signature, expire, token, publicKey };
    } catch (error) {
      console.error("ImageKit authentication error:", error);
      throw new Error("Failed to authenticate with ImageKit");
    }
  };

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
      // Get authentication credentials
      const authParams = await authenticator();

      const uploadResponse = await upload({
        ...authParams,
        file,
        fileName: options.fileName || file.name,
        folder: options.folder || "/uploads",
        tags: options.tags || ["admin-upload"],
        onProgress: (event: { loaded: number; total: number }) => {
          const progressValue = (event.loaded / event.total) * 100;
          setProgress(progressValue);
        },
      });

      setIsUploading(false);
      setProgress(100);

      if (uploadResponse?.url) {
        onUploadSuccess?.(uploadResponse);
        return uploadResponse;
      } else {
        throw new Error("Upload response invalid");
      }
    } catch (uploadError) {
      console.error("Upload error:", uploadError);
      const errorMessage =
        uploadError instanceof Error ? uploadError.message : "Upload failed";
      setError(errorMessage);
      setIsUploading(false);
      setProgress(0);
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

export default ImageKitUploader;
export type { UploadResponse, UploadOptions, UploadUtilities };
