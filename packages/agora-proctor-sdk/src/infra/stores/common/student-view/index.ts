import { ClassState, LeaveReason } from 'agora-edu-core';
import { bound, Log } from 'agora-rte-sdk';
import {
  action,
  computed,
  IReactionDisposer,
  Lambda,
  observable,
  reaction,
  runInAction,
  when,
} from 'mobx';
import { EduUIStoreBase } from '../base';

@Log.attach({ proxyMethods: false })
export class StudentViewUIStore extends EduUIStoreBase {
  private _disposers: (IReactionDisposer | Lambda)[] = [];

  @observable
  widgetBlur = false;

  @observable
  counterOpening = false;

  @action.bound
  setCounterOpening(open: boolean) {
    this.counterOpening = open;
  }

  /**
   * 学生头像地址
   */
  @computed
  get userAvatar() {
    return typeof this.classroomStore.userStore.localUser?.userProperties === 'undefined'
      ? ''
      : this.classroomStore.userStore.localUser?.userProperties.get('flexProps')?.avatar;
  }

  @computed
  get classRoomState() {
    return this.classroomStore.roomStore.classroomSchedule.state;
  }
  @computed
  get beforeClass() {
    return this.classRoomState === ClassState.beforeClass;
  }

  @bound
  async leaveMainClassroom() {
    await this.classroomStore.connectionStore.leaveClassroom(LeaveReason.leave);
  }
  onInstall() {
    this._disposers.push(
      reaction(
        () => this.classRoomState,
        (state) => {
          if (state === ClassState.beforeClass) {
            runInAction(() => {
              this.widgetBlur = true;
            });
          } else {
            runInAction(() => {
              this.widgetBlur = false;
            });
          }
        },
      ),
    );

    // class is end
    this._disposers.push(
      reaction(
        () => this.classroomStore.roomStore.classroomSchedule.state,
        (state) => {
          if (ClassState.beforeClass === state) {
            runInAction(() => {
              this.widgetBlur = true;
            });
          } else {
            runInAction(() => {
              this.widgetBlur = false;
            });
          }
        },
      ),
    );
  }

  onDestroy() {
    this._disposers.forEach((d) => d());
  }
}
