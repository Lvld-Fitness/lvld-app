import { useState } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function StoryUploadModal({ onClose, userData }) {
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!media || !userData) return;
    setUploading(true);
  
    try {
      console.log('Uploading story for:', userData.uid);
  
      const ext = media.name.split('.').pop();
      const fileRef = ref(storage, `stories/${userData.uid}_${Date.now()}.${ext}`);
  
      await uploadBytes(fileRef, media, {
        contentType: media.type
      });
  
      const url = await getDownloadURL(fileRef);
      const type = media.type.startsWith('video') ? 'video' : 'image';
  
      const entryRef = collection(db, 'stories', userData.uid, 'entries');
      await addDoc(entryRef, {
        mediaUrl: url,
        mediaType: type,
        timestamp: serverTimestamp()
      });
  
      console.log('Story uploaded!');
      await new Promise((res) => setTimeout(res, 500));
  
      setUploading(false);
    window.location.href = `/story/${userData.uid}`;
    } catch (err) {
      console.error('Story upload failed:', err);
      alert('Upload failed');
      setUploading(false);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center px-4">
      <div className="bg-gray-900 w-full max-w-md p-6 rounded shadow-xl text-white">
        <h2 className="text-lg font-bold mb-4">Upload to Your Story</h2>

        {previewUrl && (
          <div className="mb-4">
            {media?.type.startsWith('video') ? (
              <video src={previewUrl} controls className="w-full rounded" />
            ) : (
              <img src={previewUrl} alt="preview" className="w-full rounded" />
            )}
          </div>
        )}

        <input type="file" accept="image/*,video/*" onChange={handleChange} className="mb-4" />

        <div className="flex justify-between">
          <button onClick={onClose} className="text-red-400 hover:text-red-600">Cancel</button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            {uploading ? 'Uploading...' : 'Post Story'}
          </button>
        </div>
      </div>
    </div>
  );
}
