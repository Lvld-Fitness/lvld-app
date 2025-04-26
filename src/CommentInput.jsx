// CommentInput.jsx
import { useRef, useState } from 'react';

export default function CommentInput({ onSend, placeholder = "Write a comment...", text = "", media = null }) {
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const fileRef = useRef();

  const handleSend = () => {
    if (!text.trim() && !media) return;
    onSend({ text: text.trim(), media });
    setText('');
    setMedia(null);
  };

  return (
    <div className={`mt-2 flex ${small ? 'gap-2' : 'gap-3'} items-center`}>      
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className={`flex-1 rounded bg-gray-700 text-white px-3 py-2 text-sm ${small ? 'text-xs' : ''}`}
      />

      <input
        type="file"
        accept="image/*,video/*"
        ref={fileRef}
        style={{ display: 'none' }}
        onChange={(e) => setMedia(e.target.files[0])}
      />

      <button
        onClick={handleSend}
        className="text-sm text-green-400 hover:text-green-600"
      >
        Post
      </button>
    </div>
  );
}
