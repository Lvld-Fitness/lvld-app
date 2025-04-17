import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, getDoc, deleteDoc, doc, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { UploadSimple, Trash, XSquare } from '@phosphor-icons/react';

export default function StoryViewer() {
  const { userId } = useParams();
  const [entries, setEntries] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const isOwner = auth.currentUser?.uid === userId;
  const [posterInfo, setPosterInfo] = useState({ name: '', profilePic: '' });

  useEffect(() => {
    const loadStories = async () => {
      const q = query(collection(db, 'stories', userId, 'entries'), orderBy('timestamp', 'asc'));
      const snap = await getDocs(q);
      const now = Date.now();
      const cutoff = now - 24 * 60 * 60 * 1000;

      const validEntries = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(entry => entry.timestamp?.toMillis?.() >= cutoff);

      setEntries(validEntries);
    };

    loadStories();
  }, [userId]);

  useEffect(() => {
    const fetchPoster = async () => {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        console.log('👤 Poster data loaded:', data); // ✅ debug check
        setPosterInfo({
          name: data.name || 'User',
          profilePic: data.profilePic || '/default-avatar.png'
        });
      } else {
        console.log('❌ No user found for:', userId);
      }
    };
  
    fetchPoster();
  }, [userId]);
  

  const handleDelete = async () => {
    const entry = entries[activeIndex];
    if (!entry) return;
    if (!confirm('Delete this story?')) return;
    await deleteDoc(doc(db, 'stories', userId, 'entries', entry.id));
    navigate('/feed');
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const fileRef = ref(storage, `stories/${userId}_${Date.now()}.${ext}`);
      await uploadBytes(fileRef, file, { contentType: file.type });

      const url = await getDownloadURL(fileRef);
      const type = file.type.startsWith('video') ? 'video' : 'image';

      const entryRef = collection(db, 'stories', userId, 'entries');
      await addDoc(entryRef, {
        mediaUrl: url,
        mediaType: type,
        timestamp: serverTimestamp()
      });

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed');
    }

    setUploading(false);
  };

  const handleAdvance = (e) => {
    e.stopPropagation();
    const half = window.innerWidth / 2;
    if (e.clientX > half) {
      if (activeIndex < entries.length - 1) {
        setActiveIndex(prev => prev + 1);
      } else {
        navigate('/feed');
      }
    } else {
      if (activeIndex > 0) {
        setActiveIndex(prev => prev - 1);
      }
    }
  };
  return (
    <div
      onClick={() => navigate('/feed')}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
    >
      {/* Poster Info Top-Left */}
      {posterInfo.name && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-black bg-opacity-60 px-3 py-1 rounded-full">
          <img
            src={posterInfo.profilePic}
            alt="avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-600"
          />
          <span className="text-white font-semibold text-sm">{posterInfo.name}</span>
        </div>
      )}
  
      {/* Upload/Delete/Close Buttons Top-Right */}
      <div className="absolute top-4 right-4 z-50 flex gap-3" onClick={(e) => e.stopPropagation()}>
        {isOwner && (
          <>
            <label className="cursor-pointer">
              <UploadSimple size={24} className="text-white" />
              <input
                type="file"
                accept="image/*,video/*"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
            </label>
            <button onClick={handleDelete}>
              <Trash size={24} className="text-red-500" />
            </button>
          </>
        )}
        <button onClick={() => navigate('/feed')}>
          <XSquare size={24} className="text-white" />
        </button>
      </div>
  
      {/* Story Content */}
      {uploading ? (
        <div className="text-white text-lg">Uploading...</div>
      ) : entries.length > 0 ? (
        <div
          className="max-w-full max-h-full rounded overflow-hidden shadow-lg w-full h-full flex justify-center items-center"
          onClick={handleAdvance}
        >
          {entries[activeIndex].mediaType === 'image' ? (
            <img
              src={entries[activeIndex].mediaUrl}
              alt="story"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={entries[activeIndex].mediaUrl}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          )}
        </div>
      ) : null}
    </div>
  );
}  
