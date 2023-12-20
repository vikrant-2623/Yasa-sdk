import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'

import { useStore } from '@proctor/infra/hooks/ui-store';
import { EduClassroomConfig, EduRoleTypeEnum, EduRoomTypeEnum } from 'agora-edu-core';
import { observer } from 'mobx-react';
import { useEffect, useState } from 'react';
import { PretestContainer } from '@proctor/infra/capabilities/containers/common/pretest';
import { ExamineeScenario } from './examinee';
import { ProctorScenario } from './proctor';

export type ScenariosProps = {
  pretest: boolean;
  roomType: EduRoomTypeEnum;
};

export const Scenarios: React.FC<ScenariosProps> = observer(({ pretest }) => {
  const { initialize, destroy } = useStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initialize();
    setInitialized(true);
    return destroy;
  }, []);
  const [showPretest, setPretest] = useState(pretest);

  return initialized ? (
    showPretest ? (
      <PretestContainer onOk={() => setPretest(false)} />
    ) : (
      renderSceneByRoleType(EduClassroomConfig.shared.sessionInfo.role)
    )
  ) : null;
});

const renderSceneByRoleType = (role: EduRoleTypeEnum) => {
  switch (role) {
    case EduRoleTypeEnum.teacher:
      return <ProctorScenario />;
    case EduRoleTypeEnum.student:
      return <ExamineeScenario />;
    default:
      throw new Error(`${role} role not supported`);
  }
};
