import axios from "axios";
import type { IRoomMap, Room } from "../domain/models/Room";

export class ApiController {

  async getRooms() {
    const token = localStorage.getItem('token');
    const req = await axios.get(import.meta.env.VITE_API_URI + '/rooms', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    const rooms: Room[] = req.data.map((r: IRoomMap) => ({ id: r['id'], name: r['name'], description: r['description'], }))
    return rooms;
  }

}
