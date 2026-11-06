import React, { useState } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatArea from '../components/chat/ChatArea';
import ChatDetails from '../components/chat/ChatDetails';
import CreateGroupModal from '../components/chat/CreateGroupModal';
import { useChat } from '../context/ChatContext';

const ChatDashboardPage = () => {
  const { activeConversation, selectConversation } = useChat();

  const [showDetails, setShowDetails] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'

  const handleSelectMobileChat = () => {
    setMobileView('chat');
  };

  const handleBackToSidebar = () => {
    setMobileView('list');
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-[#090d16] overflow-hidden select-none">
      {/* 1. Left Sidebar */}
      <div
        className={`${
          mobileView === 'chat' && activeConversation ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 lg:w-96 h-full flex-shrink-0`}
      >
        <Sidebar
          onOpenCreateGroup={() => setCreateGroupOpen(true)}
          onSelectMobileChat={handleSelectMobileChat}
        />
      </div>

      {/* 2. Center Chat Area */}
      <div
        className={`${
          mobileView === 'list' && !activeConversation ? 'hidden md:flex' : 'flex'
        } flex-1 h-full flex-col min-w-0`}
      >
        <ChatArea
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails((prev) => !prev)}
          onBackToSidebar={handleBackToSidebar}
        />
      </div>

      {/* 3. Right Sidebar Details Panel */}
      {showDetails && activeConversation && (
        <div className="hidden lg:flex h-full flex-shrink-0">
          <ChatDetails
            isOpen={showDetails}
            onClose={() => setShowDetails(false)}
            onOpenAddMember={() => setCreateGroupOpen(true)}
          />
        </div>
      )}

      {/* Group Creation Modal */}
      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
      />
    </div>
  );
};

export default ChatDashboardPage;
