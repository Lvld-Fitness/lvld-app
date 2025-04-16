import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadSimple, Trash, XSquare } from '@phosphor-icons/react';

export default function StoryViewer() {
  const { userId } = useParams();
  const [entries, setEntries] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const isOwner = auth.currentUser?.uid === userId;

  const loadStories = async () => {
    const q = query(collection(db, 'stories', userId, 'entries'), orderBy('timestamp', 'asc'));
    const snap = await getDocs(q);
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;

    const validEntries = snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(entry => entry.timestamp?.toMillis?.() >= cutoff);

    setEntries(validEntries);
    setActiveIndex(0);
  };

  useEffect(() => {
    loadStories();
  }, [userId]);

  useEffect(() => {
    if (entries.length === 0) return;

    const auto = setTimeout(() => {
      setActiveIndex((prev) =>
        prev < entries.length - 1 ? prev + 1 : (navigate('/'), 0)
      );
    }, 6000);

    return () => clearTimeout(auto);
  }, [entries, activeIndex, navigate]);

  const handleDelete = async () => {
    const entry = entries[activeIndex];
    if (!entry) return;
    if (!confirm('Delete this story?')) return;

    await deleteDoc(doc(db, 'stories', userId, 'entries', entry.id));
    await loadStories();
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file || !auth.currentUser) return;

    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const fileRef = ref(storage, `stories/${auth.currentUser.uid}_${Date.now()}.${ext}`);
      await uploadBytes(fileRef, file, { contentType: file.type });

      const url = await getDownloadURL(fileRef);
      const type = file.type.startsWith('video') ? 'video' : 'image';

      await addDoc(collection(db, 'stories', auth.currentUser.uid, 'entries'), {
        mediaUrl: url,
        mediaType: type,
        timestamp: serverTimestamp()
      });

      await new Promise(res => setTimeout(res, 500));
      await loadStories();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload story.');
    }

    setUploading(false);
  };

  const handleStopClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={() => navigate('/')}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
    >


      <input
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelected}
        ref={fileInputRef}
        className="hidden"
      />

      {entries.length > 0 ? (
        <div className="max-w-full max-h-full rounded overflow-hidden shadow-lg" onClick={handleStopClick}>
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
      ) : isOwner ? (
        <div className="flex flex-col items-center gap-20" onClick={handleStopClick}>
          <button onClick={handleUploadClick} className="text-white opacity-80 hover:opacity-100">
            <UploadSimple size={64} />
          </button>
          <button onClick={() => navigate('/feed')}>
            <XSquare size={64} />
          </button>
          
        </div>
      ) : null}
    </div>
  );
}
