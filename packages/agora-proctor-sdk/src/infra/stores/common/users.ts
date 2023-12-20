import { DeviceTypeEnum } from '@proctor/infra/api';
import { EduClassroomConfig, EduUserStruct } from 'agora-edu-core';
import { bound } from 'agora-rte-sdk';
import md5 from 'js-md5';
import { action, computed, observable } from 'mobx';
import { computedFn } from 'mobx-utils';
import { EduUIStoreBase } from './base';
import { StudentFilterTag, VideosWallLayoutEnum } from './type';
/**
 * 处理监考用户相关逻辑（视频墙，用户id，用户tag更新等）
 */
export class UsersUIStore extends EduUIStoreBase {
  //监考视频墙布局（每一屏的视频个数）
  @observable videosWallLayout: VideosWallLayoutEnum = VideosWallLayoutEnum.Compact;
  //当前视频墙页码
  @observable currentPageIndex = 0;
  //视频墙筛选条件
  @observable filterTag: StudentFilterTag = StudentFilterTag.All;
  //视频墙总页数
  @computed
  get totalPage() {
    return Math.ceil(this.studentListByUserUuidPrefix(this.filterTag).size / this.videosWallLayout);
  }
  /**
   * 分页后的学生列表
   */
  @computed get studentListByPage() {
    return Array.from(this.studentListByUserUuidPrefix(this.filterTag).entries()).reduce(
      (prev, cur, index) => {
        const [userUuidPrefix] = cur;
        if (index % this.videosWallLayout === 0) {
          prev.push([userUuidPrefix]);
        } else {
          prev[Math.floor(index / this.videosWallLayout)].push(userUuidPrefix);
        }
        return prev;
      },
      [] as string[][],
    );
  }
  /**
   * 根据用户useruuid前缀过滤用户
   */
  studentListByUserUuidPrefix = computedFn((filterTag: StudentFilterTag) => {
    const studentList: Map<string, string> = new Map();
    this.studentWithGroup(filterTag).forEach((groupUuid, userUuid) => {
      const userUuidPrefix = userUuid.split('-')[0];
      if (!studentList.get(userUuidPrefix)) {
        studentList.set(userUuidPrefix, groupUuid);
      }
    });
    return studentList;
  });
  //过滤在分组中的用户
  studentWithGroup = computedFn((filterTag: StudentFilterTag) => {
    const studentList: Map<string, string> = new Map();

    this.studentsFilterByTag(filterTag).forEach((user, userUuid) => {
      this.classroomStore.groupStore.groupDetails.forEach((group, groupUuid) => {
        if (!!group.users.find((user) => user.userUuid === userUuid))
          studentList.set(userUuid, groupUuid);
      });
    });

    return studentList;
  });
  //根据标签过滤用户
  studentsFilterByTag = computedFn((filterTag: StudentFilterTag) => {
    switch (filterTag) {
      case StudentFilterTag.All: {
        return this.classroomStore.userStore.studentList;
      }
      case StudentFilterTag.Focus: {
        const studentList: Map<string, EduUserStruct> = new Map();

        this.classroomStore.userStore.studentList.forEach((user) => {
          if (user.userProperties?.get('tags')?.focus === 1) {
            studentList.set(user.userUuid, user);
          }
        });
        return studentList;
      }
      case StudentFilterTag.Abnormal: {
        const studentList: Map<string, EduUserStruct> = new Map();

        this.classroomStore.userStore.studentList.forEach((user) => {
          if (!!user.userProperties?.get('tags')?.abnormal) {
            studentList.set(user.userUuid, user);
          }
        });
        return studentList;
      }
      default: {
        return this.classroomStore.userStore.studentList;
      }
    }
  });
  @computed get currentUserCount() {
    return (
      this.currentPageIndex * this.videosWallLayout +
      (this.studentListByPage[this.currentPageIndex]?.length || 0)
    );
  }

  @action.bound
  setVideosWallLayout(layout: VideosWallLayoutEnum) {
    this.videosWallLayout = layout;
  }
  @action.bound
  setFilterTag(filterTag: StudentFilterTag) {
    this.filterTag = filterTag;
  }
  /**
   * 更新用户tag
   * @param key
   * @param data
   * @param roomUuid
   * @param userUuid
   * @returns
   */
  @bound
  async updateUserTags(key: string, data: any, roomUuid: string, userUuid: string) {
    return this.classroomStore.api.updateUserTags({ roomUuid, userUuid, key, data });
  }
  /**
   * 查询用户事件
   * @param roomUuid
   * @param userUuid
   * @param cmd
   * @param causeDataFilterKeys
   * @param causeDataFilterValues
   * @returns
   */
  @bound
  async queryUserEvents(
    roomUuid: string,
    userUuid: string,
    cmd?: number,
    causeDataFilterKeys?: string,
    causeDataFilterValues?: string,
  ) {
    return this.classroomStore.api.getRoomEvents({
      roomUuid,
      userUuid,
      cmd,
      causeDataFilterKeys,
      causeDataFilterValues,
    });
  }
  @bound
  async queryRecordList(roomUuid: string, nextId?: number) {
    return this.classroomStore.api.getRecordList({ roomUuid, nextId });
  }
  /**
   * 生成当前用户的分组名称（学生使用）
   * @param userUuidPrefix
   * @returns
   */
  generateGroupUuid(userUuidPrefix: string) {
    const { roomUuid } = EduClassroomConfig.shared.sessionInfo;
    return md5(`${roomUuid}-${userUuidPrefix}`);
  }
  /**
   * 根据设备类型生成用户id
   * @param userUuidPrefix
   * @param deviceType
   * @returns
   */
  generateDeviceUuid(userUuidPrefix: string, deviceType: DeviceTypeEnum) {
    return `${userUuidPrefix}-${deviceType}`;
  }
  /**
   * 生成用户缩略姓名
   */
  generateShortUserName(name: string) {
    const names = name.split(' ');
    const [firstWord] = names;
    const lastWord = names[names.length - 1];
    const firstLetter = firstWord.split('')[0];
    const secondLetter =
      names.length > 1 ? lastWord.split('')[0] : lastWord.length > 1 ? lastWord.split('')[1] : '';
    return `${firstLetter}${secondLetter}`.toUpperCase();
  }
  onInstall() {}
  onDestroy() {}
}
