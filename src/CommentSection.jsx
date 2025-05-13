// CommentSection.jsx
import { useEffect, useState } from 'react';
import {
  collection, query, orderBy, getDocs, addDoc,
  serverTimestamp, doc, getDoc, deleteDoc, updateDoc
} from 'firebase/firestore';
import { db, auth } from './firebase';
import CommentInput from './CommentInput';
import { DotsThreeVertical, ArrowBendUpLeft } from 'phosphor-react';
import { useNavigate } from 'react-router-dom';
import RankIcon from "./RankIcon";

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const navigate = useNavigate();
  

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('timestamp'));
    const snap = await getDocs(q);
  
    const data = await Promise.all(
      snap.docs.map(async docSnap => {
        const comment = { id: docSnap.id, ...docSnap.data() };
        const userSnap = await getDoc(doc(db, 'users', comment.userId));
        const user = userSnap.exists() ? userSnap.data() : {};
        const replies = await fetchReplies(comment.id);
        return {
          ...comment,
          userName: user.name || 'User',
          userHandle: user.handle || '',
          userPic: user.profilePic || '/default-avatar.png',
          rank: user.rank || 'bronze_1',
          replies
        };
      })
    );
  
    setComments(data);
  };
  

  const fetchReplies = async (commentId) => {
    const q = query(collection(db, 'posts', postId, 'comments', commentId, 'replies'), orderBy('timestamp'));
    const snap = await getDocs(q);

    const data = await Promise.all(
      snap.docs.map(async replySnap => {
        const reply = { id: replySnap.id, ...replySnap.data() };
        const userSnap = await getDoc(doc(db, 'users', reply.userId));
        const user = userSnap.exists() ? userSnap.data() : {};
        return {
          ...reply,
          userName: user.name || 'User',
          userPic: user.profilePic || '/default-avatar.png'
        };
      })
    );

    return data;
  };

  const handleNewComment = async ({ text, media }) => {
    const user = auth.currentUser;
    if (!user) return;
  
    const newCommentRef = await addDoc(collection(db, 'posts', postId, 'comments'), {
      userId: user.uid,
      text,
      media: media || null,  // <-- 🔥 Make sure you save media too, even if null
      timestamp: serverTimestamp(),
    });
  
    // 🔔 Handle mentions
    const mentions = text.match(/@[\w\d]+/g) || [];
    for (const rawHandle of mentions) {
      const cleanHandle = rawHandle.replace('@', '').toLowerCase();
      const handleSnap = await getDoc(doc(db, 'handles', cleanHandle));
    
      if (handleSnap.exists()) {
        const { uid: mentionedUid } = handleSnap.data();
    
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const fromUserName = userSnap.exists() ? userSnap.data().name : 'Someone';
    
        await addDoc(collection(db, 'users', mentionedUid, 'notifications'), {
          type: 'mention',
          from: user.uid,
          fromUserName: fromUserName,  // ✅ use this
          postId,
          commentId: newCommentRef.id,
          text,
          timestamp: Date.now(),
          read: false,
        });
      }
    }
    
    
  
    // 🔔 Notify post owner
    const postSnap = await getDoc(doc(db, 'posts', postId));
    if (postSnap.exists()) {
      const postData = postSnap.data();
      if (postData.userId && postData.userId !== user.uid) {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const userName = userSnap.exists() ? userSnap.data().name : 'Someone';
        
        await addDoc(collection(db, 'users', postData.userId, 'notifications'), {
          type: 'comment',
          from: user.uid,
          fromUserName: userName,  // 👈 ADD THIS
          postId,
          timestamp: Date.now(),
          read: false,
        });            
      }
    }
  
    fetchComments();
  };
  
  


  const handleDelete = async (commentId, replyId = null) => {
    const ref = replyId
      ? doc(db, 'posts', postId, 'comments', commentId, 'replies', replyId)
      : doc(db, 'posts', postId, 'comments', commentId);

    await deleteDoc(ref);
    fetchComments();
  };

  const handleEdit = async (commentId, replyId = null) => {
    if (!editingText.trim()) return;
    const ref = replyId
      ? doc(db, 'posts', postId, 'comments', commentId, 'replies', replyId)
      : doc(db, 'posts', postId, 'comments', commentId);

    await updateDoc(ref, { text: editingText });
    setEditingId(null);
    setEditingText('');
    fetchComments();
  };

  return (
    <div className="mt-3">
      <div className="border-t border-gray-700 pt-3">
        {comments.map((c) => (
          <div key={c.id} className="mt-3 px-2 py-2 rounded bg-gray-800 text-white relative">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <img
                  src={c.userPic}
                  className="w-6 h-6 rounded-full object-cover cursor-pointer"
                  onClick={() => navigate(`/profile/${c.userId}`)}
                />

                <div className="flex items-center gap-2">
                  <RankIcon rank={c.rank} size={24} />
                  <span className="text-white font-bold">{c.userName}</span>
                </div>


              </div>
              {auth.currentUser?.uid === c.userId && (
                <div className="relative">
                  <button onClick={() => setEditingId(editingId === c.id ? null : c.id)}>
                    <DotsThreeVertical size={16} className="text-gray-400 hover:text-white" />
                  </button>
                  {editingId === c.id && (
                    <div className="absolute right-0 mt-1 bg-gray-900 border border-gray-700 rounded shadow z-50">
                      <button onClick={() => handleDelete(c.id)} className="block px-4 py-2 text-sm hover:bg-gray-700 text-red-400 w-full text-left">Delete</button>
                      <button onClick={() => setEditingText(c.text)} className="block px-4 py-2 text-sm hover:bg-gray-700 text-blue-400 w-full text-left">Edit</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              {editingId === c.id && editingText ? (
                <div className="flex flex-col gap-2 w-full">
                  <textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="w-full p-2 text-sm bg-gray-700 text-white rounded"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(c.id)} className="text-green-400 text-sm hover:underline">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-red-400 text-sm hover:underline">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1">
                  {c.text && (
                <p className="text-sm mb-1">{c.text}</p>
              )}
              {c.media && (
                <img
                  src={c.media}
                  alt="comment media"
                  className="mt-2 rounded-lg max-h-60 object-contain"
                />
              )}
            </div>
          )}
            </div>

           
          </div>
        ))}

        <CommentInput onSend={handleNewComment} />
      </div>
    </div>
  );
}
