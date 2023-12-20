import styled, { css } from "styled-components";
import { AgoraMidBorderRadius } from "../common";

interface ICardProps {
  background?: string;
  borderTopLeftRadius?: string;
  borderTopRightRadius?: string;
  borderBottomLeftRadius?: string;
  borderBottomRightRadius?: string;
}

export const AgoraCard = styled.div<ICardProps>`
  ${AgoraMidBorderRadius};
  background: ${(props) => (props.background ? props.background : "#fff")};
  overflow: hidden;
  ${(props) =>
    props.borderTopLeftRadius &&
    css`
      border-top-left-radius: ${props.borderTopLeftRadius};
    `}
  ${(props) =>
    props.borderTopRightRadius &&
    css`
      border-top-right-radius: ${props.borderTopRightRadius};
    `}
    ${(props) =>
    props.borderBottomLeftRadius &&
    css`
      border-bottom-left-radius: ${props.borderBottomLeftRadius};
    `}
    ${(props) =>
    props.borderBottomRightRadius &&
    css`
      border-bottom-right-radius: ${props.borderBottomRightRadius};
    `}
`;
