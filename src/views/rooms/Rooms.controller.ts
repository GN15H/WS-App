import { ApiController } from "../../infra/ApiController";

export class RoomsController {

  private readonly apiController = new ApiController();

  async getRooms() {
    return await this.apiController.getRooms();
  }

}
