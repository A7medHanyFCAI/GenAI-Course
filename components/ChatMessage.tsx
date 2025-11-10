
import React from 'react';
import { Message, Sender } from '../types';
import { BotIcon, UserIcon } from './icons';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.sender === Sender.AI;

  const renderContent = () => (
    <div
      className={`relative px-4 py-3 rounded-2xl max-w-lg md:max-w-2xl shadow-md ${
        isAI
          ? 'bg-slate-700 rounded-bl-none'
          : 'bg-sky-600 text-white rounded-br-none'
      }`}
    >
        {message.attachment && (
            <div className="mb-2">
                {message.attachment.type.startsWith('image/') ? (
                    <img src={message.attachment.url} alt="Attachment" className="max-w-xs rounded-lg max-h-64" />
                ) : (
                    <a href={message.attachment.url} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:underline">
                        View Attachment
                    </a>
                )}
            </div>
        )}
      {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
    </div>
  );

  return (
    <div
      className={`flex items-start space-x-4 ${
        isAI ? 'justify-start' : 'justify-end'
      }`}
    >
      {isAI && <BotIcon />}
      {renderContent()}
      {!isAI && <UserIcon />}
    </div>
  );
};
