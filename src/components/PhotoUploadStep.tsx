import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload, X, Check, RotateCcw, ZoomIn, ZoomOut, Star, Loader2 } from "lucide-react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface PhotoUploadStepProps {
  photos: string[];
  mainPhotoIndex: number;
  onPhotosChange: (photos: string[]) => void;
  onMainPhotoChange: (index: number) => void;
  maxPhotos?: number;
  uploading?: boolean;
  onUploadPhoto?: (file: Blob) => Promise<string | null>;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

const PhotoUploadStep = ({
  photos,
  mainPhotoIndex,
  onPhotosChange,
  onMainPhotoChange,
  maxPhotos = 6,
  uploading = false,
  onUploadPhoto
}: PhotoUploadStepProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result as string);
      setCropDialogOpen(true);
      setScale(1);
      setRotate(0);
    });
    reader.readAsDataURL(file);
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 3 / 4));
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (photos.length >= maxPhotos) {
      toast({
        title: "Maximum photos reached",
        description: `You can only upload ${maxPhotos} photos`,
        variant: "destructive",
      });
      return;
    }

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const getCroppedImage = useCallback(async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null;

    const image = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return null;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.imageSmoothingQuality = "high";

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  }, [completedCrop]);

  const handleSaveCrop = async () => {
    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImage();
      if (croppedBlob && onUploadPhoto) {
        const url = await onUploadPhoto(croppedBlob);
        if (url) {
          onPhotosChange([...photos, url]);
          toast({
            title: "Photo added",
            description: "Your photo has been uploaded successfully",
          });
        }
      } else if (croppedBlob) {
        // Fallback to data URL if no upload function
        const reader = new FileReader();
        reader.onloadend = () => {
          onPhotosChange([...photos, reader.result as string]);
        };
        reader.readAsDataURL(croppedBlob);
      }
    } finally {
      setIsProcessing(false);
      setCropDialogOpen(false);
      setImageToCrop(null);
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    
    // Adjust main photo index if needed
    if (index === mainPhotoIndex) {
      onMainPhotoChange(0);
    } else if (index < mainPhotoIndex) {
      onMainPhotoChange(mainPhotoIndex - 1);
    }
    
    toast({
      title: "Photo removed",
      description: "The photo has been removed from your profile",
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl">
              Add Your Photos
            </h2>
          </div>
          <p className="text-muted-foreground">
            Upload up to {maxPhotos} photos • Tap the star to set main photo
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <motion.div
                key={i}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-muted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <img src={photo} alt="" className="h-full w-full object-cover" />
                
                {/* Remove button */}
                <button
                  onClick={() => handleRemovePhoto(i)}
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
                
                {/* Set as main button */}
                <button
                  onClick={() => onMainPhotoChange(i)}
                  className={`absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                    i === mainPhotoIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-black/50 text-white opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Star className="h-4 w-4" fill={i === mainPhotoIndex ? "currentColor" : "none"} />
                </button>

                {/* Main badge */}
                {i === mainPhotoIndex && (
                  <span className="absolute bottom-1 left-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                    Main
                  </span>
                )}
              </motion.div>
            ))}

            {/* Add Photo Button */}
            {photos.length < maxPhotos && (
              <motion.div
                className={`relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-foreground"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-full flex-col items-center justify-center gap-2 p-2 text-center">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  ) : (
                    <>
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        {isDragging ? (
                          <Upload className="h-6 w-6 text-primary" />
                        ) : (
                          <Camera className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {isDragging ? "Drop here" : "Add photo"}
                      </span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={onSelectFile}
                  className="hidden"
                />
              </motion.div>
            )}
          </div>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {photos.length}/{maxPhotos} photos • {photos.length === 0 ? "Add at least 1 photo to continue" : "Looking good!"}
          </p>
        </div>
      </motion.div>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop your photo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {imageToCrop && (
              <div className="relative mx-auto max-h-[50vh] overflow-hidden rounded-xl bg-muted">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={3 / 4}
                  className="max-h-[50vh]"
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imageToCrop}
                    onLoad={onImageLoad}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxHeight: "50vh",
                      width: "auto",
                    }}
                    className="mx-auto"
                  />
                </ReactCrop>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="min-w-[4rem] text-center text-sm">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(Math.min(3, scale + 0.1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setRotate((rotate + 90) % 360)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-muted"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setCropDialogOpen(false);
                  setImageToCrop(null);
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 font-medium transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSaveCrop}
                disabled={!completedCrop || isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-3 font-medium text-background transition-colors hover:opacity-90 disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Save Photo
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoUploadStep;
