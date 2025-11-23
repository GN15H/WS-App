import type React from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => void;
}

export default function SimpleFormDialog({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState({ field1: "", field2: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (form.field1.trim()) {
      onSubmit(form.field1, form.field2);
      setForm({ field1: "", field2: "" });
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "8px",
          background: "#1a1a1a",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          backdropFilter: "none",
          border: "1px solid #333333",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "#121212",
          color: "#ffffff",
          fontSize: "1.1rem",
          fontWeight: 600,
          borderBottom: "1px solid #333333",
        }}
      >
        Create Channel
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          pt: 2.5,
          pb: 2,
        }}
      >
        <TextField
          label="Channel Name"
          name="field1"
          value={form.field1}
          onChange={handleChange}
          placeholder="e.g. general, random..."
          fullWidth
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
              bgcolor: "#121212",
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
              },
            },
            "& .MuiOutlinedInput-input::placeholder": {
              color: "#555555",
              opacity: 1,
            },
          }}
        />

        <TextField
          label="Description"
          name="field2"
          value={form.field2}
          onChange={handleChange}
          placeholder="Describe the purpose..."
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#ffffff",
              bgcolor: "#121212",
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
              },
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 1.5,
          gap: 1,
          borderTop: "1px solid #333333",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#888888",
            textTransform: "none",
            fontSize: "0.9rem",
            fontWeight: 500,
            transition: "all 0.2s ease",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.05)",
              color: "#ffffff",
            },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.field1.trim()}
          sx={{
            background: "#00d4ff",
            color: "#000000",
            textTransform: "none",
            fontSize: "0.9rem",
            fontWeight: 600,
            borderRadius: "4px",
            transition: "all 0.2s ease",
            "&:hover:not(:disabled)": {
              background: "#00b8cc",
              transform: "translateY(-1px)",
            },
            "&:disabled": {
              opacity: 0.4,
            },
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
