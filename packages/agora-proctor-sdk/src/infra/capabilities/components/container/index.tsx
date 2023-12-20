import styled, { css } from "styled-components";

interface IContainerProps {
  width?: number;
  height?: number;
  flex?: any;
  direction?: "column" | "row";
  gap?: number;
}

export const FlexContainer = styled.div<IContainerProps>`
  display: flex;
  flex-direction: ${(props) => (props.direction ? props.direction : "row")};

  width: ${(props) => (props.width ? `${props.width}px` : "100%")};
  height: ${(props) => (props.height ? `${props.height}px` : "100%")};
  ${(props) =>
    props.flex &&
    css`
      flex: ${props.flex};
    `}
  ${(props) =>
    props.gap &&
    css`
      gap: ${props.gap}px;
    `}
`;
