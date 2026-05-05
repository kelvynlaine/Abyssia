import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Sparkles, Maximize2, Minimize2, Paperclip, X } from 'lucide-react';
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
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`Le fichier ${file.name} est trop volumineux (max 5MB).`);
        continue;
      }
      try {
        const text = await file.text();
        // Check for binary or bad encoding
        if (text.includes('\x00') || (text.match(//g) || []).length > 10) {
          alert(`Le fichier ${file.name} semble binaire ou a un encodage non supporté.`);
          continue;
        }
        newFiles.push({ name: file.name, content: text });
      } catch (err) {
        alert(`Impossible de lire le fichier ${file.name}.`);
      }
    }
    setAttachedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamingContent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!input.trim() && attachedFiles.length === 0) || isStreaming) return;
    
    onSendMessage(input, attachedFiles);
    setInput('');
    setAttachedFiles([]);
    
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
        {attachedFiles.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {attachedFiles.map((file, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '16px', fontSize: '0.8rem', border: '1px solid var(--glass-border)' }}>
                <Paperclip size={12} style={{ marginRight: '4px', color: 'var(--accent-1)' }} />
                <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                <button onClick={() => removeFile(i)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '6px', display: 'flex' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <form onSubmit={handleSubmit} className="input-container">
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
            accept=".txt,.md,.js,.jsx,.ts,.tsx,.json,.css,.html,.csv,.py"
          />
          <button 
            type="button" 
            className="action-btn" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isStreaming}
            style={{ marginRight: '8px', flexShrink: 0 }}
            title="Joindre un fichier texte"
          >
            <Paperclip size={20} />
          </button>
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
            disabled={(!input.trim() && attachedFiles.length === 0) || isStreaming}
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
