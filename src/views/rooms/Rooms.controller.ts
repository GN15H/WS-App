import { ApiController } from "../../infra/ApiController";

export class RoomsController {

  private readonly apiController = new ApiController();

  async getRooms() {
    return await this.apiController.getRooms();
  }

  async createRoom(name: string, description: string) {
    return await this.apiController.createRoom(name, description);
  }

}
