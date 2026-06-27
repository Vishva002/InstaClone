import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI, messageAPI } from '../services/api';

function Messages() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const chatEndRef = useRef(null);

  // Poll for messages dynamically (simulate real-time sync)
  useEffect(() => {
    // Fetch suggestions to populate contacts list
    if (currentUser) {
      userAPI.getAll()
        .then(data => {
          // Exclude currentUser from chat contact suggestions
          const others = data.filter(u => u.id !== currentUser.id);
          setContacts(others);
        })
        .catch(err => console.error(err));
    }
  }, [currentUser]);

  // Load chat history when selected contact changes
  useEffect(() => {
    if (!currentUser || !selectedContact) return;
    
    fetchChatHistory();

    // Set up a polling interval every 4 seconds to fetch new messages automatically
    const pollInterval = setInterval(() => {
      fetchChatHistory(true); // silent fetch without layout loaders
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [selectedContact, currentUser]);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchChatHistory = async (silent = false) => {
    if (!selectedContact || !currentUser) return;
    if (!silent) setLoadingHistory(true);
    try {
      const data = await messageAPI.getChat(currentUser.id, selectedContact.id);
      setChatHistory(data);
    } catch (err) {
      console.error("Failed to load chat history:", err);
    } finally {
      if (!silent) setLoadingHistory(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact || !currentUser) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const newMsg = {
        senderId: currentUser.id,
        receiverId: selectedContact.id,
        text: textToSend,
        time: new Date().toISOString()
      };

      const created = await messageAPI.create(newMsg);
      setChatHistory(prev => [...prev, created]);

      // Trigger mock auto-reply after 1.5 seconds!
      setTimeout(async () => {
        try {
          const mockReply = {
            senderId: selectedContact.id,
            receiverId: currentUser.id,
            text: `Hey, this is ${selectedContact.name}. I received your message: "${textToSend.substring(0, 15)}..." 👍`,
            time: new Date().toISOString()
          };
          const replyCreated = await messageAPI.create(mockReply);
          
          // Only append if the chat is still active with this contact
          setSelectedContact(current => {
            if (current && current.id === selectedContact.id) {
              setChatHistory(prev => [...prev, replyCreated]);
            }
            return current;
          });
        } catch (e) {
          console.error(e);
        }
      }, 1500);

    } catch (err) {
      showToast("Failed to send message.", "error");
    }
  };

  return (
    <div className="max-w-[935px] w-full mx-auto border border-ig-border rounded-md bg-ig-card flex h-[85vh] overflow-hidden my-4 text-ig-text">
      {/* Left panel: Contacts List */}
      <div className="w-[350px] shrink-0 border-r border-ig-border flex flex-col min-w-0 bg-ig-card">
        {/* Header username */}
        <div className="h-16 px-5 border-b border-ig-border flex justify-between items-center shrink-0">
          <span className="font-bold text-ig-text text-base flex items-center gap-1 cursor-pointer">
            {currentUser?.username}
            <i className="bi bi-chevron-down text-xs"></i>
          </span>
          <i className="bi bi-pencil-square text-xl cursor-pointer hover:opacity-75"></i>
        </div>

        {/* Message groups tab */}
        <div className="h-11 px-5 flex items-center justify-between shrink-0 border-b border-ig-border">
          <span className="font-bold text-sm text-ig-text">Messages</span>
          <span className="text-ig-muted font-semibold text-xs cursor-pointer hover:opacity-85">Requests</span>
        </div>

        {/* Contacts scrolling list */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {contacts.map((contact) => (
            <div 
              key={contact.id} 
              className={`px-5 py-3 flex items-center gap-3 cursor-pointer transition ${selectedContact && selectedContact.id === contact.id ? 'bg-ig-hover' : 'hover:bg-ig-hover/40'}`}
              onClick={() => setSelectedContact(contact)}
            >
              <img 
                src={contact.profilePic} 
                alt={contact.username} 
                className="w-12 h-12 rounded-full object-cover border border-ig-border"
              />
              <div className="min-w-0 flex-1 text-left">
                <p className="font-semibold text-sm text-ig-text truncate mb-0.5">{contact.username}</p>
                <p className="text-xs text-ig-muted truncate">{contact.bio || 'Active now'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel: Chat Box */}
      <div className="flex-1 flex flex-col min-w-0 bg-ig-card">
        {selectedContact ? (
          <>
            {/* Header chat metadata */}
            <div className="h-16 px-6 border-b border-ig-border flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3 cursor-pointer">
                <img 
                  src={selectedContact.profilePic} 
                  alt={selectedContact.username} 
                  className="w-9 h-9 rounded-full object-cover border border-ig-border"
                />
                <div className="text-left">
                  <h6 className="font-bold text-sm text-ig-text mb-0.5 leading-none">{selectedContact.username}</h6>
                  <span className="text-xs text-green-500 font-semibold">Active now</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-xl text-ig-text">
                <i className="bi bi-telephone hover:opacity-75 cursor-pointer"></i>
                <i className="bi bi-camera-video hover:opacity-75 cursor-pointer"></i>
                <i className="bi bi-info-circle hover:opacity-75 cursor-pointer"></i>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-ig-primary no-scrollbar">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full text-ig-muted text-xs">
                  <span className="spinner-border spinner-border-sm me-2"></span> Loading conversation...
                </div>
              ) : chatHistory.length > 0 ? (
                chatHistory.map((msg) => {
                  const isMe = msg.senderId === currentUser.id;
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-normal text-left ${isMe ? 'bg-[#0095f6] text-white rounded-br-none' : 'bg-ig-card border border-ig-border text-ig-text rounded-bl-none shadow-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-ig-muted py-10">
                  <i className="bi bi-chat-dots text-4xl mb-2"></i>
                  <span className="text-xs">No messages yet. Start chatting!</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Message Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-ig-border flex items-center shrink-0">
              <div className="flex-grow flex items-center gap-3 border border-ig-border rounded-full px-4 py-2.5 bg-ig-input">
                <i className="bi bi-emoji-smile text-lg text-ig-muted cursor-pointer"></i>
                <input 
                  type="text" 
                  placeholder="Message..." 
                  className="flex-grow border-0 text-sm focus:outline-none bg-transparent text-ig-text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button 
                  type="submit" 
                  disabled={!messageText.trim()}
                  className="text-[#0095f6] font-semibold text-sm hover:text-sky-700 disabled:opacity-30 disabled:pointer-events-none cursor-pointer bg-transparent border-0"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-ig-card">
            <div className="w-24 h-24 rounded-full border-2 border-ig-text flex items-center justify-center mb-4">
              <i className="bi bi-send text-4xl text-ig-text"></i>
            </div>
            <h4 className="font-medium text-lg text-ig-text mb-1">Your messages</h4>
            <p className="text-sm text-ig-muted mb-4 max-w-[280px]">Send private photos and messages to a friend or group.</p>
            <button className="px-4 py-2 bg-[#0095f6] text-white rounded-md text-sm font-semibold hover:bg-sky-600 transition shadow cursor-pointer border-0">
              Send Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
