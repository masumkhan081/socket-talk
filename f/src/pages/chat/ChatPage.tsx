import React from 'react';

const ChatPage = () => {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">Chat</h1>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-gray-600 text-center mt-10">
          Select a conversation to start chatting
        </p>
      </div>
    </div>
  );
};

export default ChatPage;
