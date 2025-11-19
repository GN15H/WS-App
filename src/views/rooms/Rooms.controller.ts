import axios from "axios";
import type { Room, RoomMap } from "./Rooms.types";

export class RoomsController {
  async getRooms() {
    const token = localStorage.getItem('token');
    const req = await axios.get(import.meta.env.VITE_API_URI + '/rooms', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const rooms: Room[] = req.data.map((r: RoomMap) => ({ id: r['id'], name: r['name'], description: r['description'], activeUsers: r['active_users'] }))

    return rooms;
  }
}
