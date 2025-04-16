import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase';
import StoryUploadModal from './StoryUploadModal';
import { UploadSimple, Trash, Eye } from '@phosphor-icons/react';

export default function StoryViewer() {
  const { userId } = useParams();
  const [entries, setEntries] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const navigate = useNavigate();
  const isOwner = auth.currentUser?.uid === userId;

  useEffect(() => {
    const loadStories = async () => {
      const q = query(
        collection(db, 'stories', userId, 'entries'),
        orderBy('timestamp', 'asc')
      );
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
    if (!showUpload) {
      const refresh = async () => {
        const q = query(
          collection(db, 'stories', userId, 'entries'),
          orderBy('timestamp', 'asc')
        );
        const snap = await getDocs(q);
        const now = Date.now();
        const cutoff = now - 24 * 60 * 60 * 1000;
  
        const validEntries = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(entry => entry.timestamp?.toMillis?.() >= cutoff);
  
        setEntries(validEntries);
        setActiveIndex(0);
      };
  
      refresh();
    }
  }, [showUpload, userId]);
  

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
    navigate('/');
  };

  const handleStopClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      onClick={() => navigate('/')}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4"
    >
      {isOwner && entries.length > 0 && (
        <div className="absolute top-4 right-4 z-50 flex gap-3">
          <button onClick={(e) => { e.stopPropagation(); setShowUpload(true); }}>
            <UploadSimple size={24} className="text-white" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(); }}>
            <Trash size={24} className="text-red-500" />
          </button>
        </div>
      )}

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
            <button
                onClick={() => setShowUpload(true)}
                className="text-white opacity-80 hover:opacity-100"
            >
                <UploadSimple size={64} />
            </button>
            
            <button
                onClick={() => navigate(`/story/${userId}`)}
                className="text-white opacity-80 hover:opacity-100"
            >
                <Eye size={64} />
            </button>
            </div>

      ) : null}

      {showUpload && (
        <StoryUploadModal
          onClose={() => setShowUpload(false)}
          userData={{ uid: userId }}
        />
      )}
    </div>
  );
}
