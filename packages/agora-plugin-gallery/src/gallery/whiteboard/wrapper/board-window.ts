import {
  FcrBoardH5WindowConfig,
  FcrBoardMaterialWindowConfig,
  FcrBoardMediaWindowConfig,
  FcrBoardShape,
  FcrBoardTool,
} from 'agora-classroom-sdk';
import SlideApp from '@netless/app-slide';
import Talkative from '@netless/app-talkative';
import { snapshot } from '@netless/white-snapshot';
import { BuiltinApps, WindowManager, WindowMangerAttributes } from '@netless/window-manager';
import '@netless/window-manager/dist/style.css';
import { AGEventEmitter, bound, Log, Logger } from 'agora-rte-sdk';
import { ApplianceNames, MemberState, Room, ShapeType } from 'white-web-sdk';
import {
  convertToNetlessBoardShape,
  convertToNetlessBoardTool,
  defaultStrokeColor,
  defaultTextSize,
  src2DataURL,
} from './helper';
import {
  BoardState,
  Color,
  FcrBoardMainWindowEvent,
  FcrBoardMainWindowEventEmitter,
  FcrBoardMainWindowFailureReason,
  FcrBoardPage,
  FcrBoardPageInfo,
  FcrBoardWindowOptions,
  MountOptions,
} from './type';
import { fetchImageInfoByUrl, mergeCanvasImage } from './utils';
import { DialogProgressApi } from '../../../components/progress';

@Log.attach()
export class FcrBoardMainWindow implements FcrBoardMainWindowEventEmitter {
  logger!: Logger;
  private _whiteRoom: Room;
  private _hasOperationPrivilege = false;
  private _currentScenePath = '/';
  private _whiteView?: HTMLElement;
  private _windowManager?: WindowManager;
  private _localState: Partial<BoardState> = {
    textSize: defaultTextSize,
    strokeColor: defaultStrokeColor,
  };
  private _eventBus: AGEventEmitter = new AGEventEmitter();
  private _destroyed = false;

  constructor(room: Room, hasOperationPrivilege: boolean, private _options: FcrBoardWindowOptions) {
    this._whiteRoom = room;
    this._hasOperationPrivilege = hasOperationPrivilege;
    this._installPlugins();
  }

  private _installPlugins() {
    const {
      minFPS,
      maxFPS,
      resolution,
      autoResolution,
      autoFPS,
      maxResolutionLevel,
      forceCanvas,
      debug,
    } = this._options;
    WindowManager.register({
      kind: 'Slide',
      src: SlideApp,
      appOptions: {
        debug,
        minFPS,
        maxFPS,
        resolution,
        autoResolution,
        autoFPS,
        maxResolutionLevel,
        forceCanvas,
      },
    });

    WindowManager.register({
      kind: 'Talkative',
      src: Talkative,
      appOptions: {
        debug,
      },
    });
  }

  async mount(view: HTMLElement, options: MountOptions) {
    this._whiteView = view;
    this.preCheck({ wm: false });
    if (this._whiteRoom) {
      await WindowManager.mount({
        room: this._whiteRoom,
        container: view,
        cursor: true,
        chessboard: false,
        collectorContainer: options.collectorContainer,
        containerSizeRatio: options.containerSizeRatio,
      })
        .then(async (wm) => {
          if (this._destroyed) {
            wm.destroy();
            return;
          }
          //@ts-ignore
          window._wm = wm;
          this._windowManager = wm;
          this._windowManager.mainView.disableCameraTransform = true;
          this._addWindowManagerEventListeners();
          this._eventBus.emit(FcrBoardMainWindowEvent.MountSuccess, wm);
        })
        .catch((e) => {
          this._eventBus.emit(
            FcrBoardMainWindowEvent.Failure,
            FcrBoardMainWindowFailureReason.MountFailure,
            e,
          );
        });
    }
  }

  @Log.silence
  private preCheck(options: { privilege?: boolean; wm?: boolean } = {}) {
    const { privilege = true, wm = true } = options;
    if (this._destroyed) {
      throw Error('The WindowManger instance has been destoryed, cannot operate on it');
    }
    if (privilege && !this._hasOperationPrivilege) {
      this.logger.warn('Try to operate on board window without operation privilege');
    }
    if (wm && !this._windowManager) {
      this.logger.warn('Try to operate on board window when board window not mounted');
    }
  }

  @bound
  async addPage(options: { after: boolean }) {
    this.preCheck();
    if (this._windowManager) {
      await this._windowManager.addPage(options);
      await this._windowManager.nextPage();
    }
  }

  @bound
  removePage() {
    this.preCheck();
    if (this._windowManager) {
      this._windowManager.removePage();
    }
  }

  @bound
  setPageIndex(index: number) {
    this.preCheck({ wm: false });

    const windowManager = this._windowManager;

    if (windowManager) {
      if (index > 0) {
        windowManager.nextPage();
      } else if (index < 0) {
        windowManager.prevPage();
      }
    }
  }

  @bound
  undo() {
    this.preCheck({ wm: false });
    this._whiteRoom.undo();
  }

  @bound
  redo() {
    this.preCheck({ wm: false });
    this._whiteRoom.redo();
  }

  @bound
  clean(retainPpt?: boolean) {
    this.preCheck({ wm: false });
    this._whiteRoom.cleanCurrentScene(retainPpt);
  }

  @bound
  async putImageResource(
    resourceUrl: string,
    options?: { x: number; y: number; width: number; height: number },
  ) {
    this.preCheck();

    const room = this._whiteRoom;
    const windowManager = this._windowManager;

    if (windowManager) {
      let originX = 0;
      let originY = 0;

      if (this._whiteView) {
        originX = this._whiteView.clientWidth / 2;
        originY = this._whiteView.clientHeight / 2;
      }

      const { x, y } = windowManager.mainView.convertToPointInWorld({
        x: options?.x ?? originX,
        y: options?.y ?? originY,
      });

      const containerSize = {
        width: this._whiteView?.clientWidth ?? window.innerWidth,
        height: this._whiteView?.clientHeight ?? window.innerHeight,
      };

      const { uuid, width, height } = await fetchImageInfoByUrl(resourceUrl, containerSize);

      const imageInfo = {
        uuid: uuid,
        centerX: x,
        centerY: y,
        width: options?.width ?? width,
        height: options?.height ?? height,
        locked: false,
      };

      windowManager.switchMainViewToWriter();
      room.insertImage(imageInfo);
      room.completeImageUpload(uuid, resourceUrl);
    }
  }

  @bound
  putImageResourceIntoWindow() {
    this.preCheck();
  }

  @bound
  createMaterialResourceWindow(config: FcrBoardMaterialWindowConfig<FcrBoardPage>) {
    this.preCheck();

    if (!this._checkRepeatWindow(config.title)) {
      return;
    }

    const windowManager = this._windowManager;
    const scenePath = `/${config.resourceUuid}`;
    if (config.resourceHasAnimation) {
      windowManager?.addApp({
        kind: 'Slide',
        options: {
          scenePath: `/ppt${scenePath}`,
          title: config.title,
        },
        attributes: {
          taskId: config.taskUuid,
          url: config.urlPrefix,
        },
      });
    } else {
      windowManager?.addApp({
        kind: BuiltinApps.DocsViewer,
        options: {
          scenePath,
          title: config.title,
          scenes: this._convertToScenes(config.pageList),
        },
      });
    }
  }

  @bound
  createMediaResourceWindow(config: FcrBoardMediaWindowConfig) {
    this.preCheck();

    if (!this._checkRepeatWindow(config.title)) {
      return;
    }

    const windowManager = this._windowManager;

    windowManager?.addApp({
      kind: BuiltinApps.MediaPlayer,
      options: {
        title: config.title, // 可选
      },
      attributes: {
        src: config.resourceUrl, // 音视频 url
        type: config.mimeType,
      },
    });
  }

  @bound
  createH5Window(config: FcrBoardH5WindowConfig) {
    this.preCheck();

    if (!this._checkRepeatWindow(config.title)) {
      return;
    }

    const windowManager = this._windowManager;

    windowManager?.addApp({
      kind: 'Talkative',
      options: {
        title: config.title,
      },
      attributes: {
        src: config.resourceUrl,
      },
    });
  }

  private _checkRepeatWindow(title: string) {
    const curResources = Object.values(this._windowManager?.apps || []);
    const opened = curResources.find(({ options }) => options?.title === title);
    if (opened) {
      this._eventBus.emit(
        FcrBoardMainWindowEvent.Failure,
        FcrBoardMainWindowFailureReason.ResourceWindowAlreadyOpened,
      );
      return false;
    }

    return true;
  }

  @bound
  selectTool(type: FcrBoardTool) {
    this.preCheck();
    this._localState.tool = type;
    const tool = convertToNetlessBoardTool(type);
    this._whiteRoom.setMemberState({
      currentApplianceName: tool,
    });
  }

  @bound
  drawShape(type: FcrBoardShape, lineWidth: number, color: Color) {
    this.preCheck();
    this._localState.shape = type;
    this._localState.strokeWidth = lineWidth;
    this._localState.strokeColor = color;
    if (type === FcrBoardShape.Curve) {
      this._whiteRoom.setMemberState({
        currentApplianceName: ApplianceNames.pencil,
        strokeWidth: lineWidth,
        strokeColor: [color.r, color.g, color.b],
      });
    } else {
      const [tool, shape] = convertToNetlessBoardShape(type);
      this._whiteRoom.setMemberState({
        currentApplianceName: tool as ApplianceNames,
        strokeWidth: lineWidth,
        strokeColor: [color.r, color.g, color.b],
        shapeType: shape as ShapeType,
      });
    }
  }

  async updateOperationPrivilege(hasOperationPrivilege: boolean) {
    this._hasOperationPrivilege = hasOperationPrivilege;
    await this._setBoardWritable(hasOperationPrivilege);
  }

  @bound
  async changeStrokeWidth(strokeWidth: number) {
    this.preCheck();
    this._whiteRoom.setMemberState({
      strokeWidth,
    });
  }

  @bound
  async changeStrokeColor(color: { r: number; g: number; b: number }) {
    this.preCheck();
    this._whiteRoom.setMemberState({
      strokeColor: [color.r, color.g, color.b],
    });
  }

  getAttributes() {
    const windowManager = this._windowManager;
    return windowManager?.appManager?.attributes;
  }

  setAttributes(attributes: WindowMangerAttributes) {
    this.preCheck();
    const windowManager = this._windowManager;
    windowManager?.safeSetAttributes(attributes);
    windowManager?.refresh();
  }

  @bound
  setTimeDelay(delay: number) {
    this._whiteRoom.timeDelay = delay;
  }

  @bound
  async getSnapshotImage(background = '#fff') {
    this.preCheck({ wm: false });
    const whiteRoom = this._whiteRoom;

    if (whiteRoom) {
      const sceneMap = whiteRoom.entireScenes();

      const scenes = Object.keys(sceneMap);
      if (scenes.length) {
        const _room = Object.create(whiteRoom);
        _room.state.cameraState = { width: 2038, height: 940 }; // 创建一个宽高

        const cps = sceneMap['/'].map((scene) => {
          return () =>
            snapshot(_room, {
              scenePath: '/' + scene.name,
              crossorigin: true,
              background,
              src2dataurl: src2DataURL,
            });
        });

        DialogProgressApi.show({ key: 'saveImage', progress: 1, width: 100, auto: true });

        try {
          const merged = await mergeCanvasImage(cps);

          this._eventBus.emit(FcrBoardMainWindowEvent.SnapshotSuccess, merged);
        } catch (e) {
          this.logger.error(e);
          this._eventBus.emit(
            FcrBoardMainWindowEvent.Failure,
            FcrBoardMainWindowFailureReason.SnapshotFailure,
          );
        }

        DialogProgressApi.destroy('saveImage');
      }
    }
  }

  emitPageInfo() {
    const windowManager = this._windowManager;

    const state = {
      showIndex: windowManager?.mainViewSceneIndex || 0,
      count: windowManager?.mainViewScenesLength || 0,
    };

    this._eventBus.emit(FcrBoardMainWindowEvent.PageInfoUpdated, state);
  }

  private _addWindowManagerEventListeners() {
    const windowManager = this._windowManager;

    windowManager?.emitter.on('mainViewSceneIndexChange', (showIndex) => {
      this.emitPageInfo();
    });
    windowManager?.emitter.on('mainViewScenesLengthChange', (count) => {
      this.emitPageInfo();
    });
    windowManager?.emitter.on('canUndoStepsChange', (steps) => {
      this._eventBus.emit(FcrBoardMainWindowEvent.UndoStepsUpdated, steps);
    });
    windowManager?.emitter.on('canRedoStepsChange', (steps) => {
      this._eventBus.emit(FcrBoardMainWindowEvent.RedoStepsUpdated, steps);
    });
  }

  setAspectRatio(ratio: number) {
    this.preCheck({ privilege: false });

    this._windowManager?.setContainerSizeRatio(ratio);
  }

  private _convertToScenes(pageList: FcrBoardPage[]) {
    return pageList.map((page) => ({
      name: page.name,
      ppt: {
        src: page.contentUrl,
        width: page.contentWidth,
        height: page.contentHeight,
        previewURL: page.previewUrl,
      },
    }));
  }

  private async _syncLocalStateToMemberState() {
    this.preCheck();
    const { tool, shape, strokeColor, strokeWidth, textSize } = this._localState;
    const room = this._whiteRoom;

    const nextState: Partial<MemberState> = {
      textSize,
      strokeWidth,
    };

    if (strokeColor) {
      nextState.strokeColor = [strokeColor.r, strokeColor.g, strokeColor.b];
    }

    if (tool) {
      const currentApplianceName = convertToNetlessBoardTool(tool);
      nextState.currentApplianceName = currentApplianceName;
    }

    if (shape) {
      const shapeTool = convertToNetlessBoardShape(shape);
      nextState.currentApplianceName = shapeTool[0] as ApplianceNames;
      nextState.shapeType = shapeTool[1] as ShapeType;
    }

    room.setMemberState(nextState);
  }

  private async _setBoardWritable(granted: boolean) {
    const room = this._whiteRoom;
    if (granted && !room.isWritable) {
      await room.setWritable(true);
      room.disableDeviceInputs = false;
      room.disableSerialization = false;
    }

    if (!granted && room.isWritable) {
      room.disableDeviceInputs = true;
      room.disableSerialization = true;
      await room.setWritable(false);
    }
  }

  on(
    eventName: FcrBoardMainWindowEvent.MountSuccess,
    cb: (windowManager: WindowManager) => void,
  ): void;
  on(
    eventName: FcrBoardMainWindowEvent.PageInfoUpdated,
    cb: (pageInfo: FcrBoardPageInfo) => void,
  ): void;
  on(eventName: FcrBoardMainWindowEvent.RedoStepsUpdated, cb: (steps: number) => void): void;
  on(eventName: FcrBoardMainWindowEvent.UndoStepsUpdated, cb: (steps: number) => void): void;
  on(eventName: FcrBoardMainWindowEvent.Unmount, cb: () => void): void;
  on(
    eventName: FcrBoardMainWindowEvent.SnapshotSuccess,
    cb: (canvas: HTMLCanvasElement) => void,
  ): void;
  on(
    eventName: FcrBoardMainWindowEvent.Failure,
    cb: (reason: FcrBoardMainWindowFailureReason) => void,
  ): void;
  @Log.silence
  on(eventName: FcrBoardMainWindowEvent, cb: CallableFunction): void {
    this._eventBus.on(eventName, cb);
  }
  @Log.silence
  off(eventName: FcrBoardMainWindowEvent, cb: CallableFunction): void {
    this._eventBus.off(eventName, cb);
  }

  destroy() {
    if (this._windowManager) {
      this._windowManager.destroy();
      this._windowManager = undefined;
      this._eventBus.emit(FcrBoardMainWindowEvent.Unmount);
    }
    this._destroyed = true;
  }
}
