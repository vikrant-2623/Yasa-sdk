import classnames from 'classnames';
import { Layout } from '@classroom/ui-kit/components/layout';
import { DialogContainer } from '@classroom/infra/capabilities/containers/dialog';
import { HandsUpContainer } from '@classroom/infra/capabilities/containers/hand-up';
import { LoadingContainer } from '@classroom/infra/capabilities/containers/loading';
import { NavigationBar } from '@classroom/infra/capabilities/containers/nav';
import { FixedAspectRatioRootBox } from '@classroom/infra/capabilities/containers/root-box';
import { SceneSwitch } from '@classroom/infra/capabilities/containers/scene-switch';
import { RoomMidStreamsContainer } from '@classroom/infra/capabilities/containers/stream/room-mid-player';
import { ToastContainer } from '@classroom/infra/capabilities/containers/toast';
import { Award } from '../../containers/award';
import Room from '../room';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { Float } from '@classroom/ui-kit';
import { RemoteControlContainer } from '../../containers/remote-control';
import { ScreenShareContainer } from '../../containers/screen-share';
import { WhiteboardToolbar } from '../../containers/toolbar';
import { WidgetContainer } from '../../containers/widget';
import { Chat, Watermark, Whiteboard } from '../../containers/widget/slots';
import { StreamWindowsContainer } from '../../containers/stream-window';
import { RemoteControlToolbar } from '../../containers/remote-control/toolbar';
import CameraPreview from '../../containers/camera-preview';
import { NavBottomController } from '../../containers/nav-bottom';
import { PenSliderContoller } from '../../containers/pen-slider';
import { useI18n } from 'agora-common-libs';
import { SvgIconEnum } from '@classroom/ui-kit';
import { CustomChat2 } from '../../containers/widget/CustomChat';

export type PensContainerProps = {
  onClick: (pen: string) => void;
};

export const MidClassScenario = () => {
  // layout
  const layoutCls = classnames('edu-room', 'mid-class-room');
  const { shareUIStore } = useStore();
  const { toolbarUIStore } = useStore();
  const t = useI18n();
  const {
    setTool,
    selectedPenTool,
    isPenToolActive,
    currentColor,
    strokeWidth,
    changeStroke,
    changeHexColor,
    defaultPens,
    defaultColors,
    paletteMap,
  } = toolbarUIStore;




  const mapLineSelectorToLabel: Record<string, string> = {
    pen: 'scaffold.pencil',
    square: 'scaffold.rectangle',
    circle: 'scaffold.circle',
    line: 'scaffold.straight',
    arrow: 'scaffold.arrow',
    pentagram: 'scaffold.pentagram',
    rhombus: 'scaffold.rhombus',
    triangle: 'scaffold.triangle',
  };

  return (
    <Room>
      <FixedAspectRatioRootBox trackMargin={{ top: shareUIStore.navHeight }}>
        <SceneSwitch>
          <Layout className={layoutCls} direction="col">

            <Layout
              className="flex-grow items-stretch relative justify-center fcr-room-bg"
              direction="col">
              <RoomMidStreamsContainer />
              <Whiteboard />
              <ScreenShareContainer />
              <RemoteControlContainer />
              <StreamWindowsContainer />
            </Layout>
            <RemoteControlToolbar />
            <NavigationBar />
            {/* <WhiteboardToolbar /> */}
            {/* <ScenesController /> */}
           
            <NavBottomController />
            <PenSliderContoller
              pens={defaultPens}
              colors={defaultColors}
              paletteMap={paletteMap}
              value="pen"
              label={selectedPenTool ? t(mapLineSelectorToLabel[selectedPenTool]) : ''}
              icon={SvgIconEnum.PEN_CURVE}
              activePen={selectedPenTool}
              onClick={setTool}
              isActive={isPenToolActive}
              colorSliderMin={1}
              colorSliderMax={5}
              strokeWidthValue={strokeWidth}
              colorSliderStep={1}
              onSliderChange={changeStroke}
              activeColor={currentColor}
              onColorClick={(value) => {
                changeHexColor(value);
              }}
            />
            <Float bottom={15} right={10} align="flex-end" gap={2}>
              {/* <HandsUpContainer /> */}
              {/* <Chat /> */}
              <CustomChat2 />
            </Float>
            <DialogContainer />
            <LoadingContainer />
          </Layout>
          <WidgetContainer />
          <ToastContainer />
          <Award />
          <CameraPreview />
          <Watermark />
        </SceneSwitch>
      </FixedAspectRatioRootBox>
    </Room>
  );
};
