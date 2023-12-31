import { roomApi } from '@app/api';
import { HomeSettingContainerH5 } from '@app/pages/home/home-setting/h5';
import { GlobalStoreContext } from '@app/stores';
import { GlobalLaunchOption } from '@app/stores/global';
import { REACT_APP_AGORA_APP_SDK_DOMAIN } from '@app/utils/env';
import { LanguageEnum } from 'agora-classroom-sdk';
import { applyTheme, loadGeneratedFiles, themes } from 'agora-classroom-sdk';
import {
  EduClassroomConfig,
  EduRegion,
  EduRoleTypeEnum,
  EduRoomTypeEnum,
  Platform,
} from 'agora-edu-core';
import md5 from 'js-md5';
import { observer } from 'mobx-react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useHistory } from 'react-router';
import { H5Login } from './scaffold';
import { MessageDialog } from './message-dialog';
import { FcrMultiThemeMode } from 'agora-common-libs';

declare const CLASSROOM_SDK_VERSION: string;

const useTheme = () => {
  useEffect(() => {
    loadGeneratedFiles();
    const theme = themes['default'][FcrMultiThemeMode.light];
    applyTheme(theme);
  }, []);
};
export const HomeH5Page = observer(() => {
  const globalStore = useContext(GlobalStoreContext);
  const { launchConfig, setLanguage, language } = globalStore;

  const [roomId, setRoomId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [roomName, setRoomName] = useState<string>(launchConfig.roomName || '');
  const [userName, setUserName] = useState<string>(launchConfig.userName || '');
  const [userRole, setRole] = useState<string>('student');
  const [curScenario, setScenario] = useState<string>('big-class');
  const [duration] = useState<number>(30);
  const [region] = useState<EduRegion>(EduRegion.CN);
  const [debug] = useState<boolean>(false);
  const [encryptionMode, setEncryptionMode] = useState<string>('');
  const [encryptionKey, setEncryptionKey] = useState<string>('');
  useTheme();

  const onChangeLanguage = (lang: string) => {
    setLanguage(lang as any);
  };

  const role = useMemo(() => {
    const roles = {
      teacher: EduRoleTypeEnum.teacher,
      assistant: EduRoleTypeEnum.assistant,
      student: EduRoleTypeEnum.student,
      incognito: EduRoleTypeEnum.invisible,
      observer: EduRoleTypeEnum.observer,
    };
    return roles[userRole];
  }, [userRole]);

  const scenario = useMemo(() => {
    const scenes = {
      '1v1': EduRoomTypeEnum.Room1v1Class,
      'mid-class': EduRoomTypeEnum.RoomSmallClass,
      'big-class': EduRoomTypeEnum.RoomBigClass,
    };
    return scenes[curScenario];
  }, [curScenario]);

  const userUuid = useMemo(() => {
    if (!debug) {
      return `${md5(userName)}${role}`;
    }
    return `${userId}`;
  }, [role, userName, debug, userId]);

  const roomUuid = useMemo(() => {
    if (!debug) {
      return `${md5(roomName)}${scenario}`;
    }
    return `${roomId}`;
  }, [scenario, roomName, debug, roomId]);

  const onChangeRole = (value: string) => {
    setRole(value);
  };

  const onChangeScenario = (value: string) => {
    setScenario(value);
  };

  const text: Record<string, CallableFunction> = {
    roomId: setRoomId,
    userName: setUserName,
    roomName: setRoomName,
    userId: setUserId,
    encryptionMode: setEncryptionMode,
    encryptionKey: setEncryptionKey,
  };

  const onChangeRoomName = (newValue: string) => {
    text['roomName'](newValue);
  };

  const onChangeUserName = (newValue: string) => {
    text['userName'](newValue);
  };

  const history = useHistory();

  return (
    <React.Fragment>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="black" name="apple-mobile-web-app-status-bar-style" />
        <meta content="telephone=no" name="format-detection" />
      </Helmet>
      <MessageDialog />
      <H5Login
        version={CLASSROOM_SDK_VERSION}
        SDKVersion={EduClassroomConfig.getRtcVersion()}
        roomId={roomUuid}
        userId={userUuid}
        roomName={roomName}
        userName={userName}
        role={userRole}
        scenario={curScenario}
        duration={duration}
        onChangeScenario={onChangeScenario}
        onChangeRoomName={onChangeRoomName}
        onChangeUserName={onChangeUserName}
        language={language}
        onChangeLanguage={onChangeLanguage}
        onClick={async () => {
          const sdkDomain = `${REACT_APP_AGORA_APP_SDK_DOMAIN}`;

          const { token, appId } = await roomApi.getCredentialNoAuth({ userUuid, roomUuid, role });

          const config: GlobalLaunchOption = {
            appId,
            sdkDomain,
            pretest: false,
            courseWareList: [],
            language: language as LanguageEnum,
            userUuid: `${userUuid}`,
            rtmToken: token,
            roomUuid: `${roomUuid}`,
            roomType: scenario,
            roomName: `${roomName}`,
            userName: userName,
            roleType: role,
            startTime: Date.now(),
            region,
            duration: duration * 60,
            latencyLevel: 2,
            platform: Platform.H5,
            // @ts-ignore
            curScenario,
            // @ts-ignore
            userRole,
          };
          if (encryptionKey && encryptionMode) {
            config!.mediaOptions!.encryptionConfig = {
              key: encryptionKey,
              mode: parseInt(encryptionMode),
            };
          }
          globalStore.setLaunchConfig(config);
          history.replace('/launch');
        }}
      />
      <HomeSettingContainerH5 />
    </React.Fragment>
  );
});
