import { FC } from 'react';
import { observer } from 'mobx-react';
import { useStore } from '@classroom/infra/hooks/ui-store';
import { Toolbar, ToolProps, Tool, Card, Roster } from '@classroom/ui-kit';
import { PensContainer } from './pens';
import { ToolCabinetContainer } from './tool-cabinet';
import { BoardCleanersContainer } from './board-cleaners';
import { SliceContainer } from './slice';
import {
  visibilityControl,
  visibilityListItemControl,
  boardEraserEnabled,
  boardHandEnabled,
  boardMouseEnabled,
  boardPencilEnabled,
  boardSaveEnabled,
  boardSelectorEnabled,
  boardTextEnabled,
  cloudStorageEnabled,
  rosterEnabled,
  toolbarEnabled,
} from 'agora-common-libs';
import { ToolbarItemCategory } from '@classroom/infra/stores/common/toolbar/type';

export const ToolBottomController = visibilityControl(
  observer(() => {
    const {
      toolbarUIStore,
      streamWindowUIStore: { containedStreamWindowCoverOpacity },
      boardUIStore,
    } = useStore();
    const { activeTool, activeMap, tools, setTool } = toolbarUIStore;

    const mappedTools = tools.map((tool) => {
      console.log(tool, 'tool12')
      if (tool.category === ToolbarItemCategory.PenPicker) {
        return {
          ...tool,
          component: () => {
            return <PensContainer />;
          },
        };
      }
       else if (tool.category === ToolbarItemCategory.Cabinet) {
        return {
          ...tool,
          component: () => {
            // return null;
            return <ToolCabinetContainer />;
          },
        };
      } 
      else if (tool.category === ToolbarItemCategory.Eraser) {
        return {
          ...tool,
          component: () => {
            return <BoardCleanersContainer />;
          },
        };
      } 
      else if (tool.category === ToolbarItemCategory.Slice) {
        return {
          ...tool,
          component: () => {
            return <SliceContainer />;
          },
        };
      }
      return tool;
    });

    return mappedTools.length > 0 ? (
      <div
        // className="absolute bottom-0 overflow-hidden tool-container" 
        className="overflow-hidden tool-container"
       >
        <Toolbar
          style={{ opacity: containedStreamWindowCoverOpacity, pointerEvents: 'all' }}
          defaultOpened={true}>
          {mappedTools.map((item) => {
            console.log(item, 'item')
            const isActive = activeTool === item.value || activeMap[item.value];
            return (
              <ToolItem
                key={item.value}
                {...(item as ToolProps)}
                onClick={setTool}
                isActive={isActive}
                category={item.category}
              />
            );
          })}
        </Toolbar>
      </div>
    ) : <p>hiiiii</p>;
  }),
  toolbarEnabled,
);

const ToolItem: FC<
  ToolProps & {
    onClick?: (value: string) => void;
    isActive: boolean;
    category: ToolbarItemCategory;
  }
> = visibilityListItemControl(
  (props) => {
    return <Tool {...props} />;
  },
  (uiConfig, item) => {
    console.log(uiConfig, 'uiConfig');
    console.log(!boardEraserEnabled(uiConfig) && item.category === ToolbarItemCategory.Eraser, '!boardEraserEnabled(uiConfig) && item.category === ToolbarItemCategory.Eraser')
    if (!boardEraserEnabled(uiConfig) && item.category === ToolbarItemCategory.Eraser) {
      return false;
    }
    if (!boardHandEnabled(uiConfig) && item.category === ToolbarItemCategory.Hand) {
      return false;
    }
    if (!boardMouseEnabled(uiConfig) && item.category === ToolbarItemCategory.Clicker) {
      return false;
    }
    if (!boardPencilEnabled(uiConfig) && item.category === ToolbarItemCategory.PenPicker) {
      return false;
    }
    if (!boardSaveEnabled(uiConfig) && item.category === ToolbarItemCategory.Save) {
      return false;
    }
    if (!boardSelectorEnabled(uiConfig) && item.category === ToolbarItemCategory.Selector) {
      return false;
    }
    if (!boardTextEnabled(uiConfig) && item.category === ToolbarItemCategory.Text) {
      return false;
    }
    if (!cloudStorageEnabled(uiConfig) && item.category === ToolbarItemCategory.CloudStorage) {
      return false;
    }
    if (!rosterEnabled(uiConfig) && item.category === ToolbarItemCategory.Roster) {
      return false;
    }

    return true;
  },
);
