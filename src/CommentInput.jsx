import { useState, useRef } from 'react';

export default function CommentInput({ onSend, placeholder = "Write a comment..." }) {
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const fileRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !media) return;

    await onSend({ text, media });
    setText('');
    setMedia(null);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-gray-700 text-white p-2 rounded text-sm"
      />
      <label className="cursor-pointer text-gray-400 hover:text-white">
        📎
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileRef}
          style={{ display: 'none' }}
          onChange={(e) => setMedia(e.target.files[0])}
        />
      </label>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-1 px-3 rounded"
      >
        Post
      </button>
    </form>
  );
}
