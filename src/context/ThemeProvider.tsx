import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  useMemo,
} from "react";
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

const createAppTheme = (mode: ThemeMode) => {
  const isLight = mode === "light";

  return createTheme({
    palette: {
      mode,
      ...(isLight
        ? {
            // Light Mode Colors
            primary: {
              main: "#6366f1", // Indigo
              light: "#818cf8",
              dark: "#4f46e5",
              contrastText: "#ffffff",
            },
            secondary: {
              main: "#ec4899", // Pink
              light: "#f472b6",
              dark: "#db2777",
              contrastText: "#ffffff",
            },
            background: {
              default: "#ffffff",
              paper: "#f9fafb",
            },
            text: {
              primary: "#1f2937",
              secondary: "#6b7280",
            },
            divider: "#e5e7eb",
            error: {
              main: "#ef4444",
            },
            success: {
              main: "#10b981",
            },
            warning: {
              main: "#f59e0b",
            },
            info: {
              main: "#3b82f6",
            },
          }
        : {
            // Dark Mode Colors
            primary: {
              main: "#818cf8", // Light Indigo
              light: "#a5b4fc",
              dark: "#6366f1",
              contrastText: "#0f172a",
            },
            secondary: {
              main: "#f472b6", // Light Pink
              light: "#f9a8d4",
              dark: "#ec4899",
              contrastText: "#0f172a",
            },
            background: {
              default: "#0f172a",
              paper: "#1e293b",
            },
            text: {
              primary: "#f1f5f9",
              secondary: "#cbd5e1",
            },
            divider: "#334155",
            error: {
              main: "#f87171",
            },
            success: {
              main: "#34d399",
            },
            warning: {
              main: "#fbbf24",
            },
            info: {
              main: "#60a5fa",
            },
          }),
    },
    typography: {
      fontFamily:
        '"Geist", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: "2rem",
      },
      h2: {
        fontWeight: 700,
        fontSize: "1.75rem",
      },
      h3: {
        fontWeight: 700,
        fontSize: "1.5rem",
      },
      h4: {
        fontWeight: 600,
        fontSize: "1.25rem",
      },
      h5: {
        fontWeight: 600,
        fontSize: "1rem",
      },
      h6: {
        fontWeight: 600,
        fontSize: "0.875rem",
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.5,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
            },
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              transition: "all 0.2s ease",
              "&:hover fieldset": {
                borderColor: "currentColor",
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            border: "none",
            borderRadius: "12px",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          },
        },
      },
    },
  });
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("theme-mode");
    return (saved as ThemeMode) || "dark";
  });

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      localStorage.setItem("theme-mode", newMode);
      return newMode;
    });
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
