import { AgoraEduClassroomEvent, ClassroomState, EduEventCenter } from 'agora-edu-core';
import { action, computed, observable, runInAction } from 'mobx';
import { EduUIStoreBase } from '../base';
import uuidv4 from 'uuid';
import { bound } from 'agora-rte-sdk';
import { iterateMap } from 'agora-edu-core';
import { transI18n } from 'agora-common-libs';
export class LayoutUIStore extends EduUIStoreBase {
  @observable currentTab = 'ALL_VIDEOS';

  @observable
  awardAnims: { id: string }[] = [];

  @observable
  studentTabItemsMap: Map<string, { label: string; key: string }> = new Map();

  @computed
  get isInSubRoom() {
    return !!this.classroomStore.groupStore.currentSubRoom;
  }

  @computed
  get studentTabItems() {
    const { list } = iterateMap(this.studentTabItemsMap, {
      onMap: (_key, item) => item,
    });
    return list;
  }

  @computed
  get loadingText() {
    if (this.classroomStore.remoteControlStore.remoteControlRequesting) {
      const studentName = this.classroomStore.remoteControlStore.currentStudent?.userName;
      return transI18n('fcr_share_reminded_student_agree', {
        reason1: studentName,
        reason2: studentName,
      });
    }
    return '';
  }

  /**
   * 所在房间名称
   */
  @computed
  get currentSubRoomName() {
    let groupName = null;
    const { currentSubRoom, groupDetails } = this.classroomStore.groupStore;
    if (currentSubRoom) {
      const group = groupDetails.get(currentSubRoom);

      groupName = group?.groupName;
    }
    return groupName;
  }

  onInstall(): void {
    EduEventCenter.shared.onClassroomEvents(this._handleClassroomEvents);
  }

  @bound
  private _handleClassroomEvents(event: AgoraEduClassroomEvent) {
    if (event === AgoraEduClassroomEvent.BatchRewardReceived) {
      runInAction(() => {
        this.awardAnims.push({
          id: uuidv4(),
        });
      });
    }
  }
  @action.bound
  setCurrentTab = (key: string) => {
    this.currentTab = key;
  };
  @action.bound
  addStudentTab = (userUuidPrefix: string, userName: string) => {
    if (!this.studentTabItemsMap.has(userUuidPrefix)) {
      this.studentTabItemsMap.set(userUuidPrefix, {
        label: userName,
        key: userUuidPrefix,
      });
    }
    this.setCurrentTab(userUuidPrefix);
  };
  @action.bound
  removeStudentTab = (userUuidPrefix: string) => {
    if (!this.studentTabItemsMap.has(userUuidPrefix)) return;
    this.studentTabItemsMap.delete(userUuidPrefix);
    this.setCurrentTab(
      this.studentTabItems.length > 0
        ? this.studentTabItems[this.studentTabItems.length - 1].key
        : 'ALL_VIDEOS',
    );
  };

  @action.bound
  removeAward(id: string) {
    this.awardAnims = this.awardAnims.filter((anim) => anim.id !== id);
  }

  /**
   * 教室加载状态
   */
  @computed get loading(): boolean {
    const classroomState = this.classroomStore.connectionStore.classroomState;
    const remoteControlRequesting = this.classroomStore.remoteControlStore.remoteControlRequesting;
    return (
      classroomState === ClassroomState.Connecting ||
      classroomState === ClassroomState.Reconnecting ||
      remoteControlRequesting
    );
  }

  onDestroy(): void {
    EduEventCenter.shared.offClassroomEvents(this._handleClassroomEvents);
  }
}
