import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { User, Bot, Send, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { UserHeader } from "@/components/user-header";
import { useMultiAgentMutation, useChatMutation } from "@/services/lmm";
import { toast } from "sonner";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { RootState } from "@/store";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'simple' | 'research'>('simple');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const { statusUpdate } = useWebSocket();
  
  const [sendQuery, { data: researchData, error: researchError, isLoading: isResearchLoading }] = useMultiAgentMutation();
  const [sendChat, { data: chatData, error: chatError, isLoading: isChatLoading }] = useChatMutation();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user" as const, content: input };
    setMessages((msgs) => [...msgs, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);
    
    if (chatMode === 'research') {
      sendQuery({ query: currentInput });
    } else {
      sendChat({ userPrompt: currentInput });
    }
  };

  // Handle research responses
  useEffect(() => {
    if (researchData) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: researchData.final },
      ]);
      setLoading(false);
    }
    if (researchError) {
      toast.error("Research failed");
      setLoading(false);
    }
  }, [researchData, researchError]);

  // Handle simple chat responses
  useEffect(() => {
    if (chatData) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: chatData.reply },
      ]);
      setLoading(false);
    }
    if (chatError) {
      toast.error("Chat failed");
      setLoading(false);
    }
  }, [chatData, chatError]);

  // Handle loading states
  useEffect(() => {
    setLoading(isResearchLoading || isChatLoading);
  }, [isResearchLoading, isChatLoading]);

  return (
    <div className="flex flex-col h-[90vh] w-full max-w-4xl mx-auto bg-muted/50 rounded-2xl shadow-xl p-0 md:p-8 sm:p-4 transition-colors">
      {/* Header with user info and controls */}
      <UserHeader />
      
      {/* Chat Mode Toggle */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-background/50">
        <Button
          variant={chatMode === 'simple' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChatMode('simple')}
        >
          Simple Chat
        </Button>
        <Button
          variant={chatMode === 'research' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setChatMode('research')}
        >
          <Sparkles className="w-4 h-4 mr-1" />
          Research Mode
        </Button>
      </div>
      {/* Chat area */}
      <Card className="flex-1 flex flex-col overflow-hidden bg-background/80 shadow-none border-none rounded-none">
        <CardContent className="flex-1 overflow-y-auto px-1 md:px-4 pb-2">
          <div className="flex flex-col gap-4 py-4">
            {messages.length === 0 && (
              <div className="text-muted-foreground text-center mt-8 space-y-2">
                <p>Hello {user?.name}! 👋</p>
                <p>
                  {chatMode === 'research' 
                    ? "Ask me anything and I'll research it for you using multiple sources."
                    : "I'm here to help you with any questions you have."
                  }
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 items-end ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border text-muted-foreground">
                    <Bot className="h-5 w-5" />
                  </span>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 max-w-[90vw] md:max-w-[70%] whitespace-pre-wrap text-sm shadow-md transition-colors ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground border rounded-bl-md"
                  }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === "user" && (
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground">
                    <User className="h-5 w-5" />
                  </span>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-end justify-start">
                <span className="flex items-center justify-center h-8 w-8 rounded-full bg-muted border text-muted-foreground animate-pulse">
                  <Bot className="h-5 w-5" />
                </span>
                <div className="rounded-2xl px-4 py-2 max-w-[90vw] md:max-w-[70%] bg-muted text-foreground border rounded-bl-md shadow-md animate-pulse">
                  <span className="opacity-60">
                    {statusUpdate?.message || "Assistant is typing..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </CardContent>
      </Card>
      {/* Divider */}
      <Separator className="my-2" />
      {/* Input area */}
      <form
        className="flex gap-2 px-2 md:px-0"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          className="flex-1 bg-background border-border"
          placeholder={chatMode === 'research' ? "Ask me to research anything..." : "Type your message..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          autoFocus
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="h-11 px-6"
        >
          {loading ? (
            <span className="animate-pulse">...</span>
          ) : (
            <>
              <Send className="w-4 h-4 mr-1" />
              Send
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

export default Dashboard;
