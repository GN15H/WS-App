import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { LogIn, LogOut, Plus, Send, Users, MessageSquare, X } from 'lucide-react';
import { Login } from './views/Login';
import { Rooms } from './views/rooms/Rooms';

const API_URL = 'http://localhost:3100';
const SOCKET_URL = 'http://localhost:3100';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [socket, setSocket] = useState(null);

  // Auth states
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // Rooms states
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  // Messages states
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);

  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (token && !socket) {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket');
        newSocket.emit('users.actives.subscribe');
        newSocket.emit('get_rooms');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });

      newSocket.on('rooms', (roomsData) => {
        setRooms(roomsData);
      });

      newSocket.on('users.actives', (users) => {
        setActiveUsers(users);
      });

      newSocket.on('users.room', (users) => {
        setRoomUsers(users);
      });

      newSocket.on('message.new', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('messages', (messagesData) => {
        setMessages(messagesData);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [token, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (token) {
      fetchUserData();
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms/by-user`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        const userRooms = await response.json();
        setRooms(userRooms);
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authForm)
      });

      const data = await response.json();

      if (response.ok) {
        const userToken = data.token || data.access_token;
        setToken(userToken);
        localStorage.setItem('token', userToken);
        setIsAuthenticated(true);
        setUser(data.user || { username: authForm.email });
        setShowAuth(false);
        setAuthForm({ email: '', password: '' });

        if (socket) {
          socket.close();
          setSocket(null);
        }
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setActiveRoom(null);
    setMessages([]);
    if (socket) {
      socket.close();
      setSocket(null);
    }
  };

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newRoomName })
      });

      if (response.ok) {
        const newRoom = await response.json();
        setRooms(prev => [...prev, newRoom]);
        setNewRoomName('');
        setShowCreateRoom(false);
        socket?.emit('get_rooms');
      }
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  const handleSelectRoom = (room) => {
    setActiveRoom(room);
    setMessages([]);

    socket?.emit('join_room', { roomId: room.id });
    socket?.emit('messages.suscribe', { roomId: room.id });
    socket?.emit('users.room.subscribe', { roomId: room.id });
  };

  const handleLeaveRoom = async () => {
    if (!activeRoom) return;

    try {
      socket?.emit('left_room', { roomId: activeRoom.id });

      const response = await fetch(`${API_URL}/rooms/exit`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomId: activeRoom.id })
      });

      if (response.ok) {
        setActiveRoom(null);
        setMessages([]);
        socket?.emit('get_rooms');
      }
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeRoom || !socket) return;

    socket.emit('users-send.message', {
      roomId: activeRoom.id,
      content: newMessage
    });

    setNewMessage('');
  };

  const fetchAllRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const allRooms = await response.json();
        setRooms(allRooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };
  return (
    // <Login />
    <Rooms />
  )
  //
  // if (!isAuthenticated) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
  //       <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
  //         <div className="flex items-center justify-center mb-6">
  //           <MessageSquare className="w-12 h-12 text-indigo-600" />
  //         </div>
  //         <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Chat App</h1>
  //
  //         {!showAuth ? (
  //           <div className="space-y-4">
  //             <button
  //               onClick={() => { setShowAuth(true); setIsLogin(true); }}
  //               className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
  //             >
  //               Login
  //             </button>
  //             <button
  //               onClick={() => { setShowAuth(true); setIsLogin(false); }}
  //               className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
  //             >
  //               Register
  //             </button>
  //           </div>
  //         ) : (
  //           <div className="space-y-4">
  //             <h2 className="text-xl font-semibold text-center mb-4">
  //               {isLogin ? 'Login' : 'Register'}
  //             </h2>
  //             <input
  //               type="text"
  //               placeholder="Username"
  //               value={authForm.username}
  //               onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
  //               onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
  //               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //             />
  //             <input
  //               type="password"
  //               placeholder="Password"
  //               value={authForm.password}
  //               onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
  //               onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
  //               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //             />
  //             <button
  //               onClick={handleAuth}
  //               className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
  //             >
  //               {isLogin ? 'Login' : 'Register'}
  //             </button>
  //             <button
  //               onClick={() => setShowAuth(false)}
  //               className="w-full text-gray-600 hover:text-gray-800"
  //             >
  //               Back
  //             </button>
  //           </div>
  //         )}
  //       </div>
  //     </div>
  //   );
  // }
  //
  // return (
  //   <div className="h-screen flex bg-gray-100">
  //     {/* Sidebar - Rooms */}
  //     <div className="w-80 bg-white border-r flex flex-col">
  //       <div className="p-4 bg-indigo-600 text-white flex items-center justify-between">
  //         <div className="flex items-center gap-2">
  //           <MessageSquare className="w-6 h-6" />
  //           <h2 className="font-bold text-lg">Chat Rooms</h2>
  //         </div>
  //         <button
  //           onClick={handleLogout}
  //           className="p-2 hover:bg-indigo-700 rounded transition"
  //         >
  //           <LogOut className="w-5 h-5" />
  //         </button>
  //       </div>
  //
  //       <div className="p-4 border-b">
  //         <button
  //           onClick={() => setShowCreateRoom(!showCreateRoom)}
  //           className="w-full bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
  //         >
  //           <Plus className="w-5 h-5" />
  //           Create Room
  //         </button>
  //
  //         {showCreateRoom && (
  //           <div className="mt-3 space-y-2">
  //             <input
  //               type="text"
  //               placeholder="Room name"
  //               value={newRoomName}
  //               onChange={(e) => setNewRoomName(e.target.value)}
  //               onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
  //               className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //             />
  //             <div className="flex gap-2">
  //               <button
  //                 onClick={handleCreateRoom}
  //                 className="flex-1 bg-green-600 text-white py-1 rounded hover:bg-green-700 transition"
  //               >
  //                 Create
  //               </button>
  //               <button
  //                 onClick={() => setShowCreateRoom(false)}
  //                 className="flex-1 bg-gray-300 text-gray-700 py-1 rounded hover:bg-gray-400 transition"
  //               >
  //                 Cancel
  //               </button>
  //             </div>
  //           </div>
  //         )}
  //
  //         <button
  //           onClick={fetchAllRooms}
  //           className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
  //         >
  //           Browse All Rooms
  //         </button>
  //       </div>
  //
  //       <div className="flex-1 overflow-y-auto">
  //         {rooms.length === 0 ? (
  //           <div className="p-4 text-center text-gray-500">
  //             No rooms available. Create one!
  //           </div>
  //         ) : (
  //           rooms.map((room) => (
  //             <div
  //               key={room.id}
  //               onClick={() => handleSelectRoom(room)}
  //               className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${activeRoom?.id === room.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
  //                 }`}
  //             >
  //               <div className="font-semibold text-gray-800">{room.name}</div>
  //               <div className="text-sm text-gray-500 mt-1">
  //                 {room.userCount || 0} members
  //               </div>
  //             </div>
  //           ))
  //         )}
  //       </div>
  //
  //       {activeUsers.length > 0 && (
  //         <div className="p-4 border-t bg-gray-50">
  //           <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
  //             <Users className="w-4 h-4" />
  //             <span>Active Users ({activeUsers.length})</span>
  //           </div>
  //           <div className="space-y-1">
  //             {activeUsers.slice(0, 5).map((user, idx) => (
  //               <div key={idx} className="flex items-center gap-2 text-sm">
  //                 <div className="w-2 h-2 bg-green-500 rounded-full"></div>
  //                 <span>{user.username || `User ${idx + 1}`}</span>
  //               </div>
  //             ))}
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //
  //     {/* Main Chat Area */}
  //     <div className="flex-1 flex flex-col">
  //       {activeRoom ? (
  //         <>
  //           <div className="bg-white border-b p-4 flex items-center justify-between">
  //             <div>
  //               <h3 className="font-bold text-xl text-gray-800">{activeRoom.name}</h3>
  //               <p className="text-sm text-gray-500">
  //                 {roomUsers.length > 0 ? `${roomUsers.length} users in room` : 'No users online'}
  //               </p>
  //             </div>
  //             <button
  //               onClick={handleLeaveRoom}
  //               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
  //             >
  //               <X className="w-4 h-4" />
  //               Leave Room
  //             </button>
  //           </div>
  //
  //           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
  //             {messages.length === 0 ? (
  //               <div className="text-center text-gray-500 mt-8">
  //                 No messages yet. Start the conversation!
  //               </div>
  //             ) : (
  //               messages.map((msg, idx) => (
  //                 <div key={idx} className="flex gap-3">
  //                   <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold flex-shrink-0">
  //                     {msg.username?.[0]?.toUpperCase() || 'U'}
  //                   </div>
  //                   <div className="flex-1">
  //                     <div className="flex items-baseline gap-2">
  //                       <span className="font-semibold text-gray-800">{msg.username || 'Unknown'}</span>
  //                       <span className="text-xs text-gray-500">
  //                         {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
  //                       </span>
  //                     </div>
  //                     <div className="bg-white rounded-lg p-3 mt-1 shadow-sm">
  //                       {msg.content || msg.message}
  //                     </div>
  //                   </div>
  //                 </div>
  //               ))
  //             )}
  //             <div ref={messagesEndRef} />
  //           </div>
  //
  //           <div className="bg-white border-t p-4">
  //             <div className="flex gap-2">
  //               <input
  //                 type="text"
  //                 value={newMessage}
  //                 onChange={(e) => setNewMessage(e.target.value)}
  //                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
  //                 placeholder="Type a message..."
  //                 className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
  //               />
  //               <button
  //                 onClick={handleSendMessage}
  //                 className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
  //               >
  //                 <Send className="w-5 h-5" />
  //                 Send
  //               </button>
  //             </div>
  //           </div>
  //         </>
  //       ) : (
  //         <div className="flex-1 flex items-center justify-center bg-gray-50">
  //           <div className="text-center text-gray-500">
  //             <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
  //             <h3 className="text-xl font-semibold mb-2">No Room Selected</h3>
  //             <p>Select a room from the sidebar to start chatting</p>
  //           </div>
  //         </div>
  //       )}
  //     </div>
  //   </div>
  // );
}

export default App;
