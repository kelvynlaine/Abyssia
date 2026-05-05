import React, { useState } from 'react';
import { Plus, MessageSquare, Menu, X, Edit2, Trash2, Check } from 'lucide-react';

export const Sidebar = ({ 
  conversations, 
  currentId, 
  onSelect, 
  onNew, 
  onRename,
  onDelete,
  isOpen, 
  onClose 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditClick = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim() !== '') {
      onRename(id, editTitle);
    }
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer cette conversation ?')) {
      onDelete(id);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 5 }}
          onClick={onClose}
        />
      )}
      
      <div className={`sidebar liquid-glass-panel ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Conversations</h2>
          <button className="menu-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <button className="glass-button" style={{ padding: '12px' }} onClick={() => { onNew(); onClose(); }}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Nouvelle conversation
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', flex: 1, marginTop: '16px' }}>
          {conversations.map(conv => (
            <div 
              key={conv.id}
              className={`history-item ${conv.id === currentId ? 'active' : ''}`}
              onClick={() => { if(editingId !== conv.id) { onSelect(conv.id); onClose(); } }}
              style={{ justifyContent: 'space-between' }}
            >
              {editingId === conv.id ? (
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '8px' }}>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(e, conv.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      flex: 1, 
                      background: 'rgba(0,0,0,0.3)', 
                      border: '1px solid rgba(255,255,255,0.2)', 
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      outline: 'none'
                    }}
                  />
                  <button onClick={(e) => handleSaveRename(e, conv.id)} className="action-btn" style={{ padding: '2px' }}>
                    <Check size={14} color="#14b8a6" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="action-btn" style={{ padding: '2px' }}>
                    <X size={14} color="#ec4899" />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <MessageSquare size={16} style={{ flexShrink: 0 }} />
                    <p style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.title}</p>
                  </div>
                  <div className="history-actions" style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={(e) => handleEditClick(e, conv)} className="action-btn" style={{ padding: '4px' }} title="Renommer">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={(e) => handleDelete(e, conv.id)} className="action-btn" style={{ padding: '4px' }} title="Supprimer">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          {conversations.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '20px', fontSize: '0.9rem' }}>
              Aucune conversation
            </p>
          )}
        </div>
      </div>
    </>
  );
};
