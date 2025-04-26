// CommentInput.jsx
import { useState } from 'react';

export default function CommentInput({ onSend, placeholder = "Write a comment..." }) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim()) return;
    await onSend({ text });
    setText('');
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <input
        type="text"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 bg-gray-700 text-white p-2 rounded"
      />
      <button
        onClick={handleSend}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold"
      >
        Send
      </button>
    </div>
  );
}
