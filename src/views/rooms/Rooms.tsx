import { useEffect, useState } from "react";
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
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { Room, type IRoomMap } from "../../domain/models/Room";
import { RoomsController } from "./Rooms.controller";
import { useWS } from "../../context/WSContext";
import { Message, type IMessageMap } from "../../domain/models/Message";
import SimpleFormDialog from "./RoomForm";
import type { RoomUser } from "./Rooms.types";
import { User } from "../../domain/models/User";
import UpdateRoomDialog from "./RoomUpdateForm";

const ROOMS = [
  { id: 1, name: "general" },
  { id: 2, name: "random" },
  { id: 3, name: "announcements" },
  { id: 4, name: "tech-help" },
  { id: 5, name: "off-topic" },
];

const USERS: Record<number, { id: number; name: string; online: boolean }[]> = {
  1: [
    { id: 1, name: "Alice", online: true },
    { id: 2, name: "Bob", online: true },
    { id: 3, name: "Charlie", online: false },
    { id: 4, name: "Diana", online: true },
    { id: 5, name: "Eve", online: false },
  ],
  2: [
    { id: 1, name: "Alice", online: false },
    { id: 2, name: "Bob", online: true },
    { id: 6, name: "Frank", online: true },
  ],
  3: [
    { id: 1, name: "Alice", online: true },
    { id: 4, name: "Diana", online: true },
    { id: 7, name: "Grace", online: false },
  ],
  4: [
    { id: 2, name: "Bob", online: true },
    { id: 3, name: "Charlie", online: true },
    { id: 6, name: "Frank", online: false },
  ],
  5: [
    { id: 3, name: "Charlie", online: false },
    { id: 5, name: "Eve", online: true },
    { id: 7, name: "Grace", online: true },
  ],
};

const INITIAL_MESSAGES: Record<
  number,
  { id: number; author: string; content: string }[]
> = {
  1: [
    { id: 1, author: "Alice", content: "Hey everyone!" },
    { id: 2, author: "Bob", content: "Hello Alice!" },
    { id: 3, author: "Charlie", content: "What's up?" },
  ],
  2: [
    { id: 1, author: "Bob", content: "Anyone want to play games?" },
    { id: 2, author: "Frank", content: "Sure, I'm in!" },
  ],
  3: [{ id: 1, author: "Alice", content: "Important update incoming!" }],
  4: [{ id: 1, author: "Bob", content: "How do I fix this error?" }],
  5: [{ id: 1, author: "Eve", content: "Random meme incoming..." }],
};

export default function ChatApp() {
  const controller = new RoomsController();
  const activeUser: User = new User(JSON.parse(localStorage.getItem('profile')!))
  const [open, setOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const { ws, isConnected } = useWS();

  const [selectedRoom, setSelectedRoom] = useState<number>(1);
  // const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({})
  const [users, setUsers] = useState<Record<number, RoomUser[]>>({});
  const [subscribedRooms, setSubscribedRooms] = useState<Room[]>([]);

  const joinRoom = async () => {
    ws.emit('join_room', selectedRoom);
    ws.emit("messages.suscribe", { id: selectedRoom });
    ws.on(`users.room.updated.room_${selectedRoom}`, (users) => getUsersFromRoom(selectedRoom, users));

    const newRoom = rooms.find(r => r.id == selectedRoom);
    if (newRoom == undefined) return;
    setSubscribedRooms(prev => [...prev, newRoom]);
  }

  const exitRoom = async () => {
    ws.emit('left_room', selectedRoom);
    window.location.reload()
  }

  const handleCreateRoom = async (name: string, description: string) => {
    await controller.createRoom(name, description);
    window.location.reload()
    // ws.emit("messages.suscribe", { id: createdRoom.id });
    // ws.on(`users.room.updated.room_${createdRoom.id}`, (users) => getUsersFromRoom(createdRoom.id, users));
    // setSubscribedRooms(prev => [...prev, createdRoom])
  }

  const handleUpdateRoom = async (name: string, description: string) => {
    const toBeUpdatedRoom = rooms.find(r => r.id == selectedRoom);
    if (toBeUpdatedRoom == undefined) return;
    await controller.updateRoom(name, description, toBeUpdatedRoom);
  }

  const getInitialRooms = (data: IRoomMap[]) => {
    const newRooms = data.map(r => Room.fromMap(r));
    console.log("cuales son las rooms", data, newRooms);
    setRooms(newRooms);
  }
  const getNewRoom = (room: IRoomMap) => {
    setRooms(prev => [...prev, Room.fromMap(room)]);
  }

  const updateRoom = (room: IRoomMap) => {
    const updatedRoom = Room.fromMap(room);
    setRooms(prev => {
      const newArr = [...prev]
      const toBeUpdatedRoom = prev.find(r => r.id == updatedRoom.id);
      if (toBeUpdatedRoom == undefined) return prev;
      const toBeUpdatedRoomIndex = prev.indexOf(toBeUpdatedRoom);
      if (toBeUpdatedRoomIndex < 0) return prev;
      newArr[toBeUpdatedRoomIndex] = updatedRoom;
      return newArr
    })
  }
  const getUsersFromRoom = async (roomId: number, data: any[]) => {
    const roomUsers: RoomUser[] = data.map(u => ({
      active: u['online'], user: new User({ id: u['id'], username: u['userName'], email: u['email'] })
    }))
    setUsers(prev => ({
      ...prev,
      [roomId]: roomUsers
    }))
  }
  const getNewMessage = (message: IMessageMap | IMessageMap[]) => {
    if (Array.isArray(message)) {
      console.log("es array");
      // (we can fix this part too if needed)
    } else {
      console.log("es object");
      const newMessage = Message.fromMap(message);

      setMessages(prev => ({
        ...prev,
        [newMessage.roomId]: [
          ...(prev[newMessage.roomId] ?? []),
          newMessage
        ]
      }));
    }
  };
  useEffect(() => {
    console.log("el active user manito", activeUser);
    const init = async () => {
      console.warn("Debug: Cleaning up WebSocket event listener.");
      if (!isConnected) return; // todavía no hay socket conectado
      const subscribedRooms = await controller.getRoomsByUser()
      setSubscribedRooms(subscribedRooms);
      console.log("useEffect chatApp? isConnected:", isConnected);
      ws.emit("get_rooms");

      subscribedRooms.forEach(r => {
        ws.emit("users.room.subscribe", r.id);
        ws.emit("messages.suscribe", { id: r.id });
        ws.on(`users.room.updated.room_${r.id}`, (users) => getUsersFromRoom(r.id, users));
      })
      ws.on("rooms_list", getInitialRooms);
      ws.on("room_created", getNewRoom);
      ws.on("room_updated", updateRoom);
      ws.on("messages.suscription", getNewMessage);
    }
    init();

    return () => {
      ws.socket?.off("rooms_list", getInitialRooms);
      ws.socket?.off("room_created");
      ws.socket?.off("messages.suscription");
    }
  }, [isConnected]); // 👈 se ejecuta cuando cambie estado de conexión

  const handleSendMessage = () => {
    console.log("estoy mandando a ", {
      roomId: selectedRoom,
      message: input
    })
    if (input.trim()) {
      ws.emit("users-send.message", {
        roomId: selectedRoom,
        message: input
      })
    }
  };

  const currentRoom = rooms.find(r => r.id === selectedRoom);
  const currentUsers = users[selectedRoom] || [];
  const currentMessages = messages[selectedRoom] || [];

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "#36393f",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar - Rooms */}
      <Drawer
        variant="permanent"
        // variant={{ xs: 'temporary', md: 'permanent' }}
        open
        sx={{
          width: { xs: "60vw", sm: "35vw", md: "240px" },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: "60vw", sm: "35vw", md: "240px" },
            bgcolor: "#2f3136",
            border: "none",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            Rooms
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "#202225" }} />
        <List sx={{ p: 0 }}>
          {rooms.map((room) => (
            <ListItemButton
              key={room.id}
              selected={selectedRoom === room.id}
              onClick={() => {
                console.log("le estoy dando a esta gonorrea", room)
                setSelectedRoom(room.id)
              }}
              sx={{
                color: selectedRoom === room.id ? "#fff" : subscribedRooms.some(r => r.id == room.id) ? "#b9bbbe" : "red",
                bgcolor: selectedRoom === room.id ? "#2c2f33" : "transparent",
                "&:hover": {
                  bgcolor: "#2c2f33",
                  color: "#fff",
                },
                py: 1.5,
                px: 2,
              }}
            >
              <ListItemText
                primary={`# ${room.name} `}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: selectedRoom === room.id ? "bold" : "normal",
                  },
                }}
              />
            </ListItemButton>
          ))}
        </List>
        <Box height={'100%'} />
        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} width={'100%'}>
          <Button sx={{ backgroundColor: "cyan" }} variant="contained" onClick={() => setOpen(prev => !prev)}>Crear</Button>
          <Button variant="outlined" sx={{ color: 'white' }} onClick={() => {
            localStorage.removeItem('token');
            window.location.reload()
          }}>Salir</Button>
        </Box>
      </Drawer>

      {/* Center - Chat Area */}
      <Box
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          // justifyContent: 'start',
          bgcolor: "#36393f",
        }}
      >
        {/* Header */}
        <Box
          // border={'solid'}
          sx={{
            // flex: 1,
            width: "100%", // 240px + 240px sidebars
            height: "10%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: 'space-between'
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            # {currentRoom?.name} {!subscribedRooms.some(r => r.id == selectedRoom) ? "(No pertenece)" : ""}
          </Typography>
          <Box
            display={'flex'}
            justifyContent={'space-between'}
            flexDirection={'column'}>

            {rooms.find(r => r.id == selectedRoom)?.ownerId == activeUser.id &&
              <Button onClick={() => setEditOpen(true)} variant="outlined" sx={{ backgroundColor: '#8050ea', color: "white" }}>Editar sala</Button>
            }
            {
              subscribedRooms.some(r => r.id == selectedRoom) &&
              <Button onClick={exitRoom} variant="outlined" sx={{ backgroundColor: 'red', color: "white" }}>Salir de sala</Button>
            }

          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {subscribedRooms.some(r => r.id == selectedRoom) && currentMessages.map((msg) => (
            <Box key={msg.id} sx={{ display: "flex", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: "#5865F2",
                  width: 40,
                  height: 40,
                }}
              >
                {msg.userId}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#fff",
                      fontWeight: "bold",
                    }}
                  >
                    {msg.userId}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#72767d" }}>
                    12:34 PM
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#dcddde",
                    mt: 0.5,
                  }}
                >
                  {msg.message}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Message Input */}

        {!subscribedRooms.some(r => r.id == selectedRoom) &&
          <Button onClick={joinRoom}>Unirse</Button>
        }
        {subscribedRooms.some(r => r.id == selectedRoom) &&
          <Box
            sx={{
              p: 2,
              bgcolor: "#36393f",
              borderTop: "1px solid #202225",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Message #general"
                variant="outlined"
                size="small"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#dcddde",
                    bgcolor: "#40444b",
                    "& fieldset": {
                      borderColor: "#202225",
                    },
                    "&:hover fieldset": {
                      borderColor: "#202225",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#5865F2",
                    },
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "#72767d",
                    opacity: 1,
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                sx={{
                  color: "#5865F2",
                  "&:hover": {
                    color: "#7289da",
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        }
      </Box>

      {/* Right Sidebar - Users */}
      <Drawer
        variant="permanent"
        anchor="right"
        open
        sx={{
          width: { xs: "60vw", sm: "35vw", md: "240px" },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: "60vw", sm: "35vw", md: "240px" },
            bgcolor: "#2f3136",
            border: "none",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: "bold" }}>
            Users
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "#202225" }} />
        <List sx={{ p: 0 }}>
          {currentUsers.map((user) => (
            <ListItem
              key={user.user.id}
              sx={{
                px: 2,
                py: 1,
                bgcolor: user.active
                  ? "rgba(88, 101, 242, 0.1)"
                  : "transparent",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: user.active ? "#43B581" : "#747f8d",
                    position: "relative",
                  }}
                >
                  {user.user.username[0]}
                  {user.active && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 10,
                        height: 10,
                        bgcolor: "#43B581",
                        borderRadius: "50%",
                        border: "2px solid #2f3136",
                      }}
                    />
                  )}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.user.username} />
              {user.active && (
                <Chip
                  label="Online"
                  size="small"
                  sx={{
                    height: 20,
                    bgcolor: "#43B581",
                    color: "#fff",
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>
      <SimpleFormDialog
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleCreateRoom}
      />
      <UpdateRoomDialog open={editOpen} onClose={() => setEditOpen(false)} onUpdate={handleUpdateRoom} />
    </Box>

  );
}
