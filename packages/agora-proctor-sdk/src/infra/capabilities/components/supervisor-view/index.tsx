import styled from 'styled-components';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import { Tag } from '../tag';

interface IViewProps {
  tag: 'Phone' | 'PC';
  video: React.ReactNode;
}
export const SupervisorView: React.FC<IViewProps> = ({ tag, video }) => {
  return (
    <Container>
      <Tag svgIcon={SvgIconEnum.RECORDING} tagText={tag}></Tag>
      {video}
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
