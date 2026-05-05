import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useConversations = () => {
  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('liquid-glass-conversations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [currentId, setCurrentId] = useState(() => {
    if (conversations.length > 0) return conversations[0].id;
    return null;
  });

  useEffect(() => {
    localStorage.setItem('liquid-glass-conversations', JSON.stringify(conversations));
  }, [conversations]);

  const currentConversation = conversations.find(c => c.id === currentId) || null;

  const createNewConversation = () => {
    const newConv = {
      id: uuidv4(),
      title: 'Nouvelle conversation',
      messages: [],
      updatedAt: Date.now()
    };
    setConversations([newConv, ...conversations]);
    setCurrentId(newConv.id);
    return newConv.id;
  };

  const addMessage = (conversationId, message) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        // Generate title from first user message if it's "Nouvelle conversation"
        let title = conv.title;
        if (title === 'Nouvelle conversation' && message.role === 'user') {
          title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
        }
        return {
          ...conv,
          title,
          messages: [...conv.messages, { ...message, id: uuidv4() }],
          updatedAt: Date.now()
        };
      }
      return conv;
    }).sort((a, b) => b.updatedAt - a.updatedAt));
  };

  const updateMessage = (conversationId, messageId, newContent) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: conv.messages.map(m => 
            m.id === messageId ? { ...m, content: newContent } : m
          ),
          updatedAt: Date.now()
        };
      }
      return conv;
    }));
  };

  const deleteMessageHistoryAfter = (conversationId, messageId) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const index = conv.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
          return {
            ...conv,
            messages: conv.messages.slice(0, index + 1), // Keep up to the edited/regenerated message
            updatedAt: Date.now()
          };
        }
      }
      return conv;
    }));
  };

  const renameConversation = (conversationId, newTitle) => {
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, title: newTitle, updatedAt: Date.now() };
      }
      return conv;
    }));
  };

  const deleteConversation = (conversationId) => {
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.id !== conversationId);
      // If we deleted the current conversation, switch to the first available one
      if (currentId === conversationId) {
        setCurrentId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  return {
    conversations,
    currentId,
    setCurrentId,
    currentConversation,
    createNewConversation,
    addMessage,
    updateMessage,
    deleteMessageHistoryAfter,
    renameConversation,
    deleteConversation
  };
};
