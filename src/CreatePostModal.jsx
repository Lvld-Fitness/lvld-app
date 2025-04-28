// CreatePostModal.jsx
import { useState } from 'react';
import { db, storage, auth } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function CreatePostModal({ onClose }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    setUploading(true);
    const user = auth.currentUser;
    if (!user) return;

    let mediaUrl = '';
    let type = '';

    try {
      if (media) {
        const ext = media.name.split('.').pop();
        const fileRef = ref(storage, `posts/${user.uid}_${Date.now()}.${ext}`);
        await uploadBytes(fileRef, media, {
          contentType: media.type,
          customMetadata: { uploadedBy: user.uid }
        });
        mediaUrl = await getDownloadURL(fileRef);
        type = media.type.startsWith('video') ? 'video' : 'image';
      }

      await addDoc(collection(db, 'posts'), {
        userId: user.uid,
        content,
        mediaUrl,
        mediaType: type,
        timestamp: serverTimestamp(),
        likes: [],
        comments: []
      });

      setUploading(false);
      onClose();
    } catch (err) {
      console.error('Post failed:', err.code || err.message, err);
      alert(`Something went wrong while posting. Error: ${err.code || err.message}`);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 w-full max-w-md p-6 rounded shadow-xl text-white relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Create a Post</h2>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a status..."
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white resize-none"
        />

        {previewUrl && (
          <div className="flex justify-center items-center mb-4">
            {media?.type.startsWith('video') ? (
              <video
                src={previewUrl}
                controls
                className="max-h-[50vh] w-auto rounded object-contain"
              />
            ) : (
              <img
                src={previewUrl}
                alt="preview"
                className="max-h-[50vh] w-auto rounded object-contain"
              />
            )}
          </div>
        )}

        <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="mb-4" />

        {/* Sticky Button Bar */}
        <div className="flex justify-between bg-gray-900 pt-4">
          <button onClick={onClose} className="text-red-400 hover:text-red-600 font-bold">
            Cancel
          </button>
          <button
            onClick={handlePost}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-bold"
          >
            {uploading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
