import { useEffect, useState } from "react";
import { RoomsController } from "./Rooms.controller";
import type { Room } from "./Rooms.types";


export const Rooms = () => {
  const controller = new RoomsController();
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await controller.getRooms()
      setRooms(data);
      console.log(data);
    }
    fetchData();
  }, [])

  return (
    <>
      {
        rooms.map(r => (
          <div>{`${r.id} ${r.name}`}</div>
        ))
      }
    </>
  );
}
