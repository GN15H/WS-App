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

export default function ChatApp() {
  const controller = new RoomsController();
  const activeUser: User = new User(
    JSON.parse(localStorage.getItem("profile")!),
  );
  const [open, setOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const { ws, isConnected } = useWS();

  const [selectedRoom, setSelectedRoom] = useState<number>(1);
  const [input, setInput] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Record<number, Message[]>>({});
  const [users, setUsers] = useState<Record<number, RoomUser[]>>({});
  const [subscribedRooms, setSubscribedRooms] = useState<Room[]>([]);

  const joinRoom = async () => {
    ws.emit("join_room", selectedRoom);
    ws.emit("messages.suscribe", { id: selectedRoom });
    ws.on(`users.room.updated.room_${selectedRoom}`, (users) =>
      getUsersFromRoom(selectedRoom, users),
    );

    const newRoom = rooms.find((r) => r.id == selectedRoom);
    if (newRoom == undefined) return;
    setSubscribedRooms((prev) => [...prev, newRoom]);
  };

  const exitRoom = async () => {
    ws.emit("left_room", selectedRoom);
    window.location.reload();
  };

  const handleCreateRoom = async (name: string, description: string) => {
    await controller.createRoom(name, description);
    window.location.reload();
  };

  const handleUpdateRoom = async (name: string, description: string) => {
    const toBeUpdatedRoom = rooms.find((r) => r.id == selectedRoom);
    if (toBeUpdatedRoom == undefined) return;
    await controller.updateRoom(name, description, toBeUpdatedRoom);
  };

  const getInitialRooms = (data: IRoomMap[]) => {
    const newRooms = data.map((r) => Room.fromMap(r));
    setRooms(newRooms);
  };

  const getNewRoom = (room: IRoomMap) => {
    setRooms((prev) => [...prev, Room.fromMap(room)]);
  };

  const updateRoom = (room: IRoomMap) => {
    const updatedRoom = Room.fromMap(room);
    setRooms((prev) => {
      const newArr = [...prev];
      const toBeUpdatedRoom = prev.find((r) => r.id == updatedRoom.id);
      if (toBeUpdatedRoom == undefined) return prev;
      const toBeUpdatedRoomIndex = prev.indexOf(toBeUpdatedRoom);
      if (toBeUpdatedRoomIndex < 0) return prev;
      newArr[toBeUpdatedRoomIndex] = updatedRoom;
      return newArr;
    });
  };

  const getUsersFromRoom = async (roomId: number, data: any[]) => {
    const roomUsers: RoomUser[] = data.map((u) => ({
      active: u["online"],
      user: new User({
        id: u["id"],
        username: u["userName"],
        email: u["email"],
      }),
    }));
    setUsers((prev) => ({
      ...prev,
      [roomId]: roomUsers,
    }));
  };

  const getNewMessage = (message: IMessageMap | IMessageMap[]) => {
    if (Array.isArray(message)) {
      console.log("es array");
    } else {
      const newMessage = Message.fromMap(message);
      setMessages((prev) => ({
        ...prev,
        [newMessage.roomId]: [...(prev[newMessage.roomId] ?? []), newMessage],
      }));
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!isConnected) return;
      const subscribedRooms = await controller.getRoomsByUser();
      setSubscribedRooms(subscribedRooms);
      ws.emit("get_rooms");

      subscribedRooms.forEach((r) => {
        ws.emit("users.room.subscribe", r.id);
        ws.emit("messages.suscribe", { id: r.id });
        ws.on(`users.room.updated.room_${r.id}`, (users) =>
          getUsersFromRoom(r.id, users),
        );
      });
      ws.on("rooms_list", getInitialRooms);
      ws.on("room_created", getNewRoom);
      ws.on("room_updated", updateRoom);
      ws.on("messages.suscription", getNewMessage);
    };
    init();

    return () => {
      ws.socket?.off("rooms_list", getInitialRooms);
      ws.socket?.off("room_created");
      ws.socket?.off("messages.suscription");
    };
  }, [isConnected]);

  const handleSendMessage = () => {
    if (input.trim()) {
      ws.emit("users-send.message", {
        roomId: selectedRoom,
        message: input,
      });
      setInput("");
    }
  };

  const currentRoom = rooms.find((r) => r.id === selectedRoom);
  const currentUsers = users[selectedRoom] || [];
  const currentMessages = messages[selectedRoom] || [];

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        background: "#0f0f0f",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      {/* Left Sidebar - Rooms List */}
      <Drawer
        variant="permanent"
        open
        sx={{
          width: { xs: "0px", sm: "280px", md: "280px" },
          flexShrink: 0,
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: "280px",
            background: "#121212",
            border: "1px solid #1a1a1a",
            backdropFilter: "none",
            overflowY: "auto",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#888888",
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Channels
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "#1a1a1a" }} />
        <List sx={{ p: 0 }}>
          {rooms.map((room) => {
            const isSubscribed = subscribedRooms.some((r) => r.id == room.id);
            return (
              <ListItemButton
                key={room.id}
                selected={selectedRoom === room.id}
                onClick={() => setSelectedRoom(room.id)}
                sx={{
                  color:
                    selectedRoom === room.id
                      ? "#ffffff"
                      : isSubscribed
                        ? "#888888"
                        : "#555555",
                  bgcolor: selectedRoom === room.id ? "#1a1a1a" : "transparent",
                  borderLeft:
                    selectedRoom === room.id
                      ? "2px solid #00d4ff"
                      : "2px solid transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "#1a1a1a",
                    color: "#ffffff",
                  },
                  py: 1,
                  px: 2,
                }}
              >
                <ListItemText
                  primary={`# ${room.name}`}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: 500,
                      fontSize: "0.9rem",
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
        <Box flexGrow={1} />

        <Box
          display="flex"
          flexDirection="column"
          gap={1}
          p={2}
          sx={{
            borderTop: "1px solid #1a1a1a",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpen((prev) => !prev)}
            sx={{
              background: "#00d4ff",
              color: "#000000",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "4px",
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "#00b8cc",
                transform: "translateY(-1px)",
              },
            }}
          >
            New Channel
          </Button>
          <Button
            variant="text"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            sx={{
              color: "#888888",
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "#ffffff",
                bgcolor: "#1a1a1a",
              },
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Chat Area */}
      <Box
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#0f0f0f",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            width: "100%",
            height: { xs: "60px", md: "70px" },
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            p: { xs: "1.5", md: "2" },
            borderBottom: "1px solid #1a1a1a",
            backdropFilter: "none",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#ffffff",
              fontWeight: 600,
              fontSize: { xs: "1rem", md: "1.15rem" },
            }}
          >
            # {currentRoom?.name}
          </Typography>
          <Box display="flex" gap={1} flexDirection="row">
            {rooms.find((r) => r.id == selectedRoom)?.ownerId ===
              activeUser.id && (
              <Button
                onClick={() => setEditOpen(true)}
                variant="text"
                sx={{
                  color: "#00d4ff",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                  border: "1px solid #00d4ff",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(0, 212, 255, 0.1)",
                  },
                }}
              >
                Edit
              </Button>
            )}
            {subscribedRooms.some((r) => r.id == selectedRoom) && (
              <Button
                onClick={exitRoom}
                variant="text"
                sx={{
                  color: "#888888",
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                  border: "1px solid #333333",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: "#ffffff",
                    borderColor: "#555555",
                  },
                }}
              >
                Leave
              </Button>
            )}
          </Box>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: { xs: 2, md: 3 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "#333333",
              borderRadius: "3px",
              "&:hover": {
                bgcolor: "#444444",
              },
            },
          }}
        >
          {subscribedRooms.some((r) => r.id == selectedRoom) &&
            currentMessages.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  animation: "slideIn 0.3s ease",
                  "@keyframes slideIn": {
                    "0%": { opacity: 0, transform: "translateY(8px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Avatar
                  sx={{
                    background: "#1a1a1a",
                    width: 36,
                    height: 36,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#00d4ff",
                    border: "1px solid #333333",
                  }}
                >
                  {msg.userId.toString()[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ffffff",
                        fontWeight: 500,
                        fontSize: "0.9rem",
                      }}
                    >
                      User #{msg.userId}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#555555", fontSize: "0.8rem" }}
                    >
                      12:34 PM
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#cccccc",
                      mt: 0.5,
                      fontSize: "0.9rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {msg.message}
                  </Typography>
                </Box>
              </Box>
            ))}
        </Box>

        {/* Message Input Area */}
        {!subscribedRooms.some((r) => r.id == selectedRoom) ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Button
              onClick={joinRoom}
              variant="contained"
              sx={{
                background: "#00d4ff",
                color: "#000000",
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                borderRadius: "4px",
                px: 3,
                py: 1.2,
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "#00b8cc",
                  transform: "translateY(-2px)",
                },
              }}
            >
              Join Channel
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              p: { xs: 1.5, md: 2 },
              borderTop: "1px solid #1a1a1a",
              backdropFilter: "none",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder={`Message #${currentRoom?.name}`}
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
                    color: "#ffffff",
                    bgcolor: "#1a1a1a",
                    borderRadius: "4px",
                    transition: "all 0.2s ease",
                    "& fieldset": {
                      borderColor: "#333333",
                    },
                    "&:hover fieldset": {
                      borderColor: "#444444",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#00d4ff",
                      borderWidth: 1,
                    },
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "#555555",
                    opacity: 1,
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                sx={{
                  color: "#00d4ff",
                  bgcolor: "transparent",
                  borderRadius: "4px",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(0, 212, 255, 0.1)",
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      {/* Right Sidebar - Users List */}
      <Drawer
        variant="permanent"
        anchor="right"
        open
        sx={{
          width: { xs: "0px", md: "280px" },
          flexShrink: 0,
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: "280px",
            background: "#121212",
            border: "1px solid #1a1a1a",
            backdropFilter: "none",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#888888",
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
            }}
          >
            Members
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "#1a1a1a" }} />
        <List sx={{ p: 0 }}>
          {currentUsers.map((user) => (
            <ListItem
              key={user.user.id}
              sx={{
                px: 2,
                py: 1.2,
                bgcolor: "transparent",
                borderLeft: "2px solid transparent",
                transition: "all 0.2s ease",
                "&:hover": {
                  bgcolor: "#1a1a1a",
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    background: user.active ? "#00d4ff" : "#333333",
                    color: user.active ? "#000000" : "#888888",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                  }}
                >
                  {user.user.username[0].toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.user.username}
                primaryTypographyProps={{
                  sx: {
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    color: "#ffffff",
                  },
                }}
              />
              {user.active && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#00d4ff",
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
      <UpdateRoomDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdate={handleUpdateRoom}
      />
    </Box>
  );
}
