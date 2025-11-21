import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  IconButton,
  Divider,
  Avatar,
  Chip,
  Typography,
  ListItemAvatar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import type { Room } from '../../domain/models/Room';
import { RoomsController } from './Rooms.controller';
import { useWS } from '../../context/WSContext';

const ROOMS = [
  { id: 1, name: 'general' },
  { id: 2, name: 'random' },
  { id: 3, name: 'announcements' },
  { id: 4, name: 'tech-help' },
  { id: 5, name: 'off-topic' },
];

const USERS: Record<number, { id: number, name: string, online: boolean }[]> = {
  1: [
    { id: 1, name: 'Alice', online: true },
    { id: 2, name: 'Bob', online: true },
    { id: 3, name: 'Charlie', online: false },
    { id: 4, name: 'Diana', online: true },
    { id: 5, name: 'Eve', online: false },
  ],
  2: [
    { id: 1, name: 'Alice', online: false },
    { id: 2, name: 'Bob', online: true },
    { id: 6, name: 'Frank', online: true },
  ],
  3: [
    { id: 1, name: 'Alice', online: true },
    { id: 4, name: 'Diana', online: true },
    { id: 7, name: 'Grace', online: false },
  ],
  4: [
    { id: 2, name: 'Bob', online: true },
    { id: 3, name: 'Charlie', online: true },
    { id: 6, name: 'Frank', online: false },
  ],
  5: [
    { id: 3, name: 'Charlie', online: false },
    { id: 5, name: 'Eve', online: true },
    { id: 7, name: 'Grace', online: true },
  ],
};

const INITIAL_MESSAGES: Record<number, { id: number, author: string, content: string }[]> = {
  1: [
    { id: 1, author: 'Alice', content: 'Hey everyone!' },
    { id: 2, author: 'Bob', content: 'Hello Alice!' },
    { id: 3, author: 'Charlie', content: 'What\'s up?' },
  ],
  2: [
    { id: 1, author: 'Bob', content: 'Anyone want to play games?' },
    { id: 2, author: 'Frank', content: 'Sure, I\'m in!' },
  ],
  3: [{ id: 1, author: 'Alice', content: 'Important update incoming!' }],
  4: [{ id: 1, author: 'Bob', content: 'How do I fix this error?' }],
  5: [{ id: 1, author: 'Eve', content: 'Random meme incoming...' }],
};

export default function ChatApp() {
  // const controller = new RoomsController();
  const { on, emit } = useWS();

  const [selectedRoom, setSelectedRoom] = useState(1);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  // const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    console.log("useEffect chatApp?");
    const off = on("get_rooms", (data) => console.log("getRooms si?", data));

    emit("get_users_online");

    return off;
  }, [])

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        id: messages[selectedRoom].length + 1,
        author: 'You',
        content: input,
      };
      setMessages({
        ...messages,
        [selectedRoom]: [...messages[selectedRoom], newMessage],
      });
      setInput('');
    }
  };

  const currentRoom = ROOMS.find((r) => r.id === selectedRoom);
  const currentUsers = USERS[selectedRoom] || [];
  const currentMessages = messages[selectedRoom] || [];

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        bgcolor: '#36393f',
        width: '100vw',
        overflow: 'hidden',
      }}>
      {/* Left Sidebar - Rooms */}
      <Drawer
        variant='permanent'
        // variant={{ xs: 'temporary', md: 'permanent' }}
        open
        sx={{
          width: { xs: '60vw', sm: '35vw', md: '240px' },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: '60vw', sm: '35vw', md: '240px' },
            bgcolor: '#2f3136',
            border: 'none',
          },
        }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
            Rooms
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: '#202225' }} />
        <List sx={{ p: 0 }}>
          {ROOMS.map((room) => (
            <ListItemButton
              key={room.id}
              selected={selectedRoom === room.id}
              onClick={() => setSelectedRoom(room.id)}
              sx={{
                color: selectedRoom === room.id ? '#fff' : '#b9bbbe',
                bgcolor: selectedRoom === room.id ? '#2c2f33' : 'transparent',
                '&:hover': {
                  bgcolor: '#2c2f33',
                  color: '#fff',
                },
                py: 1.5,
                px: 2,
              }}
            >
              <ListItemText
                primary={`# ${room.name}`}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: selectedRoom === room.id ? 'bold' : 'normal',
                  },
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Center - Chat Area */}
      <Box
        sx={{
          width: '100%',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          // justifyContent: 'start',
          bgcolor: '#36393f',
        }}
      >
        {/* Header */}
        <Box
          // border={'solid'}
          sx={{
            // flex: 1,
            width: "100%", // 240px + 240px sidebars
            height: "10%",
            display: 'flex',
            flexDirection: 'column',
          }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
            # {currentRoom?.name}
          </Typography>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {currentMessages.map((msg) => (
            <Box key={msg.id} sx={{ display: 'flex', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: '#5865F2',
                  width: 40,
                  height: 40,
                }}
              >
                {msg.author[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#fff',
                      fontWeight: 'bold',
                    }}
                  >
                    {msg.author}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: '#72767d' }}
                  >
                    12:34 PM
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#dcddde',
                    mt: 0.5,
                  }}
                >
                  {msg.content}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Message Input */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#36393f',
            borderTop: '1px solid #202225',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Message #general"
              variant="outlined"
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#dcddde',
                  bgcolor: '#40444b',
                  '& fieldset': {
                    borderColor: '#202225',
                  },
                  '&:hover fieldset': {
                    borderColor: '#202225',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#5865F2',
                  },
                },
                '& .MuiOutlinedInput-input::placeholder': {
                  color: '#72767d',
                  opacity: 1,
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              sx={{
                color: '#5865F2',
                '&:hover': {
                  color: '#7289da',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Right Sidebar - Users */}
      <Drawer
        variant="permanent"
        anchor="right"
        open
        sx={{
          width: { xs: '60vw', sm: '35vw', md: '240px' },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: '60vw', sm: '35vw', md: '240px' },
            bgcolor: '#2f3136',
            border: 'none',
          },
        }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
            Users
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: '#202225' }} />
        <List sx={{ p: 0 }}>
          {currentUsers.map((user) => (
            <ListItem
              key={user.id}
              sx={{
                px: 2,
                py: 1,
                bgcolor: user.online ? 'rgba(88, 101, 242, 0.1)' : 'transparent',
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: user.online ? '#43B581' : '#747f8d',
                    position: 'relative',
                  }}
                >
                  {user.name[0]}
                  {user.online && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -2,
                        right: -2,
                        width: 10,
                        height: 10,
                        bgcolor: '#43B581',
                        borderRadius: '50%',
                        border: '2px solid #2f3136',
                      }}
                    />
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
              />
              {user.online && (
                <Chip
                  label="Online"
                  size="small"
                  sx={{
                    height: 20,
                    bgcolor: '#43B581',
                    color: '#fff',
                    fontSize: '0.7rem',
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
