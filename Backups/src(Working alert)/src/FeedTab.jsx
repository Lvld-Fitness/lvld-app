import { useState, useEffect } from 'react';

export default function FeedTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Load all posts (mock)
    const allPosts = JSON.parse(localStorage.getItem('allPosts') || '[]');
    setPosts(allPosts);
  }, []);

  const filteredPosts = posts.filter((post) =>
    post.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      {/* Search bar */}
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
      />

      {/* Story row (placeholder) */}
      <div className="flex gap-4 overflow-x-auto mb-4">
        {/* Coming soon: user workout stories with icons */}
        <div className="text-sm text-gray-500 italic">Stories coming soon...</div>
      </div>

      {/* Feed posts */}
      <div className="space-y-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, idx) => (
            <div key={idx} className="bg-gray-900 p-4 rounded shadow">
              <div className="flex items-center mb-2">
                <img
                  src={post.profilePic || 'https://via.placeholder.com/40'}
                  className="w-10 h-10 rounded-full mr-3"
                  alt="profile"
                />
                <div>
                  <p className="font-semibold">{post.username || 'LVLD User'}</p>
                  <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {post.type === 'image' && (
                <img
                  src={post.url}
                  alt="Post"
                  className="w-full h-64 object-cover rounded"
                />
              )}

              {/* Post actions */}
              <div className="flex justify-around mt-3 text-sm text-gray-400">
                <button className="hover:text-green-400">💪 Like</button>
                <button className="hover:text-yellow-300">🔥 Respect</button>
                <button className="hover:text-blue-300">💬 Comment</button>
                <button className="hover:text-purple-400">🔁 Repost</button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No posts found.</p>
        )}
      </div>
    </div>
  );
}
