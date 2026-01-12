import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCallHistory, CallHistoryEntry } from "@/hooks/useCallHistory";
import { Phone, Video, PhoneIncoming, PhoneOutgoing, PhoneMissed, ArrowLeft, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";
import CallDebugger from "@/components/CallDebugger";

const CallsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-semibold text-foreground">Calls</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-24">
        <div className="mx-auto max-w-2xl px-4 py-4 space-y-6">
          {/* Debug Component - Remove in production */}
          <CallDebugger />
          
          <CallHistoryList />
        </div>
      </main>

      <BottomNav activeId="calls" onNavigate={(id) => {
        if (id === "discover") navigate("/discover");
        else if (id === "likes") navigate("/likes");
        else if (id === "messages") navigate("/chat");
        else if (id === "calls") navigate("/calls");
        else if (id === "profile") navigate("/profile");
        else navigate("/");
      }} />
    </div>
  );
};

const CallHistoryList = () => {
  const { callHistory, isLoading } = useCallHistory();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-card p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (callHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <Phone className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="mb-2 text-lg font-semibold text-foreground">No calls yet</h2>
        <p className="text-sm text-muted-foreground">
          Start a conversation to make your first call
        </p>
      </div>
    );
  }

  const handleCallback = (entry: CallHistoryEntry) => {
    navigate(`/chat?userId=${entry.other_user?.id}`);
  };

  return (
    <div className="space-y-2">
      {callHistory.map((entry) => (
        <CallHistoryItem key={entry.id} entry={entry} onCallback={handleCallback} />
      ))}
    </div>
  );
};

interface CallHistoryItemProps {
  entry: CallHistoryEntry;
  onCallback: (entry: CallHistoryEntry) => void;
}

const CallHistoryItem = ({ entry, onCallback }: CallHistoryItemProps) => {
  const isMissed = entry.status === "missed";
  const isRejected = entry.status === "rejected";
  const isAnswered = entry.status === "answered";

  const getStatusIcon = () => {
    if (isMissed) {
      return <PhoneMissed className="h-4 w-4 text-destructive" />;
    }
    if (entry.is_outgoing) {
      return <PhoneOutgoing className="h-4 w-4 text-primary" />;
    }
    return <PhoneIncoming className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (isMissed) return "Missed";
    if (isRejected) return "Declined";
    if (isAnswered && entry.duration_seconds > 0) {
      const mins = Math.floor(entry.duration_seconds / 60);
      const secs = entry.duration_seconds % 60;
      return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    }
    return entry.is_outgoing ? "Outgoing" : "Incoming";
  };

  const avatarUrl =
    entry.other_user?.avatar_url ||
    (entry.other_user?.photos && entry.other_user.photos.length > 0
      ? entry.other_user.photos[0]
      : undefined);

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl bg-card p-4 transition-colors hover:bg-muted/50",
        isMissed && "bg-destructive/5"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-12 w-12">
        <AvatarImage src={avatarUrl} alt={entry.other_user?.name} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {entry.other_user?.name?.charAt(0) || "?"}
        </AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate font-medium",
              isMissed ? "text-destructive" : "text-foreground"
            )}
          >
            {entry.other_user?.name || "Unknown"}
          </span>
          {entry.call_type === "video" ? (
            <Video className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getStatusIcon()}
          <span>{getStatusText()}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</span>
        </div>
      </div>

      {/* Callback button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-primary hover:bg-primary/10"
        onClick={() => onCallback(entry)}
      >
        {entry.call_type === "video" ? (
          <Video className="h-5 w-5" />
        ) : (
          <Phone className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default CallsPage;
