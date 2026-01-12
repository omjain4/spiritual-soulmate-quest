import { useRef, useState } from "react";
import { Image, FileVideo, Mic, Paperclip, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaUploadButtonProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

const MediaUploadButton = ({ onUpload, isUploading }: MediaUploadButtonProps) => {
  const [preview, setPreview] = useState<{ url: string; type: string } | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview for images and videos
    if (type === "image" || type === "video") {
      const url = URL.createObjectURL(file);
      setPreview({ url, type });
    }

    await onUpload(file);
    setPreview(null);
    
    // Reset input
    e.target.value = "";
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview.url);
      setPreview(null);
    }
  };

  return (
    <div className="relative">
      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "image")}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "video")}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "audio")}
      />
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "file")}
      />

      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 rounded-xl border border-border bg-card p-2 shadow-lg"
          >
            <button
              onClick={clearPreview}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            {preview.type === "image" ? (
              <img src={preview.url} alt="Preview" className="h-20 w-20 rounded-lg object-cover" />
            ) : preview.type === "video" ? (
              <video src={preview.url} className="h-20 w-20 rounded-lg object-cover" />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isUploading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Image className="h-5 w-5" />
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={() => imageInputRef.current?.click()}>
            <Image className="mr-2 h-4 w-4" />
            Photo
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => videoInputRef.current?.click()}>
            <FileVideo className="mr-2 h-4 w-4" />
            Video
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => audioInputRef.current?.click()}>
            <Mic className="mr-2 h-4 w-4" />
            Audio
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
            <Paperclip className="mr-2 h-4 w-4" />
            File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MediaUploadButton;
