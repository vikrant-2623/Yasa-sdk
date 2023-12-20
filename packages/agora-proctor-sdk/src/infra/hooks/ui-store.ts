import React from "react";
import { EduContext } from "../contexts";
import { EduClassroomUIStore } from "../stores/common";

export function useStore(): EduClassroomUIStore {
  const interactiveUIStores = React.useContext(EduContext.shared).interactiveUI;
  return interactiveUIStores;
}
