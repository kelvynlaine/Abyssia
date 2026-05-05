import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { useConversations } from './hooks/useConversations';
import { streamChat } from './services/api';

function App() {
  const {
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
  } = useConversations();

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If there's no current conversation, create one
  useEffect(() => {
    if (conversations.length === 0 && !currentId) {
      createNewConversation();
    }
  }, [conversations.length, currentId, createNewConversation]);

  const handleSendMessage = async (content) => {
    let convId = currentId;
    if (!convId) {
      convId = createNewConversation();
    }

    const userMessage = { role: 'user', content };
    addMessage(convId, userMessage);

    // Prepare history for API
    const history = currentConversation?.messages || [];
    const messagesForApi = [...history, userMessage].map(m => ({ role: m.role, content: m.content }));

    setIsStreaming(true);
    setStreamingContent('');

    await streamChat(
      messagesForApi,
      (text) => setStreamingContent(text),
      (finalText) => {
        setIsStreaming(false);
        addMessage(convId, { role: 'assistant', content: finalText });
        setStreamingContent('');
      },
      (error) => {
        setIsStreaming(false);
        addMessage(convId, { role: 'assistant', content: `**Error:** ${error}` });
        setStreamingContent('');
      }
    );
  };

  const handleEditMessage = async (messageId, newContent) => {
    updateMessage(currentId, messageId, newContent);
    deleteMessageHistoryAfter(currentId, messageId);
    
    // Fetch new conversation state to get the history up to the edited message
    // We need to wait for state to update or calculate it manually
    const editedConv = conversations.find(c => c.id === currentId);
    const msgIndex = editedConv.messages.findIndex(m => m.id === messageId);
    const history = editedConv.messages.slice(0, msgIndex);
    
    const messagesForApi = [...history, { role: 'user', content: newContent }].map(m => ({ role: m.role, content: m.content }));

    setIsStreaming(true);
    setStreamingContent('');

    await streamChat(
      messagesForApi,
      (text) => setStreamingContent(text),
      (finalText) => {
        setIsStreaming(false);
        addMessage(currentId, { role: 'assistant', content: finalText });
        setStreamingContent('');
      },
      (error) => {
        setIsStreaming(false);
        addMessage(currentId, { role: 'assistant', content: `**Error:** ${error}` });
        setStreamingContent('');
      }
    );
  };

  const handleRegenerate = async (messageId) => {
    const conv = conversations.find(c => c.id === currentId);
    const msgIndex = conv.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Find the last user message before this AI message
    let lastUserMsgIndex = msgIndex - 1;
    while (lastUserMsgIndex >= 0 && conv.messages[lastUserMsgIndex].role !== 'user') {
      lastUserMsgIndex--;
    }

    if (lastUserMsgIndex === -1) return; // No user message found to regenerate from

    const lastUserMsg = conv.messages[lastUserMsgIndex];
    deleteMessageHistoryAfter(currentId, lastUserMsg.id);

    const history = conv.messages.slice(0, lastUserMsgIndex);
    const messagesForApi = [...history, { role: 'user', content: lastUserMsg.content }].map(m => ({ role: m.role, content: m.content }));

    setIsStreaming(true);
    setStreamingContent('');

    await streamChat(
      messagesForApi,
      (text) => setStreamingContent(text),
      (finalText) => {
        setIsStreaming(false);
        addMessage(currentId, { role: 'assistant', content: finalText });
        setStreamingContent('');
      },
      (error) => {
        setIsStreaming(false);
        addMessage(currentId, { role: 'assistant', content: `**Error:** ${error}` });
        setStreamingContent('');
      }
    );
  };

  return (
    <>
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>
      
      <div className="app-container">
        {!isFullscreen && (
          <Sidebar 
            conversations={conversations}
            currentId={currentId}
            onSelect={setCurrentId}
            onNew={createNewConversation}
            onRename={renameConversation}
            onDelete={deleteConversation}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        
        <ChatInterface 
          conversation={currentConversation}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onRegenerate={handleRegenerate}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onOpenMenu={() => setIsSidebarOpen(true)}
          isFullscreen={isFullscreen}
          onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        />
      </div>
    </>
  );
}

export default App;

