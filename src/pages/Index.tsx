import { useState } from "react";
import Header from "@/components/Header";
import PersonalAccountSetup from "@/components/PersonalAccountSetup";
import MessageForm from "@/components/MessageForm";
import MessageList from "@/components/MessageList";
import type { Message } from "@/components/MessageForm";

const Index = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [isSetup, setIsSetup] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const handleAccountSetup = (phone: string, id: string, hash: string) => {
    setPhoneNumber(phone);
    setApiId(id);
    setApiHash(hash);
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
          <PersonalAccountSetup onSetup={handleAccountSetup} isSetup={isSetup} />
          
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
