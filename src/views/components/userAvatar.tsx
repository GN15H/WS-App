import { Avatar, Box } from "@mui/material";
import { getContrastColor, getUserColor } from "../../utils/ColorGenerator";

interface UserAvatarProps {
  userId: number;
  username: string;
  size?: number;
  showBorder?: boolean;
  online?: boolean;
}

export function UserAvatar({
  userId,
  username,
  size = 36,
  showBorder = false,
  online = false,
}: UserAvatarProps) {
  const backgroundColor = getUserColor(userId);
  const textColor = getContrastColor(backgroundColor);
  const initial = username[0]?.toUpperCase() || "?";

  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <Avatar
        sx={{
          background: backgroundColor,
          width: size,
          height: size,
          fontWeight: 700,
          fontSize: `${size * 0.4}px`,
          color: textColor,
          border: showBorder ? "2px solid rgba(255, 255, 255, 0.3)" : "none",
          transition: "all 0.2s ease",
          cursor: "default",
        }}
        title={username}
      >
        {initial}
      </Avatar>
      {online && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: "50%",
            background: "#00d4ff",
            border: "2px solid #0f0f0f",
          }}
        />
      )}
    </Box>
  );
}
