import { FC } from "react";
import "./index.css";
export const ProctorContainer: FC<{
  children: JSX.Element;
}> = ({ children }: { children: JSX.Element }) => {
  return <div className="fcr_proctor_container">{children}</div>;
};
