import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import styled from 'styled-components';
export const Tag = ({ svgIcon, tagText }: { svgIcon?: SvgIconEnum; tagText: string }) => {
  return (
    <TagContainer>
      {svgIcon && <SvgImg type={svgIcon} size={22} colors={{ iconPrimary: '#000' }} />}
      <TagText>{tagText}</TagText>
    </TagContainer>
  );
};
const TagContainer = styled.div`
  height: 17px;
  padding: 0 8px;
  display: flex;
  position: absolute;
  bottom: 6px;
  left: 6px;
  border-radius: 8px;
  background: rgba(217, 217, 217, 0.9);
  align-items: center;
  justify-content: center;
  gap: 6px;
  z-index: 9;
`;

const TagText = styled.span`
  font-size: 12px;
  line-height: 12px;
  color: #000;
`;
