import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  isAiTyping: boolean;
  setIsAiTyping: (typing: boolean) => void;
}

const initialMessages: Message[] = [
  {
    id: '1',
    text: "I'm here whenever you want to chat about your training!",
    isUser: false,
  },
];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages(initialMessages);
  }, []);

  const value: ChatContextType = {
    messages,
    addMessage,
    clearMessages,
    isAiTyping,
    setIsAiTyping,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
