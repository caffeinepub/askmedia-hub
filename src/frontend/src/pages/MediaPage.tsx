import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  CloudUpload,
  Film,
  Image as ImageIcon,
  Loader2,
  Play,
  Plus,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import type { MediaItem } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllMediaItems,
  useCallerUserProfile,
  useCreateMediaItem,
  useDeleteMediaItem,
  useIsCallerAdmin,
} from "../hooks/useQueries";

// Sample media for populated first-load experience
const SAMPLE_MEDIA = [
  {
    id: BigInt(-1),
    title: "Aurora Borealis over Iceland",
    description:
      "Stunning northern lights captured at midnight in Reykjavik. Long exposure, f/2.8.",
    uploaderName: "NatureLens",
    mediaType: "image",
    blob: null,
    sampleSrc:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80",
  },
  {
    id: BigInt(-2),
    title: "Tokyo Street at Night",
    description:
      "Neon reflections on rain-soaked streets in Shinjuku district.",
    uploaderName: "UrbanCaptures",
    mediaType: "image",
    blob: null,
    sampleSrc:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80",
  },
  {
    id: BigInt(-3),
    title: "Deep Ocean Timelapse",
    description:
      "Bioluminescent plankton filmed at 60fps, color graded in Davinci Resolve.",
    uploaderName: "OceanEye",
    mediaType: "video",
    blob: null,
    sampleSrc:
      "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80",
  },
  {
    id: BigInt(-4),
    title: "Mountain Summit Drone Shot",
    description:
      "4K aerial footage from Mt. Rainier at sunrise, DJI Mavic 3 Pro.",
    uploaderName: "SkyFrames",
    mediaType: "video",
    blob: null,
    sampleSrc:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
  },
  {
    id: BigInt(-5),
    title: "Abstract Macro Photography",
    description: "Water droplets on spider web, shot with 100mm macro lens.",
    uploaderName: "MacroWorld",
    mediaType: "image",
    blob: null,
    sampleSrc:
      "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80",
  },
  {
    id: BigInt(-6),
    title: "Cinematic Desert Walk",
    description:
      "Slow-motion walk through the Sahara at golden hour, 120fps slowed to 24.",
    uploaderName: "DesertDrift",
    mediaType: "video",
    blob: null,
    sampleSrc:
      "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=600&q=80",
  },
];

export default function MediaPage() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: profile } = useCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();

  const { data: mediaItems, isLoading, isError } = useAllMediaItems();
  const createMedia = useCreateMediaItem();
  const deleteMedia = useDeleteMediaItem();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSample = !mediaItems || mediaItems.length === 0;
  const displayItems = isSample ? SAMPLE_MEDIA : mediaItems;

  const resetUploadForm = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setUploadProgress(0);
  };

  const handleFileChange = useCallback(
    (selectedFile: File | null) => {
      if (!selectedFile) return;
      if (
        !selectedFile.type.startsWith("image/") &&
        !selectedFile.type.startsWith("video/")
      ) {
        toast.error("Only image and video files are supported.");
        return;
      }
      setFile(selectedFile);
      if (!title) setTitle(selectedFile.name.replace(/\.[^.]+$/, ""));
    },
    [title],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFileChange(dropped);
    },
    [handleFileChange],
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    const uploaderName = profile?.name || "Anonymous";
    const mediaType = file.type.startsWith("video/") ? "video" : "image";
    try {
      await createMedia.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        file,
        mediaType,
        uploaderName,
        onProgress: setUploadProgress,
      });
      toast.success("Media uploaded successfully!");
      resetUploadForm();
      setUploadOpen(false);
    } catch {
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteMedia.mutateAsync(id);
      toast.success("Media deleted.");
    } catch {
      toast.error("Failed to delete media.");
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <Badge
            variant="outline"
            className="mb-2 text-teal border-teal/30 bg-teal/10 font-medium"
          >
            Media Library
          </Badge>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
            Images &amp; Videos
          </h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-lg">
            Browse and share high-quality images and videos from our community.
          </p>
        </div>
        {isLoggedIn && (
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-teal hover:bg-teal/90 text-primary-foreground font-semibold shadow-teal shrink-0"
            data-ocid="media.upload_button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Media
          </Button>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          data-ocid="media.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl overflow-hidden">
              <Skeleton className="aspect-square w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div
          className="flex items-center gap-3 rounded-xl p-6 bg-destructive/10 border border-destructive/30 text-destructive"
          data-ocid="media.error_state"
        >
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">Failed to load media. Please refresh.</p>
        </div>
      ) : displayItems.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 py-24 text-center glass-card rounded-xl"
          data-ocid="media.empty_state"
        >
          <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-teal" />
          </div>
          <div>
            <p className="font-display text-xl font-semibold text-foreground">
              No media yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload the first image or video!
            </p>
          </div>
          {isLoggedIn && (
            <Button
              onClick={() => setUploadOpen(true)}
              className="bg-teal hover:bg-teal/90 text-primary-foreground mt-2"
              data-ocid="media.upload_button"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          )}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.05 } },
          }}
          data-ocid="media.grid"
        >
          {displayItems.map((item, idx) => (
            <MediaCard
              key={item.id.toString()}
              item={item as MediaItem & { sampleSrc?: string }}
              isAdmin={!!isAdmin && !isSample}
              onDelete={() => handleDelete(item.id)}
              index={idx + 1}
              isDeleting={deleteMedia.isPending}
            />
          ))}
        </motion.div>
      )}

      {/* Upload Dialog */}
      <AnimatePresence>
        {uploadOpen && (
          <Dialog
            open={uploadOpen}
            onOpenChange={(open) => {
              if (!open) {
                resetUploadForm();
              }
              setUploadOpen(open);
            }}
          >
            <DialogContent className="max-w-lg bg-card border-border shadow-card">
              <DialogHeader>
                <DialogTitle className="font-display text-xl font-bold flex items-center gap-2">
                  <CloudUpload className="w-5 h-5 text-teal" />
                  Upload Media
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Share images and videos with the community.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUpload} className="space-y-4 mt-2">
                {/* Dropzone */}
                <button
                  type="button"
                  className={`relative w-full border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-teal bg-teal/10"
                      : file
                        ? "border-teal/50 bg-teal/5"
                        : "border-border hover:border-teal/40 hover:bg-muted/30"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  data-ocid="upload_media.dropzone"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileChange(e.target.files?.[0] ?? null)
                    }
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      {file.type.startsWith("video/") ? (
                        <Film className="w-8 h-8 text-teal" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-teal" />
                      )}
                      <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">
                        Drop file here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images and videos supported
                      </p>
                    </div>
                  )}
                </button>

                <div className="space-y-2">
                  <Label htmlFor="media-title">Title</Label>
                  <Input
                    id="media-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Give your media a title"
                    maxLength={200}
                    className="bg-muted/30"
                    data-ocid="upload_media.title_input"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="media-desc">Description</Label>
                  <Textarea
                    id="media-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional — describe your media, camera settings, etc."
                    rows={3}
                    maxLength={1000}
                    className="bg-muted/30 resize-none"
                    data-ocid="upload_media.textarea"
                  />
                </div>

                {createMedia.isPending && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Uploading…</span>
                      <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      resetUploadForm();
                      setUploadOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!file || !title.trim() || createMedia.isPending}
                    className="bg-teal hover:bg-teal/90 text-primary-foreground"
                    data-ocid="upload_media.submit_button"
                  >
                    {createMedia.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Media Card ───────────────────────────────────────────────────────────────

interface MediaCardProps {
  item: MediaItem & { sampleSrc?: string };
  isAdmin: boolean;
  onDelete: () => void;
  index: number;
  isDeleting: boolean;
}

function MediaCard({
  item,
  isAdmin,
  onDelete,
  index,
  isDeleting,
}: MediaCardProps) {
  const [imgError, setImgError] = useState(false);
  const src = item.sampleSrc || (item.blob ? item.blob.getDirectURL() : "");
  const isVideo = item.mediaType === "video";

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
      }}
      className="group relative glass-card rounded-xl overflow-hidden shadow-card hover:shadow-teal transition-all"
      data-ocid={`media.item.${index}`}
    >
      {/* Thumbnail */}
      <div className="aspect-square relative bg-muted overflow-hidden">
        {imgError || !src ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            {isVideo ? (
              <Film className="w-10 h-10 text-muted-foreground" />
            ) : (
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
        ) : isVideo ? (
          <>
            <img
              src={src}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={src}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        )}

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="outline"
            className={`text-xs border-0 backdrop-blur-sm ${
              isVideo ? "bg-black/60 text-white" : "bg-black/50 text-white"
            }`}
          >
            {isVideo ? (
              <Film className="w-3 h-3 mr-1" />
            ) : (
              <ImageIcon className="w-3 h-3 mr-1" />
            )}
            {isVideo ? "Video" : "Image"}
          </Badge>
        </div>

        {/* Delete (admin) */}
        {isAdmin && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="destructive"
              className="w-7 h-7 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              data-ocid={`media.item.${index}`}
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-display font-semibold text-sm text-foreground line-clamp-1 mb-0.5">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {item.description}
          </p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span className="truncate">{item.uploaderName}</span>
        </div>
      </div>
    </motion.div>
  );
}
