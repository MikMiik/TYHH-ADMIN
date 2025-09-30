"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Check, X } from "lucide-react";

interface InlineEditProps {
  value: string | number | undefined;
  onSave: (value: string) => Promise<void>;
  type?: "text" | "textarea" | "number";
  placeholder?: string;
  className?: string;
}

const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  type = "text",
  placeholder,
  className = "",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value?.toString() || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setEditValue(value?.toString() || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditValue(value?.toString() || "");
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (editValue.trim() === (value?.toString() || "")) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch {
      // Error handling in parent component
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && type !== "textarea") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        {type === "textarea" ? (
          <Textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-20"
            autoFocus
          />
        ) : (
          <Input
            type={type === "number" ? "number" : "text"}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
          />
        )}
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-7"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-7"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <div className="flex-1 min-w-0">
        {type === "textarea" ? (
          <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: value.toString() }} />
            ) : (
              <span className="italic">{placeholder || "Click to add..."}</span>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {value || (
              <span className="italic">{placeholder || "Click to add..."}</span>
            )}
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 w-6 p-0 flex-shrink-0"
        onClick={handleEdit}
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default InlineEdit;
