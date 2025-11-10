
import React, { useState, useRef, useCallback } from 'react';
import { Attachment } from '../types';
import { fileToBase64 } from '../utils/fileUtils';
import { PaperclipIcon, SendIcon, XIcon } from './icons';

interface InputBarProps {
  onSendMessage: (prompt: string, attachment: Attachment | null) => void;
  isLoading: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSendMessage, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert("File size exceeds 10MB limit.");
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setAttachment({ file, base64, mimeType: file.type });
        if (file.type.startsWith('image/')) {
          setPreviewUrl(URL.createObjectURL(file));
        } else {
          setPreviewUrl(null); // No preview for non-image files
        }
      } catch (error) {
        console.error("Error handling file:", error);
        alert("Could not process file.");
      }
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || (!prompt.trim() && !attachment)) return;
    onSendMessage(prompt, attachment);
    setPrompt('');
    removeAttachment();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-slate-800 rounded-xl p-2 flex items-end">
      {attachment && (
        <div className="absolute bottom-full left-0 mb-2 p-2 bg-slate-700 rounded-lg shadow-lg">
            <div className="relative">
                {previewUrl && <img src={previewUrl} alt="preview" className="max-h-24 rounded-md" />}
                {!previewUrl && <div className="p-2 text-sm bg-slate-600 rounded-md">{attachment.file.name}</div>}
                <button
                    type="button"
                    onClick={removeAttachment}
                    className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                    aria-label="Remove attachment"
                >
                    <XIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-3 text-slate-400 hover:text-sky-400 transition-colors"
        aria-label="Attach file"
        disabled={isLoading}
      >
        <PaperclipIcon className="w-6 h-6" />
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,text/plain,application/pdf"
      />
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message or /generate an image..."
        className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none resize-none max-h-40 px-2"
        rows={1}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || (!prompt.trim() && !attachment)}
        className="p-3 bg-sky-600 text-white rounded-full hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
        aria-label="Send message"
      >
        <SendIcon className="w-6 h-6" />
      </button>
    </form>
  );
};
