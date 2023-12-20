import { EduClassroomStore, EduRoomTypeEnum } from "agora-edu-core";
import { EduClassroomUIStore } from "../stores/common";

export class EduUIStoreFactory {
  static createWithType(
    type: EduRoomTypeEnum,
    store: EduClassroomStore
  ): EduClassroomUIStore {
    return new EduClassroomUIStore(store); // return default
  }
}
