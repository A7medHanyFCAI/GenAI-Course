
import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, Attachment } from './types';
import { generateContent } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { InputBar } from './components/InputBar';
import { BotIcon, UserIcon } from './components/icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: Sender.AI,
      text: 'Hello! You can ask me questions, ask me to generate images, or upload an image and ask about it.',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (prompt: string, attachment: Attachment | null) => {
    if (!prompt && !attachment) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: Sender.User,
      text: prompt,
      attachment: attachment ? { url: URL.createObjectURL(attachment.file), type: attachment.mimeType } : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { text, imageUrl } = await generateContent(prompt, attachment);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.AI,
        text: text,
        attachment: imageUrl ? { url: imageUrl, type: 'image/png' } : undefined,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.AI,
        text: 'Sorry, I encountered an error. Please check your API key and try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white font-sans">
        <header className="bg-slate-800 p-4 border-b border-slate-700 shadow-lg">
            <h1 className="text-xl font-bold text-sky-400 text-center">ChatBot</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                    <BotIcon />
                </div>
                <div className="flex items-center space-x-2">
                    <span className="animate-pulse bg-slate-600 rounded-full h-3 w-3"></span>
                    <span className="animate-pulse bg-slate-600 rounded-full h-3 w-3" style={{animationDelay: '200ms'}}></span>
                    <span className="animate-pulse bg-slate-600 rounded-full h-3 w-3" style={{animationDelay: '400ms'}}></span>
                </div>
            </div>
            )}
            <div ref={messagesEndRef} />
        </main>
        <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-700">
            <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
    </div>
  );
};

export default App;
