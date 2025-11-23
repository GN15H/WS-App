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
  onUpdate: (name: string, description: string) => void;
}

export default function UpdateRoomDialog({ open, onClose, onUpdate }: Props) {
  const [form, setForm] = useState({ field1: "", field2: "" });
  const [hoveredField, setHoveredField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (form.field1.trim()) {
      onUpdate(form.field1, form.field2);
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
          borderRadius: "12px",
          background: "linear-gradient(135deg, #1e1e2e 0%, #2d2d3d 100%)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(90deg, #ff8a5b 0%, #ff6b35 100%)",
          color: "#fff",
          fontSize: "1.3rem",
          fontWeight: 600,
          letterSpacing: "0.5px",
        }}
      >
        ✏️ Editar Sala
      </DialogTitle>

      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          pt: 3,
          pb: 2,
        }}
      >
        <TextField
          label="Nombre"
          name="field1"
          value={form.field1}
          onChange={handleChange}
          onMouseEnter={() => setHoveredField("field1")}
          onMouseLeave={() => setHoveredField(null)}
          fullWidth
          variant="outlined"
          size="medium"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              bgcolor: hoveredField === "field1" ? "#3d3d4d" : "#2d2d3d",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              "& fieldset": {
                borderColor: hoveredField === "field1" ? "#ff8a5b" : "#4d4d5d",
                transition: "all 0.3s ease",
              },
              "&:hover fieldset": {
                borderColor: "#ff8a5b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ff8a5b",
                borderWidth: 2,
              },
            },
            "& .MuiOutlinedInput-input::placeholder": {
              color: "#8d8d9d",
              opacity: 1,
            },
          }}
        />

        <TextField
          label="Descripción"
          name="field2"
          value={form.field2}
          onChange={handleChange}
          onMouseEnter={() => setHoveredField("field2")}
          onMouseLeave={() => setHoveredField(null)}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#fff",
              bgcolor: hoveredField === "field2" ? "#3d3d4d" : "#2d2d3d",
              borderRadius: "8px",
              transition: "all 0.3s ease",
              "& fieldset": {
                borderColor: hoveredField === "field2" ? "#ff8a5b" : "#4d4d5d",
                transition: "all 0.3s ease",
              },
              "&:hover fieldset": {
                borderColor: "#ff8a5b",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#ff8a5b",
                borderWidth: 2,
              },
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          gap: 1,
          borderTop: "1px solid #4d4d5d",
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: "#8d8d9d",
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.field1.trim()}
          sx={{
            background: "linear-gradient(90deg, #ff8a5b 0%, #ff6b35 100%)",
            color: "#fff",
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 600,
            borderRadius: "6px",
            transition: "all 0.3s ease",
            "&:hover:not(:disabled)": {
              transform: "translateY(-2px)",
              boxShadow: "0 10px 25px rgba(255, 107, 53, 0.4)",
            },
            "&:disabled": {
              opacity: 0.5,
            },
          }}
        >
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
