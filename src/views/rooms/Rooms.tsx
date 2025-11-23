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
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        width: "100vw",
        overflow: "hidden",
      }}
    >
      <Drawer
        variant="permanent"
        open
        sx={{
          width: { xs: "60vw", sm: "35vw", md: "240px" },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: "60vw", sm: "35vw", md: "240px" },
            background: "linear-gradient(180deg, #2d2d3d 0%, #1e1e2e 100%)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            💬 Salas
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />
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
                      ? "#fff"
                      : isSubscribed
                        ? "#b9bbbe"
                        : "#ff6b6b",
                  bgcolor:
                    selectedRoom === room.id
                      ? "rgba(124, 92, 255, 0.2)"
                      : "transparent",
                  borderLeft:
                    selectedRoom === room.id
                      ? "3px solid #7c5cff"
                      : "3px solid transparent",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(124, 92, 255, 0.15)",
                    color: "#fff",
                  },
                  py: 1.5,
                  px: 2,
                }}
              >
                <ListItemText
                  primary={`# ${room.name}`}
                  primaryTypographyProps={{
                    sx: {
                      fontWeight: selectedRoom === room.id ? 600 : 500,
                      fontSize: "0.95rem",
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
          flexDirection="row"
          gap={1}
          p={2}
          sx={{
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Button
            variant="contained"
            onClick={() => setOpen((prev) => !prev)}
            sx={{
              flex: 1,
              background: "linear-gradient(90deg, #7c5cff 0%, #5f40e8 100%)",
              color: "#fff",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "6px",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(124, 92, 255, 0.3)",
              },
            }}
          >
            + Nueva
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
            sx={{
              flex: 1,
              color: "#ff6b6b",
              borderColor: "rgba(255, 107, 107, 0.3)",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "6px",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: "rgba(255, 107, 107, 0.1)",
                borderColor: "#ff6b6b",
              },
            }}
          >
            Salir
          </Button>
        </Box>
      </Drawer>

      <Box
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          bgcolor: "transparent",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            width: "100%",
            height: "10%",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.15rem",
            }}
          >
            # {currentRoom?.name}{" "}
            {!subscribedRooms.some((r) => r.id == selectedRoom)
              ? "(No pertenece)"
              : ""}
          </Typography>
          <Box display="flex" gap={1} flexDirection="row">
            {rooms.find((r) => r.id == selectedRoom)?.ownerId ===
              activeUser.id && (
              <Button
                onClick={() => setEditOpen(true)}
                variant="outlined"
                sx={{
                  background:
                    "linear-gradient(90deg, #ff8a5b 0%, #ff6b35 100%)",
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "6px",
                  border: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(255, 107, 53, 0.3)",
                  },
                }}
              >
                Editar
              </Button>
            )}
            {subscribedRooms.some((r) => r.id == selectedRoom) && (
              <Button
                onClick={exitRoom}
                variant="outlined"
                sx={{
                  color: "#ff6b6b",
                  borderColor: "rgba(255, 107, 107, 0.3)",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "6px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 107, 107, 0.1)",
                    borderColor: "#ff6b6b",
                  },
                }}
              >
                Salir
              </Button>
            )}
          </Box>
        </Box>

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              bgcolor: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.2)",
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
                    "0%": { opacity: 0, transform: "translateY(10px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <Avatar
                  sx={{
                    background:
                      "linear-gradient(135deg, #7c5cff 0%, #5f40e8 100%)",
                    width: 40,
                    height: 40,
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {msg.userId.toString()[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.95rem",
                      }}
                    >
                      User #{msg.userId}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#8d8d9d" }}>
                      12:34 PM
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#dcddde",
                      mt: 0.5,
                      fontSize: "0.95rem",
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
                background: "linear-gradient(90deg, #7c5cff 0%, #5f40e8 100%)",
                color: "#fff",
                textTransform: "none",
                fontSize: "0.95rem",
                fontWeight: 600,
                borderRadius: "6px",
                px: 3,
                py: 1.2,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 25px rgba(124, 92, 255, 0.4)",
                },
              }}
            >
              Unirse a la sala
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                placeholder={`Mensaje en #${currentRoom?.name}`}
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
                    bgcolor: "#2d2d3d",
                    borderRadius: "8px",
                    transition: "all 0.3s ease",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(124, 92, 255, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#7c5cff",
                      borderWidth: 1.5,
                    },
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "#8d8d9d",
                    opacity: 1,
                  },
                }}
              />
              <IconButton
                onClick={handleSendMessage}
                sx={{
                  color: "#7c5cff",
                  bgcolor: "rgba(124, 92, 255, 0.1)",
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "#fff",
                    bgcolor: "rgba(124, 92, 255, 0.2)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>

      <Drawer
        variant="permanent"
        anchor="right"
        open
        sx={{
          width: { xs: "60vw", sm: "35vw", md: "240px" },
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: { xs: "60vw", sm: "35vw", md: "240px" },
            background: "linear-gradient(180deg, #2d2d3d 0%, #1e1e2e 100%)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            👥 Usuarios
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255, 255, 255, 0.1)" }} />
        <List sx={{ p: 0 }}>
          {currentUsers.map((user) => (
            <ListItem
              key={user.user.id}
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: user.active
                  ? "rgba(124, 92, 255, 0.1)"
                  : "transparent",
                borderLeft: user.active
                  ? "3px solid #43B581"
                  : "3px solid transparent",
                transition: "all 0.3s ease",
                "&:hover": {
                  bgcolor: "rgba(124, 92, 255, 0.15)",
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    background: user.active
                      ? "linear-gradient(135deg, #43B581 0%, #2ecc71 100%)"
                      : "linear-gradient(135deg, #747f8d 0%, #5d6d7b 100%)",
                    fontWeight: 700,
                    fontSize: "0.9rem",
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
                    color: "#fff",
                  },
                }}
              />
              {user.active && (
                <Chip
                  label="Online"
                  size="small"
                  sx={{
                    height: 20,
                    background:
                      "linear-gradient(90deg, #43B581 0%, #2ecc71 100%)",
                    color: "#fff",
                    fontSize: "0.65rem",
                    fontWeight: 600,
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
