import { EduNavAction, EduNavRecordActionPayload } from '@classroom/infra/stores/common/nav';
import { observer } from 'mobx-react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import {
  Header,
  Inline,
  Popover,
  SvgImg,
  Tooltip,
  Button,
  SvgaPlayer,
  SvgIcon,
  Card,
  Layout,
  SvgIconEnum,
} from '@classroom/ui-kit';
import { EduClassroomConfig, RecordStatus } from 'agora-edu-core';
import RecordLoading from './assets/svga/record-loading.svga';
import './index.css';
import {
  visibilityControl,
  visibilityListItemControl,
  roomNameEnabled,
  networkStateEnabled,
  scheduleTimeEnabled,
  headerEnabled,
  cameraSwitchEnabled,
  microphoneSwitchEnabled,
} from 'agora-common-libs';
import React, { useEffect, useRef } from 'react';
import classNames from 'classnames';
import { InteractionStateColors } from '@classroom/ui-kit/utilities/state-color';
import ClipboardJS from 'clipboard';
import { AgoraEduSDK } from '@classroom/infra/api';
import { useI18n } from 'agora-common-libs';
import { useClickAnywhere } from '@classroom/infra/hooks';

const SignalContent = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { networkQualityLabel, delay, packetLoss } = navigationBarUIStore;
  const transI18n = useI18n();
  return (
    <>
      <table>
        <tbody>
          <tr>
            <td className="biz-col label left">{transI18n('signal.status')}:</td>
            <td className="biz-col value left">{networkQualityLabel}</td>
            <td className="biz-col label right">{transI18n('signal.delay')}:</td>
            <td className="biz-col value right">{delay}</td>
          </tr>
          <tr>
            <td className="biz-col label left">{transI18n('signal.lose')}:</td>
            <td className="biz-col value left">{packetLoss}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
});

const SignalQuality = visibilityControl(
  observer(() => {
    const { navigationBarUIStore } = useStore();
    const { networkQualityClass, networkQualityIcon } = navigationBarUIStore;

    return (
      <Popover content={<SignalContent />} placement="bottomLeft">
        <div className={`biz-signal-quality ${networkQualityClass}`}>
          <SvgImg
            className="cursor-pointer"
            type={networkQualityIcon.icon}
            colors={{ iconPrimary: networkQualityIcon.color }}
            size={24}
          />
        </div>
      </Popover>
    );
  }),
  networkStateEnabled,
);

const ScheduleTime = visibilityControl(
  observer(() => {
    const { navigationBarUIStore } = useStore();
    const { classStatusText, classStatusTextColor } = navigationBarUIStore;
    return <Inline color={classStatusTextColor}>{classStatusText}</Inline>;
  }),
  scheduleTimeEnabled,
);

const RoomName = visibilityControl(
  observer(() => {
    const { navigationBarUIStore } = useStore();
    const { navigationTitle } = navigationBarUIStore;
    return <React.Fragment> {navigationTitle}</React.Fragment>;
  }),
  roomNameEnabled,
);

const ScreenShareTip = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { currScreenShareTitle } = navigationBarUIStore;
  return currScreenShareTitle ? (
    <div className="fcr-biz-header-title-share-name">{currScreenShareTitle}</div>
  ) : null;
});

const StartButton = observer(() => {
  const { navigationBarUIStore } = useStore();
  const transI18n = useI18n();
  const { isBeforeClass, startClass } = navigationBarUIStore;
  return isBeforeClass ? (
    <Button size="xs" onClick={() => startClass()}>
      {transI18n('begin_class')}
    </Button>
  ) : null;
});

const RoomState = () => {
  return (
    <React.Fragment>
      <div className="fcr-biz-header-title">
        <ScreenShareTip />
        <RoomName />
      </div>
      <StartButton />

    </React.Fragment>
  );
};

const Actions = observer(() => {
  const { navigationBarUIStore } = useStore();
  const { actions } = navigationBarUIStore;

  return (
    <React.Fragment>
      {console.log(actions, 'actions')}
      {actions.length
        ? actions.map((a) =>
          a.id === 'Record' ? (

            <NavigationBarRecordAction
              key={a.iconType}
              action={a as EduNavAction<EduNavRecordActionPayload>}
            />
          ) : (
            <NavigationBarAction key={a.iconType} action={a as EduNavAction} />
          ),
        )
        : null}
    </React.Fragment>
  );
});

const ShareCard = observer(() => {
  const { navigationBarUIStore, shareUIStore } = useStore();
  const cls = classNames('absolute z-20 share-room-box', {});
  const { roomName, roomUuid } = EduClassroomConfig.shared.sessionInfo;
  const copyRef = useRef<HTMLSpanElement>(null);
  const transI18n = useI18n();

  useEffect(() => {
    if (copyRef.current) {
      const clipboard = new ClipboardJS(copyRef.current);
      clipboard.on('success', function (e) {
        shareUIStore.addToast(transI18n('fcr_copy_success'));
        navigationBarUIStore.closeShare();
      });
      clipboard.on('error', function (e) {
        shareUIStore.addToast('Failed to copy');
      });
      return () => {
        clipboard.destroy();
      };
    }
  }, []);

  const ref = useClickAnywhere(() => {
    navigationBarUIStore.closeShare();
  });

  const t = useI18n();

  return (
    <div
      ref={ref}
      className={cls}
      style={{
        display: navigationBarUIStore.shareVisible ? 'block' : 'none',
        right: 42,
        top: 30,
      }}>
      <Card
        style={{
          padding: 20,
          borderRadius: 10,
        }}>
        <Layout direction="col">
          <Layout className="justify-between">
            <span className="text-14 whitespace-nowrap">{t('fcr_copy_room_name')}</span>
            <span className={'w-1/2 truncate text-right'} title={roomName}>
              {roomName}
            </span>
          </Layout>
          <Layout className="justify-between mt-3">
            <span className="text-14 whitespace-nowrap">{t('fcr_copy_room_id')}</span>
            <span className={'w-1/2 truncate text-right'} title={roomUuid}>
              {roomUuid}
            </span>
          </Layout>
          <Layout className="justify-between mt-3">
            <span className="text-14 whitespace-nowrap">{t('fcr_copy_share_link')}</span>
            <Button type="ghost" style={{ marginLeft: 40 }} size="xs">
              <Layout className="mx-4 items-center">
                <SvgImg
                  type={SvgIconEnum.LINK_SOLID}
                  colors={{ iconPrimary: InteractionStateColors.allow }}
                  size={16}
                />
                <span
                  ref={copyRef}
                  data-clipboard-text={`${AgoraEduSDK.shareUrl}`}
                  className="text-12 cursor-pointer whitespace-nowrap"
                  style={{ color: InteractionStateColors.allow, marginLeft: 4 }}>
                  {t('fcr_copy_share_link_copy')}
                </span>
              </Layout>
            </Button>
          </Layout>
        </Layout>
      </Card>
    </div>
  );
});

const NavigationBarRecordAction = observer(
  ({ action }: { action: EduNavAction<EduNavRecordActionPayload> }) => {
    const { payload } = action;
    return payload ? (
      <div className="flex items-center recording-info ">
        {payload.recordStatus === RecordStatus.started && (
          <i className="record-heartbeat animate-pulse"></i>
        )}
        {payload.text && <span className="record-tips">{payload.text}</span>}
        {payload.recordStatus === RecordStatus.starting ? (
          <SvgaPlayer className="record-icon" url={RecordLoading} width={18} height={18} loops />
        ) : (
          <Tooltip key={action.title} title={action.title} placement="top">
            <div className="action-icon record-icon">
              <SvgIcon
                colors={{ iconPrimary: action.iconColor }}
                type={action.iconType}
                hoverType={action.iconType}
                size={18}
                onClick={action.onClick}
              />

            </div>
          </Tooltip>
        )}
      </div>
    ) : null;
  },
);

export const NavigationBarAction = visibilityListItemControl(
  observer(({ action }: { action: EduNavAction }) => {
    console.log('action, ', action)
    return (
      <>
        <Tooltip title={action.title} placement="top">
          <div onClick={action.onClick} className={action.id === 'Exit' ? 'action-icon end-call-action' : 'action-icon btn_action'}>
            <SvgIcon
              colors={{ iconPrimary: action.iconColor }}
              type={action.iconType}
              hoverType={action.iconType}
              size={18}
              
            />
            {action.title === 'Setting' || action.title === 'Share' ? <p>{action.title}</p> : ''}
          </div>
        </Tooltip>
      </>
    );
  }),


  (uiConfig, { action }) => {
    if (action.id === 'Camera' && !cameraSwitchEnabled(uiConfig)) {
      return false;
    }
    if (action.id === 'Mic' && !microphoneSwitchEnabled(uiConfig)) {
      return false;
    }
    return true;
  }


);

export const NavigationBar = visibilityControl(() => {
  return (
    <React.Fragment>
      <div className='room-state-wrapper'>
        <svg width="86" height="38" viewBox="0 0 86 38" fill="none" xmlns="http://www.w3.org/2000/svg" className='top-left-logo'>
          <g clip-path="url(#clip0_1527_4553)">
            <path d="M5.79807 18.5792C5.71094 13.3378 5.19843 11.1068 4.68077 9.56311C2.19499 9.13742 0.0474854 7.24494 0.0474854 4.75246C0.0474854 2.60871 1.5082 0.890625 3.91197 0.890625C7.60218 0.890625 9.91884 4.2396 9.91884 11.1119C9.91884 14.7173 12.4098 21.9897 17.6427 21.9897C18.76 21.9897 19.7902 23.1077 19.7902 24.8258C19.7902 26.5439 18.76 27.6619 17.6427 27.6619C14.5521 27.6619 11.7178 26.8875 9.91884 24.1386L9.83171 24.0514C9.91884 26.2003 10.1751 29.8057 10.5185 32.0417C9.74459 32.6418 8.54523 32.8982 7.3408 32.8982C6.14149 24.0514 5.96724 27.4311 5.79807 18.5843V18.5792Z" fill="white" />
            <path d="M49.4865 18.0367C49.4865 23.4474 46.6522 27.3964 42.8748 27.3964C40.2148 27.3964 37.811 25.8527 36.6117 23.3602C36.012 25.9399 34.3821 27.8272 31.4607 27.8272C29.057 27.8272 26.6532 26.2835 25.1105 22.8473C23.4806 26.1091 20.9026 27.6579 17.6429 27.6579C16.4435 27.6579 15.4954 26.5399 15.4954 24.8219C15.4954 23.1038 16.4385 21.9857 17.6429 21.9857C21.7636 21.9857 23.906 19.7548 24.68 15.2878C25.8793 15.2878 26.4841 15.5442 27.1708 15.8878C27.8576 19.6676 28.9749 22.155 31.4607 22.155C33.3468 22.155 34.4642 20.6113 34.4642 17.7751C34.4642 16.7443 34.295 15.2826 34.0336 14.1697C35.6635 14.1697 36.8679 14.4262 37.2934 14.857C38.4978 19.5804 40.6402 21.7293 43.1311 21.7293C45.1043 21.7293 46.0474 20.442 46.0474 18.9804C46.0474 16.8315 43.987 14.7698 41.2398 13.4825C41.6704 11.1644 43.6436 9.01552 45.5297 8.67188C47.8464 10.8208 49.4813 14.5134 49.4813 18.0316L49.4865 18.0367Z" fill="white" />
            <path d="M57.8104 18.5792C57.7229 13.3378 57.2105 11.1068 56.6927 9.56311C54.2021 9.13228 52.0596 7.24494 52.0596 4.75246C52.0596 2.60358 53.5203 0.890625 55.9241 0.890625C59.614 0.890625 61.9311 4.2396 61.9311 11.1119C61.9311 14.7173 64.4169 21.9897 69.6548 21.9897C70.772 21.9897 71.8022 23.1077 71.8022 24.8258C71.8022 26.5439 70.772 27.6619 69.6548 27.6619C66.5642 27.6619 63.7348 26.8875 61.9311 24.1386L61.8436 24.0514C61.9311 26.2003 62.1873 29.8057 62.5305 32.0417C61.7566 32.6418 60.5572 32.8982 59.353 32.8982C58.1482 24.0514 57.9791 27.4311 57.8104 18.5843V18.5792Z" fill="white" />
            <path d="M83.2163 16.0596C83.2163 23.6192 78.4086 27.6554 69.6548 27.6554C68.5376 27.6554 67.4204 27.0553 67.4204 24.8192C67.4204 22.5832 68.5376 21.9832 69.6548 21.9832C72.6583 21.9832 76.1791 21.7267 77.466 21.2087C78.8394 20.6959 79.7826 19.8343 79.7826 18.4598C79.7826 16.1417 78.1524 14.5108 73.4323 11.331C73.8625 9.44371 75.7489 6.69477 77.6347 5.32031C81.2381 8.23847 83.2163 12.2747 83.2163 16.0545V16.0596Z" fill="white" />
            <path d="M74.8053 30.9219C76.3479 30.9219 77.4656 32.6399 77.4656 34.358C77.4656 35.8197 76.3479 37.107 74.8053 37.107C73.2627 37.107 72.2325 35.8197 72.2325 34.358C72.2325 32.6399 73.2627 30.9219 74.8053 30.9219Z" fill="#EA4435" />
            <path d="M82.7855 30.9219C84.3286 30.9219 85.4458 32.6399 85.4458 34.358C85.4458 35.8197 84.3286 37.107 82.7855 37.107C81.243 37.107 80.2128 35.8197 80.2128 34.358C80.2128 32.6399 81.243 30.9219 82.7855 30.9219Z" fill="#EA4435" />
          </g>
          <defs>
            <clipPath id="clip0_1527_4553">
              <rect width="85.3979" height="36.2131" fill="white" transform="translate(0.0477295 0.890625)" />
            </clipPath>
          </defs>
        </svg>
        <RoomState />
      </div>
      <div className='call-timer-wrap'>
        <ScheduleTime />
      </div>
      <Header className="fcr-biz-header">
        <div className="header-signal">
          <SignalQuality />
        </div>
        <div className="header-actions">
          <Actions />
          <ShareCard />
        </div>
      </Header>
    </React.Fragment>);
}, headerEnabled);
