import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Phone, Video, MoreVertical, Image, Smile, Check, CheckCheck } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Match {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
  status: "sent" | "delivered" | "read";
}

const mockMatches: Match[] = [
  { id: "1", name: "Priya Shah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", lastMessage: "Would love to visit Palit...", time: "2m", unread: 2, online: true },
  { id: "2", name: "Ananya Jain", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", lastMessage: "That sounds wonderful 🙏", time: "1h", unread: 0, online: false },
  { id: "3", name: "Kavya Mehta", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop", lastMessage: "My family would love to mee...", time: "3h", unread: 0, online: true },
];

const mockMessages: Message[] = [
  { id: "1", sender: "them", text: "Namaste! 🙏 I saw we have a 92% match!", time: "10:30 AM", status: "read" },
  { id: "2", sender: "me", text: "Namaste! Yes, I noticed that too. Your profile is wonderful!", time: "10:32 AM", status: "read" },
  { id: "3", sender: "them", text: "Thank you! I loved your answer about Palitana being your favorite tirth", time: "10:33 AM", status: "read" },
  { id: "4", sender: "me", text: "It's truly a spiritual experience. Have you been there?", time: "10:35 AM", status: "read" },
  { id: "5", sender: "them", text: "Yes! Multiple times with family. Would love to visit Palitana together!", time: "10:36 AM", status: "read" },
];

const ChatPage = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(mockMatches[0]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!message.trim()) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "sent",
    };
    setMessages([...messages, newMessage]);
    setMessage("");
  };

  const showChatView = selectedMatch !== null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Main container matching navbar max-width */}
      <div className="mx-auto flex max-w-6xl px-6 pt-20 md:pt-24 lg:px-12">
        {/* Match List - Desktop Sidebar / Mobile Full Screen */}
        <div className={`flex-shrink-0 border-r border-border bg-card md:w-72 ${showChatView ? "hidden md:block" : "block w-full"}`}>
          <div className="p-6">
            <h2 className="font-serif text-2xl font-light text-foreground">Messages</h2>
            <div className="mt-6 space-y-1">
              {mockMatches.map((match) => (
                <motion.button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                    selectedMatch?.id === match.id ? "bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-12 w-12 overflow-hidden rounded-full">
                      <img src={match.avatar} alt={match.name} className="h-full w-full object-cover" />
                    </div>
                    {match.online && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card bg-green-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{match.name}</span>
                      <span className="text-xs text-muted-foreground">{match.time}</span>
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{match.lastMessage}</p>
                  </div>
                  {match.unread > 0 && (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                      {match.unread}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat View */}
        <div className={`flex min-h-[calc(100vh-5rem)] flex-1 flex-col md:min-h-[calc(100vh-6rem)] ${!showChatView ? "hidden md:flex" : "flex"}`}>
          {selectedMatch ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3 md:px-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedMatch(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border md:hidden">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="h-11 w-11 overflow-hidden rounded-full">
                    <img src={selectedMatch.avatar} alt={selectedMatch.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{selectedMatch.name}</p>
                    <p className="text-sm text-green-500">{selectedMatch.online ? "Online" : "Last seen recently"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Video className="h-5 w-5" />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.sender === "me"
                            ? "bg-foreground text-background"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <div className={`mt-1.5 flex items-center justify-end gap-1 text-xs ${msg.sender === "me" ? "text-background/60" : "text-muted-foreground"}`}>
                          <span>{msg.time}</span>
                          {msg.sender === "me" && (
                            msg.status === "read" ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="border-t border-border bg-background p-4">
                <div className="flex items-center gap-3">
                  <button className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                    <Image className="h-5 w-5" />
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="w-full rounded-full border border-border bg-muted/30 px-5 py-3 pr-12 text-foreground placeholder:text-muted-foreground focus:border-foreground/30 focus:outline-none"
                    />
                    <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
                      <Smile className="h-5 w-5" />
                    </button>
                  </div>
                  <motion.button
                    onClick={handleSend}
                    className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-foreground text-background"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Send className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <Send className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="font-serif text-2xl font-light">Select a conversation</h3>
              <p className="mt-2 text-muted-foreground">Choose from your matches to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
