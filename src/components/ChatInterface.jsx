import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { Message } from './Message';

export const ChatInterface = ({
  conversation,
  onSendMessage,
  onEditMessage,
  onRegenerate,
  isStreaming,
  streamingContent,
  onOpenMenu,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamingContent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    
    onSendMessage(input);
    setInput('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const messages = conversation?.messages || [];

  return (
    <div className="main-chat liquid-glass-panel">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button className="menu-btn" onClick={onOpenMenu} style={{ marginRight: '16px' }}>
            <Menu size={24} />
          </button>
          <h1 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--accent-1)" />
            Liquid Glass AI
          </h1>
        </div>
        <button className="action-btn" onClick={onToggleFullscreen} title={isFullscreen ? "Réduire" : "Plein écran"}>
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <Sparkles size={48} color="var(--accent-1)" style={{ marginBottom: '16px' }} />
            <h2>Comment puis-je vous aider aujourd'hui ?</h2>
          </div>
        ) : (
          messages.map((msg, index) => (
            <Message 
              key={msg.id} 
              message={msg} 
              onEdit={onEditMessage}
              onRegenerate={onRegenerate}
            />
          ))
        )}
        
        {isStreaming && (
          <Message 
            message={{ role: 'assistant', content: streamingContent, id: 'streaming' }} 
            isStreaming={true} 
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <form onSubmit={handleSubmit} className="input-container">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Écrivez votre message..."
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming}
          />
          <button 
            type="submit" 
            className="send-btn" 
            disabled={!input.trim() || isStreaming}
          >
            <Send size={18} style={{ marginLeft: '2px' }} />
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
          L'IA peut faire des erreurs. Considérez vérifier les informations importantes.
        </p>
      </div>
    </div>
  );
};
