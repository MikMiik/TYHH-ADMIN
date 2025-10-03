"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize,
  FileText,
  RotateCw,
  Minimize2,
} from "lucide-react";
import { toast } from "sonner";

// Set up PDF.js worker - use protocol-relative URL to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfUrl: string;
  title?: string;
  className?: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfUrl,
  title = "PDF Document",
  className = "",
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [useFallback, setUseFallback] = useState<boolean>(false);

  // Debug logging for PDF URL
  console.log("PdfViewer - PDF URL:", pdfUrl);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
      setError(null);
      setUseFallback(false);
      console.log("PDF loaded successfully, pages:", numPages);
    },
    []
  );

  const onDocumentLoadError = useCallback(
    (error: Error) => {
      console.error("PDF load error:", error);
      console.error("Failed URL:", pdfUrl);
      setError(`Failed to load PDF document. URL: ${pdfUrl}`);
      setIsLoading(false);
      // Try fallback after error
      setUseFallback(true);
    },
    [pdfUrl]
  );

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const resetView = () => {
    setScale(1.0);
    setRotation(0);
    setPageNumber(1);
  };

  const handleDownload = () => {
    try {
      const link = window.document.createElement("a");
      link.href = pdfUrl;
      link.download = `${title}.pdf`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download PDF");
    }
  };

  const openFullscreen = () => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (error && !useFallback) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <FileText className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" onClick={openFullscreen}>
                <Maximize className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseFallback(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Try Iframe Viewer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Fallback iframe viewer
  if (useFallback) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          {/* Controls for fallback */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-muted-foreground">
              PDF Viewer (Iframe Mode)
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={openFullscreen}>
                <Maximize className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setUseFallback(false);
                  setError(null);
                  setIsLoading(true);
                }}
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Try React-PDF Again
              </Button>
            </div>
          </div>

          {/* Iframe PDF Viewer */}
          <div
            className={`border rounded-lg overflow-hidden ${
              isExpanded ? "h-[800px]" : "h-[600px]"
            }`}
          >
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH`}
              width="100%"
              height="100%"
              title={`PDF Viewer: ${title}`}
              className="w-full h-full"
              onError={() => {
                toast.error(
                  "Could not load PDF in iframe either. Please download the file."
                );
              }}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {title} • PDF Document (Iframe Mode)
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={toggleExpanded}>
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
              <Button variant="ghost" size="sm" onClick={openFullscreen}>
                Open in New Tab
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Controls */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {isLoading ? "Loading..." : `Page ${pageNumber} of ${numPages}`}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 3.0}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={rotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleExpanded}>
              {isExpanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div
          className={`border rounded-lg overflow-auto bg-gray-50 ${
            isExpanded ? "max-h-[800px]" : "max-h-[600px]"
          }`}
        >
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">
                Loading PDF...
              </span>
            </div>
          )}

          <Document
            file={{
              url: pdfUrl,
            }}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading=""
            className="flex justify-center"
            options={{
              cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
              cMapPacked: true,
              standardFontDataUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
            }}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg"
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              }
            />
          </Document>
        </div>

        {/* Page Navigation */}
        {numPages > 1 && !isLoading && (
          <div className="flex items-center justify-center mt-4 space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(1)}
              disabled={pageNumber === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNumber(numPages)}
              disabled={pageNumber === numPages}
            >
              Last
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="ml-4"
            >
              Reset View
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {title} • PDF Document
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={openFullscreen}>
              Open in New Tab
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PdfViewer;
