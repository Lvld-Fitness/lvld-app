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

    if (media) {
      const ext = media.name.split('.').pop();
      const fileRef = ref(storage, `posts/${user.uid}_${Date.now()}.${ext}`);
      await uploadBytes(fileRef, media);
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
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 w-full max-w-md p-6 rounded shadow-xl text-white">
        <h2 className="text-lg font-bold mb-4">Create a Post</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a status..."
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white resize-none"
        />

        {previewUrl && (
          <div className="mb-4">
            {media?.type.startsWith('video') ? (
              <video src={previewUrl} controls className="w-full rounded" />
            ) : (
              <img src={previewUrl} alt="preview" className="w-full rounded" />
            )}
          </div>
        )}

        <input type="file" accept="image/*,video/*" onChange={handleMediaChange} className="mb-4" />

        <div className="flex justify-between">
          <button onClick={onClose} className="text-red-400 hover:text-red-600">Cancel</button>
          <button
            onClick={handlePost}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            {uploading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
