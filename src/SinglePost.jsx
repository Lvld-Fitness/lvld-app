// SinglePost.jsx
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useEffect, useState } from 'react';

export default function SinglePost() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      const snap = await getDoc(doc(db, 'posts', postId));
      if (snap.exists()) {
        setPost({ id: snap.id, ...snap.data() });
      }
    };
    loadPost();
  }, [postId]);

  if (!post) return <div className="text-white p-4">Loading post...</div>;

  return (
    <div className="text-white p-4">
      <h2 className="text-xl font-bold mb-2">{post.content.slice(0, 50)}...</h2>
      <pre className="text-gray-300">{post.content}</pre>
    </div>
  );
}
