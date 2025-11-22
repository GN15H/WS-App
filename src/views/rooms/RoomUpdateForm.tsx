
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
    onUpdate(form.field1, form.field2);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Editar sala</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Nombre"
          name="field1"
          value={form.field1}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          label="Descripción"
          name="field2"
          value={form.field2}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>

        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

