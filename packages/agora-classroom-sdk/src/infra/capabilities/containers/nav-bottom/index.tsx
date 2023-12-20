import React, { FC, useContext } from 'react';
import classNames from 'classnames';
import './index.css';
import { observer } from 'mobx-react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { InteractionStateColors } from '@classroom/ui-kit/utilities/state-color';

import { EduNavAction, EduNavRecordActionPayload } from '@classroom/infra/stores/common/nav';
import { NavigationBarAction } from '../nav';
import { EduClassroomConfig, RecordStatus, EduRoleTypeEnum } from 'agora-edu-core';
import RecordLoading from './assets/svga/record-loading.svga';
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
import { HandsUpContainer } from '../hand-up';

import { ScenesController } from '../scenes-controller';
import { ToolBottomController } from '../tool-bottom';

export const NavBottomController: FC = observer(() => {

	const NavigationBarRecordAction = observer(
		({ action }: { action: EduNavAction<EduNavRecordActionPayload> }) => {
			const { payload } = action;
			return payload ? (
				<div className="flex items-center">
					{payload.recordStatus === RecordStatus.started && (
						<i className="record-heartbeat animate-pulse"></i>
					)}
					{payload.text && <span className="record-tips">{payload.text}</span>}
					{payload.recordStatus === RecordStatus.starting ? (
						<SvgaPlayer className="record-icon" url={RecordLoading} width={18} height={18} loops />
					) : (<>
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
					</>)}
				</div>
			) : null;
		},
	);

	const Actions = observer(() => {
		const { navigationBottomBarUIStore } = useStore();
		const { actions } = navigationBottomBarUIStore;

		return (
			<React.Fragment>
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



	const {
		boardUIStore,
		classroomStore: {
			remoteControlStore: { isHost },
		},
		streamWindowUIStore: { containedStreamWindowCoverOpacity },
		toolbarUIStore: { setTool },
	} = useStore();

	const {
		isGrantedBoard,
		isTeacherOrAssistant,
		mounted,
	} = boardUIStore;


	// const ScheduleTime = visibilityControl(
	// 	observer(() => {
	// 		const { navigationBarUIStore } = useStore();
	// 		const { classStatusText, classStatusTextColor } = navigationBarUIStore;
	// 		return <Inline color={classStatusTextColor}>{classStatusText}</Inline>;
	// 	}),
	// 	scheduleTimeEnabled,
	// );

	return mounted && (isTeacherOrAssistant || isGrantedBoard) && !isHost ? (<>
		<div className='bottom-nav-wrap'>
			<div className="scenes-controller-btn-list">
				<Actions />
				{!isTeacherOrAssistant || EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student ? <HandsUpContainer /> : null}
			</div>
			<div className='bottom-tool-wrap'>
				<ToolBottomController />
			</div>
			<div className='scenes-tool-wrap'>
				<ScenesController />
			</div>
		</div>
	</>) :
		<div className='bottom-nav-wrap'>
			<div className="scenes-controller-btn-list">
				<Actions />
				{!isTeacherOrAssistant || EduClassroomConfig.shared.sessionInfo.role === EduRoleTypeEnum.student ? <HandsUpContainer /> : null}
			</div>;
		</div>
});
