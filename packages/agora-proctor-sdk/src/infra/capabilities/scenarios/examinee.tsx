import { useStore } from '@proctor/infra/hooks/ui-store';
import { AgoraButton } from '@proctor/infra/capabilities/components/button';
import { FlexContainer } from '@proctor/infra/capabilities/components/container';
import { AgoraModal } from '@proctor/infra/capabilities/components/modal';
import {
  AgoraEduClassroomEvent,
  ClassroomState,
  ClassState,
  EduEventCenter,
  LeaveReason,
} from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useCallback } from 'react';
import styled from 'styled-components';
import { Content } from '../containers/examinee/content';
import { Sider } from '../containers/examinee/sider';
import { ToastContainer } from '../containers/common/toast';
import { DialogContainer } from '../containers/common/dialog';

import Room from './room';

export const ExamineeScenario = observer(() => {
  return (
    <Room>
      <FlexContainer>
        <Content />
        <Sider />
      </FlexContainer>
      <RoomCloseModal />
      <ToastContainer />
      <DialogContainer></DialogContainer>
    </Room>
  );
});

const RoomCloseModal = observer(() => {
  const {
    studentViewUIStore: { userAvatar },
    classroomStore: {
      roomStore: {
        classroomSchedule: { state },
      },
    },
  } = useStore();
  return (
    <AgoraModal centered open={state === ClassState.close} width={730} footer={<LeaveRoomFooter />}>
      <Title>The Exam is Over!</Title>
      <section style={{ padding: '0 70px 103px 70px' }}>
        <FlexContainer direction="row" gap={20}>
          <FlexContainer direction="column" gap={28}>
            <section>
              <BolderTitle>Hello </BolderTitle>
            </section>
            <DescriptionTip>The exam is over. Hope you can get a good result!</DescriptionTip>
          </FlexContainer>
          <Avatar image={userAvatar} />
        </FlexContainer>
        <Description>You can exit the computer and mobile examination room</Description>
      </section>
    </AgoraModal>
  );
});

const LeaveRoomFooter = observer(() => {
  const {
    roomUIStore: { setRoomClosed },
  } = useStore();
  const handleLeaveRoom = useCallback(() => {
    // leave room
    setRoomClosed(true);
  }, []);
  return (
    <FooterContainer>
      <AgoraButton type="primary" size="large" width="200px" onClick={handleLeaveRoom}>
        I get it
      </AgoraButton>
    </FooterContainer>
  );
});

const Title = styled.div`
  font-size: 26px;
  font-weight: 800;
  color: #000;
  text-align: center;
  padding-top: 40px;
  padding-bottom: 80px;
`;
const BolderTitle = styled(Title)`
  text-align: left;
  padding: 0;
`;
const Description = styled.div`
  margin-top: 56px;
  font-weight: 400;
  font-size: 18px;
  color: #000;
`;
const DescriptionTip = styled(Description)`
  margin: 0;
  font-weight: 500;
  font-size: 20px;
`;

const Avatar = styled.div<{ image?: string }>`
  width: 193px;
  height: 135px;
  flex: 1 0 193px;
  border-radius: 16px;
  background-image: url(${(props) => props.image});
`;
const FooterContainer = styled.div`
  text-align: center;
  height: 100%;
  line-height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
