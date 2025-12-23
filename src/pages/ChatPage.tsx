import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Phone, Video, MoreVertical, Image, Smile, Check, CheckCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GlassCard from "@/components/GlassCard";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

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
  { id: "1", name: "Priya Shah", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", lastMessage: "Would love to visit Palitana together!", time: "2m", unread: 2, online: true },
  { id: "2", name: "Ananya Jain", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop", lastMessage: "That sounds wonderful 🙏", time: "1h", unread: 0, online: false },
  { id: "3", name: "Kavya Mehta", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop", lastMessage: "My family would love to meet yours", time: "3h", unread: 0, online: true },
];

const mockMessages: Message[] = [
  { id: "1", sender: "them", text: "Namaste! 🙏 I saw we have a 92% match!", time: "10:30 AM", status: "read" },
  { id: "2", sender: "me", text: "Namaste! Yes, I noticed that too. Your profile is wonderful!", time: "10:32 AM", status: "read" },
  { id: "3", sender: "them", text: "Thank you! I loved your answer about Palitana being your favorite tirth", time: "10:33 AM", status: "read" },
  { id: "4", sender: "me", text: "It's truly a spiritual experience. Have you been there?", time: "10:35 AM", status: "read" },
  { id: "5", sender: "them", text: "Yes! Multiple times with family. Would love to visit Palitana together!", time: "10:36 AM", status: "read" },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("messages");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
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

  // Desktop: Side-by-side layout, Mobile: Either list or chat
  const showChatView = selectedMatch !== null;

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <Navbar />

      {/* Match List - Desktop Sidebar / Mobile Full Screen */}
      <div className={`flex-shrink-0 border-r border-border bg-card pt-20 md:w-80 md:pt-28 ${showChatView ? "hidden md:block" : "block"}`}>
        <div className="p-4">
          <h2 className="mb-4 text-xl font-bold">Messages</h2>
          <div className="space-y-2">
            {mockMatches.map((match) => (
              <motion.button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                  selectedMatch?.id === match.id ? "bg-saffron-light" : "hover:bg-muted"
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="relative">
                  <div className="h-12 w-12 overflow-hidden rounded-full">
                    <img src={match.avatar} alt={match.name} className="h-full w-full object-cover" />
                  </div>
                  {match.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-sage" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{match.name}</span>
                    <span className="text-xs text-muted-foreground">{match.time}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{match.lastMessage}</p>
                </div>
                {match.unread > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {match.unread}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat View */}
      <div className={`flex flex-1 flex-col ${!showChatView ? "hidden md:flex" : "flex"}`}>
        {selectedMatch ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-border bg-card/80 p-4 pt-20 backdrop-blur-lg md:pt-28">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedMatch(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-muted md:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  <img src={selectedMatch.avatar} alt={selectedMatch.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-medium">{selectedMatch.name}</p>
                  <p className="text-xs text-sage">{selectedMatch.online ? "Online" : "Last seen recently"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
                  <Video className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mx-auto max-w-2xl space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        msg.sender === "me"
                          ? "bg-gradient-to-br from-primary to-saffron-glow text-white"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className={`mt-1 flex items-center justify-end gap-1 text-xs ${msg.sender === "me" ? "text-white/70" : "text-muted-foreground"}`}>
                        <span>{msg.time}</span>
                        {msg.sender === "me" && (
                          msg.status === "read" ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="border-t border-border bg-card p-4 pb-safe">
              <div className="mx-auto flex max-w-2xl items-center gap-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                  <Image className="h-5 w-5" />
                </button>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="input-glass pr-10"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
                <motion.button
                  onClick={handleSend}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Send className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Select a conversation</h3>
            <p className="mt-2 text-muted-foreground">Choose from your matches to start chatting</p>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav activeId={activeNav} onNavigate={(id) => { setActiveNav(id); navigate(`/${id === "home" ? "" : id}`); }} />
      </div>
    </div>
  );
};

export default ChatPage;
