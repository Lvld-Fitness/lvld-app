import { useState, useRef } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function StoryUploadModal({ onClose, userData }) {
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [textY, setTextY] = useState(50);
  const navigate = useNavigate();
  const dragStartY = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setMedia(file);
  };

  const handleUpload = async () => {
    if (!media || !userData) return;
    setUploading(true);
    try {
      const ext = media.name.split('.').pop();
      const fileRef = ref(storage, `stories/${userData.uid}_${Date.now()}.${ext}`);
      await uploadBytes(fileRef, media, { contentType: media.type });

      const url = await getDownloadURL(fileRef);
      const type = media.type.startsWith('video') ? 'video' : 'image';

      const entryRef = collection(db, 'stories', userData.uid, 'entries');
      await addDoc(entryRef, {
        mediaUrl: url,
        mediaType: type,
        timestamp: serverTimestamp(),
        textOverlay: caption
      });

      setUploading(false);
      navigate(`/story/${userData.uid}`);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
      setUploading(false);
    }
  };

  const handleMouseDown = (e) => {
    dragStartY.current = e.clientY;
  };

  const handleMouseUp = () => {
    dragStartY.current = null;
  };

  const handleMouseMove = (e) => {
    if (dragStartY.current !== null) {
      const delta = e.clientY - dragStartY.current;
      setTextY((prev) => Math.min(100, Math.max(0, prev + delta * 0.2)));
      dragStartY.current = e.clientY;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 w-full max-w-md p-4 rounded shadow-xl text-white text-center">
        <h2 className="text-lg font-bold mb-4">Upload to Your Story</h2>

        <input type="file" accept="image/*,video/*" onChange={handleChange} className="mb-3" />

        {media && (
          <div className="relative mb-4 overflow-hidden rounded border border-gray-700"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {media.type.startsWith('video') ? (
              <video src={URL.createObjectURL(media)} controls className="w-full rounded" />
            ) : (
              <img
                src={URL.createObjectURL(media)}
                alt="preview"
                className="w-full rounded transform"
                style={{ transform: `scale(${zoom})` }}
              />
            )}

            {/* Caption Preview Overlay */}
            <div
              style={{ top: `${textY}%` }}
              className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 bg-black bg-opacity-60 rounded"
              onMouseDown={handleMouseDown}
            >
              <p className="text-white">{caption}</p>
            </div>
          </div>
        )}

        {/* Caption Text Input */}
        <input
          type="text"
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full mt-2 px-3 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />

        {/* Zoom Buttons */}
        {media && !media.type.startsWith('video') && (
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={() => setZoom((z) => Math.max(1, z - 0.1))} className="text-white text-xl">➖</button>
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))} className="text-white text-xl">➕</button>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="text-red-400 hover:text-red-600">Cancel</button>
          <button
            onClick={handleUpload}
            disabled={uploading || !media}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            {uploading ? 'Uploading...' : 'Post Story'}
          </button>
        </div>
      </div>
    </div>
  );
}
