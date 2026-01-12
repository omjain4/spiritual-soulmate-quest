import { motion } from "framer-motion";
import { Check, CheckCheck, Play, FileText, Mic } from "lucide-react";
import { format } from "date-fns";

interface ChatMessageProps {
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  isOwn: boolean;
  isRead: boolean;
  createdAt: string;
}

const ChatMessage = ({
  content,
  mediaUrl,
  mediaType,
  isOwn,
  isRead,
  createdAt,
}: ChatMessageProps) => {
  const time = format(new Date(createdAt), "h:mm a");

  const renderMedia = () => {
    if (!mediaUrl || !mediaType) return null;

    switch (mediaType) {
      case "image":
        return (
          <div className="mb-2 overflow-hidden rounded-xl">
            <img
              src={mediaUrl}
              alt="Shared image"
              className="max-h-64 w-full object-cover"
              loading="lazy"
            />
          </div>
        );
      case "video":
        return (
          <div className="relative mb-2 overflow-hidden rounded-xl">
            <video
              src={mediaUrl}
              controls
              className="max-h-64 w-full"
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="mb-2 flex items-center gap-2 rounded-xl bg-background/50 p-3">
            <Mic className="h-5 w-5" />
            <audio src={mediaUrl} controls className="h-8 flex-1" />
          </div>
        );
      case "file":
        return (
          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-2 flex items-center gap-2 rounded-xl bg-background/50 p-3 transition-colors hover:bg-background/70"
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm underline">View attachment</span>
          </a>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isOwn
            ? "bg-foreground text-background"
            : "bg-muted text-foreground"
        }`}
      >
        {renderMedia()}
        {content && (
          <p className="text-sm leading-relaxed">{content}</p>
        )}
        <div
          className={`mt-1.5 flex items-center justify-end gap-1 text-xs ${
            isOwn ? "text-background/60" : "text-muted-foreground"
          }`}
        >
          <span>{time}</span>
          {isOwn && (
            isRead ? (
              <CheckCheck className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
