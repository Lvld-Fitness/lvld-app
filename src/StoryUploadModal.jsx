import { useState } from 'react';
import { storage, db } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


export default function StoryUploadModal({ onClose, userData }) {
  const [media, setMedia] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();


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
        onClose();
        navigate('/feed');

    } catch (err) {
      console.error('Story upload failed:', err);
      alert('Upload failed');
      setUploading(false);
    }
  };
}