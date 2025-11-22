import type { Room } from "../../domain/models/Room";
import { ApiController } from "../../infra/ApiController";

export class RoomsController {

  private readonly apiController = new ApiController();

  async getRoomsByUser() {
    return await this.apiController.getRoomsByUser();
  }

  async createRoom(name: string, description: string) {
    return await this.apiController.createRoom(name, description);
  }

  async updateRoom(name: string, description: string, room: Room) {
    await this.apiController.updateRoom(name, description, room);
  }
}
