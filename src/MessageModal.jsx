import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

export default function MessageModal({ recipientId, onClose, mode = "inbox" }) {

  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [allMessages, setAllMessages] = useState([]);

  const currentUser = auth.currentUser;


  
  useEffect(() => {
    if (!currentUser) return;
  
    if (mode === "send" && recipientId) {
      console.log(`Preparing to send a message to: ${recipientId}`);
      setSelectedChat({ userId: recipientId, messages: [] });
      setMessageText("");
    } else {
      console.log(`Fetching conversations for user: ${currentUser.uid}`);
      
      const messagesRef = collection(db, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
        setAllMessages(msgs);
  
        const convoMap = {};
        msgs.forEach((msg) => {
          const otherUser = msg.senderId === currentUser.uid ? msg.recipientId : msg.senderId;
          if (!convoMap[otherUser]) {
            convoMap[otherUser] = {
              userId: otherUser,
              messages: [],
              lastMessage: msg.timestamp,
            };
          }
          convoMap[otherUser].messages.push(msg);
        });
  
        const sortedConversations = Object.values(convoMap).sort(
          (a, b) => b.lastMessage - a.lastMessage
        );
  
        setConversations(sortedConversations);
  
        if (recipientId && !selectedChat) {
          openChat(recipientId);
        }
      });
  
      return () => unsubscribe();
    }
  }, [currentUser, recipientId, mode]);
  
  
      
  

      const handleSendMessage = async () => {
        const targetUserId = recipientId || selectedChat?.userId;
      
        if (!targetUserId || !messageText.trim()) return;
      
        try {
          const newMessage = {
            senderId: currentUser.uid,
            recipientId: targetUserId,
            content: messageText,
            timestamp: Date.now(),
          };
      
          await addDoc(collection(db, "messages"), newMessage);
          setMessageText("");
      
          if (!selectedChat) {
            openChat(targetUserId);
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      };
      

  const openChat = (userId) => {
    const chat = conversations.find((conv) => conv.userId === userId);
    setSelectedChat(chat);
  };

  const getUserName = (userId) => {
    const user = conversations.find((conv) => conv.userId === userId);
    return user ? `User: ${userId}` : "Unknown User";
  };

  const getChatMessages = () => {
    if (!selectedChat) return [];
    return allMessages.filter(
      (msg) =>
        (msg.senderId === currentUser.uid && msg.recipientId === selectedChat.userId) ||
        (msg.senderId === selectedChat.userId && msg.recipientId === currentUser.uid)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-gray-800 p-4 rounded-lg w-96 max-h-[80vh] overflow-y-auto relative">
        <button className="absolute top-3 right-3 text-white" onClick={onClose}>
          ✖
        </button>
        <h2 className="text-lg font-bold mb-4 text-white text-center">Messages</h2>

        {selectedChat ? (
          <div>
            <button className="text-blue-500 mb-2" onClick={() => setSelectedChat(null)}>
              ← Back to Inbox
            </button>

            <div className="overflow-y-auto mb-4 h-64">
              {getChatMessages().map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 mb-1 ${
                    msg.senderId === currentUser.uid ? "bg-blue-600" : "bg-gray-700"
                  } rounded flex items-center gap-2`}
                >
                  <img
                    src={msg.senderProfilePic || "/default-avatar.png"}
                    alt="sender"
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="text-white">{msg.content}</div>
                </div>
              ))}
            </div>

            <textarea
              className="w-full p-2 mb-2 rounded bg-gray-700 text-white"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />

            <button
              className="w-full bg-blue-500 py-2 rounded text-white"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        ) : (
          <div className="overflow-y-auto mb-4 h-64">
            {conversations.length === 0 ? (
              <p className="text-gray-400">No messages yet.</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.userId}
                  className="p-2 bg-gray-700 mb-2 rounded cursor-pointer hover:bg-gray-600 flex items-center gap-2"
                  onClick={() => openChat(conv.userId)}
                >
                  <img
                    src={conv.userProfilePic || "/default-avatar.png"}
                    alt="user"
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-yellow-400">{getUserName(conv.userId)}</p>
                    <p className="text-white">
                      {conv.messages[conv.messages.length - 1]?.content.substring(0, 50)}...
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );

}
