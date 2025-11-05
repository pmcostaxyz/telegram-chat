import { useState } from "react";
import Header from "@/components/Header";
import BotSetup from "@/components/BotSetup";
import MessageForm from "@/components/MessageForm";
import MessageList from "@/components/MessageList";
import type { Message } from "@/components/MessageForm";

const Index = () => {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleBotSetup = (token: string, chat: string) => {
    setBotToken(token);
    setChatId(chat);
    setIsSetup(true);
  };

  const handleSendMessage = (message: Message) => {
    setMessages([message, ...messages]);
  };

  const handleDeleteMessage = (id: string) => {
    setMessages(messages.filter((msg) => msg.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <BotSetup onSetup={handleBotSetup} isSetup={isSetup} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <MessageForm onSendMessage={handleSendMessage} disabled={!isSetup} />
            <MessageList messages={messages} onDeleteMessage={handleDeleteMessage} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
