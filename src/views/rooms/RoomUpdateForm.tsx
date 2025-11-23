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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Editar Canal</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
        <TextField
          label="Nombre"
          name="field1"
          value={form.field1}
          onChange={handleChange}
          fullWidth
          variant="outlined"
          size="small"
        />
        <TextField
          label="Descripción"
          name="field2"
          value={form.field2}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          variant="outlined"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!form.field1.trim()}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
