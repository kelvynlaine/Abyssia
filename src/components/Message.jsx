import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Edit2, RotateCcw, X, CheckCircle } from 'lucide-react';

export const Message = ({ message, isStreaming, onEdit, onRegenerate }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() !== '' && editContent !== message.content) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  return (
    <div className={`message-wrapper ${isUser ? 'user' : 'ai'} animate-fade-in`}>
      {isUser ? (
        <>
          <div className="message-user-bubble">
            {isEditing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '250px' }}>
                <textarea 
                  className="chat-input glass-input"
                  style={{ minHeight: '60px', padding: '8px', borderRadius: '8px' }}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button className="action-btn" onClick={() => setIsEditing(false)}>
                    <X size={16} />
                  </button>
                  <button className="action-btn" onClick={handleSaveEdit}>
                    <CheckCircle size={16} color="#14b8a6" />
                  </button>
                </div>
              </div>
            ) : (
              message.content
            )}
          </div>
          {!isEditing && (
            <div className="message-actions">
              <button className="action-btn" onClick={() => setIsEditing(true)} title="Modifier">
                <Edit2 size={14} />
              </button>
              <button className="action-btn" onClick={handleCopy} title="Copier">
                {copied ? <Check size={14} color="#14b8a6" /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="message-ai-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content + (isStreaming ? ' ▍' : '')}
            </ReactMarkdown>
          </div>
          {!isStreaming && (
            <div className="message-actions" style={{ justifyContent: 'flex-start' }}>
              <button className="action-btn" onClick={handleCopy} title="Copier">
                {copied ? <Check size={14} color="#14b8a6" /> : <Copy size={14} />}
              </button>
              <button className="action-btn" onClick={() => onRegenerate(message.id)} title="Regénérer">
                <RotateCcw size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
