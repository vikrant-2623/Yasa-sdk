import { useStore } from '@proctor/infra/hooks/ui-store';
import { EduStream } from 'agora-edu-core';
import { AGRemoteVideoStreamType, AgoraRteScene, AGRenderMode } from 'agora-rte-sdk';
import { observer } from 'mobx-react';
import {
  CSSProperties,
  FC,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { SvgIconEnum, SvgImg } from '@proctor/ui-kit';
import './index.css';
type RemoteTrackPlayerProps = {
  stream: EduStream;
  style?: CSSProperties;
  className?: string;
  mirrorMode?: boolean;
  fromScene?: AgoraRteScene;
  subscribeLowStream?: boolean;
};

type LocalTrackPlayerProps = Omit<RemoteTrackPlayerProps, 'stream'>;
export const LocalTrackPlayer: FC<LocalTrackPlayerProps> = observer(({ style, className }) => {
  const {
    streamUIStore: { setupLocalVideo },
  } = useStore();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (ref.current) {
      setupLocalVideo(ref.current, false);
    }
  }, [setupLocalVideo]);

  return <div style={style} className={`fcr-track-player ${className}`} ref={ref}></div>;
});
export const RemoteTrackPlayer = observer(
  forwardRef<{ fullScreen: () => void }, RemoteTrackPlayerProps>(
    (
      { style, className, stream, mirrorMode = false, fromScene, subscribeLowStream = true },
      ref,
    ) => {
      const {
        classroomStore: {
          streamStore: { setupRemoteVideo, muteRemoteAudioStream, setRemoteVideoStreamType },
        },
      } = useStore();
      const [isFullScreen, setIsFullScreen] = useState(false);
      const playerContainerRef = useRef<HTMLDivElement | null>(null);
      useEffect(() => {
        if (!subscribeLowStream) return;
        if (isFullScreen) {
          setRemoteVideoStreamType(
            stream.streamUuid,
            AGRemoteVideoStreamType.HIGH_STREAM,
            fromScene,
          );
          muteRemoteAudioStream(stream, false, fromScene);
        } else {
          setRemoteVideoStreamType(
            stream.streamUuid,
            AGRemoteVideoStreamType.LOW_STREAM,
            fromScene,
          );

          muteRemoteAudioStream(stream, true, fromScene);
        }
      }, [isFullScreen, fromScene, stream, subscribeLowStream]);
      useEffect(() => {
        if (playerContainerRef.current) {
          setupRemoteVideo(
            stream,
            playerContainerRef.current,
            mirrorMode,
            AGRenderMode.fit,
            fromScene,
          );
        }
      }, [mirrorMode, setupRemoteVideo]);
      const handleFullScreenChange = (e: Event) => {
        if (document.fullscreenElement === null) {
          setIsFullScreen(false);
          e.target?.removeEventListener('fullscreenchange', handleFullScreenChange);
        }
      };
      useImperativeHandle(ref, () => ({
        fullScreen: async () => {
          const mediaElement = playerContainerRef.current?.querySelector('video');
          if (mediaElement) {
            await mediaElement.requestFullscreen();
            mediaElement.addEventListener('fullscreenchange', handleFullScreenChange);
            setIsFullScreen(true);
          }
        },
      }));
      return (
        <div
          style={style}
          className={`fcr-track-player ${className}`}
          ref={playerContainerRef}></div>
      );
    },
  ),
);
export const RemoteTrackPlayerWithFullScreen: FC<RemoteTrackPlayerProps & { placment?: 'top' }> =
  observer((props) => {
    const playerRef = useRef<{ fullScreen: () => void }>(null);
    return (
      <div className="fcr-track-player-fullscreen">
        <RemoteTrackPlayer {...props} ref={playerRef}></RemoteTrackPlayer>
        <div
          className={`fcr-track-player-fullscreen-cover ${
            props.placment === 'top' ? 'fcr-track-player-fullscreen-cover-top' : ''
          }`}>
          <SvgImg
            className={'fcr-track-player-fullscreen-btn'}
            type={SvgIconEnum.VIDEO_FULLSCREEN}
            size={26}
            onClick={() => {
              playerRef.current?.fullScreen();
            }}></SvgImg>
        </div>
      </div>
    );
  });
