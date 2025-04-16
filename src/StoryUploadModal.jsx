import { useState, useEffect } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function StoryUploadModal({ onClose, userData }) {
  const [media, setMedia] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!media || !userData) return;

    const upload = async () => {
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
          timestamp: serverTimestamp()
        });

        await new Promise(res => setTimeout(res, 500));
        setUploading(false);
        navigate(`/story/${userData.uid}`);
      } catch (err) {
        console.error('Story upload failed:', err);
        alert('Upload failed');
        setUploading(false);
      }
    };

    upload();
  }, [media, userData, navigate]);

  return null;
}
