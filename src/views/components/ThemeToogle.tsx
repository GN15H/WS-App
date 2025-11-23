import { IconButton, Tooltip, useTheme as useMuiTheme } from "@mui/material";
import { useTheme } from "../../context/ThemeProvider";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();

  return (
    <Tooltip title={mode === "light" ? "Dark Mode" : "Light Mode"}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: muiTheme.palette.text.primary,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "rotate(20deg)",
            backgroundColor: muiTheme.palette.action.hover,
          },
        }}
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
};
