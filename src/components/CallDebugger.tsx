import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CallEvent {
  id: string;
  event: string;
  timestamp: string;
  data: any;
}

interface VideoCallPayload {
  new?: { status?: string; [key: string]: any };
  old?: { status?: string; [key: string]: any };
  eventType?: string;
}

const CallDebugger = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CallEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!user || !isListening) return;

    console.log("Starting call debugger for user:", user.id);

    const channel = supabase
      .channel(`call-debugger-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "video_calls",
        },
        (payload: VideoCallPayload) => {
          console.log("Call event received:", payload);
          const newEvent: CallEvent = {
            id: Date.now().toString(),
            event: `${payload.eventType} - ${payload.new?.status || payload.old?.status || 'unknown'}`,
            timestamp: new Date().toLocaleTimeString(),
            data: payload,
          };
          setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Cleaning up call debugger");
      supabase.removeChannel(channel);
    };
  }, [user, isListening]);

  const testCreateCall = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("video_calls")
        .insert({
          caller_id: user.id,
          callee_id: user.id, // Self-call for testing
          conversation_id: "test-conversation",
          status: "ringing",
          call_type: "video",
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating test call:", error);
      } else {
        console.log("Test call created:", data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  if (!user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Call Debugger</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please log in to use the call debugger.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Call Debugger</CardTitle>
        <p className="text-sm text-muted-foreground">
          User ID: {user.id}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => setIsListening(!isListening)}
            variant={isListening ? "destructive" : "default"}
          >
            {isListening ? "Stop Listening" : "Start Listening"}
          </Button>
          <Button onClick={testCreateCall} variant="outline">
            Test Create Call
          </Button>
          <Button onClick={clearEvents} variant="outline">
            Clear Events
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Real-time Events:</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {isListening ? "Listening for events..." : "Not listening"}
              </p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="p-2 bg-muted rounded text-sm"
                >
                  <div className="font-medium">
                    {event.timestamp} - {event.event}
                  </div>
                  <pre className="text-xs mt-1 overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallDebugger;