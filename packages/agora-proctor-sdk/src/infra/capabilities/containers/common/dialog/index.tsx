import { useStore } from '@proctor/infra/hooks/ui-store';
import { DialogCategory } from '@proctor/infra/stores/common/share-ui';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import { ReactNode } from 'react';
import { Confirm } from './confirm';
import { GenericErrorDialog } from './error-generic';
import { KickOut } from './kick-out';
import { Quit } from './quit';

const getDialog = (category: DialogCategory, id: string, props?: any): ReactNode => {
  switch (category) {
    case DialogCategory.KickOut:
      return <KickOut {...props} id={id} />;
    case DialogCategory.ErrorGeneric:
      // props should come after id so that props can override id
      return <GenericErrorDialog id={id} {...props} />;
    case DialogCategory.Confirm:
      return <Confirm {...props} id={id} />;
    case DialogCategory.ScreenPicker:
    // return <ScreenPickerDialog {...props} id={id} />;
    case DialogCategory.Quit:
      return <Quit {...props} id={id} />;
  }
};

export type BaseDialogProps = {
  id: string;
};

export const DialogContainer: React.FC<unknown> = observer(() => {
  const { shareUIStore } = useStore();
  const { dialogQueue } = shareUIStore;

  const cls = classnames({
    [`rc-mask`]: !!dialogQueue.length,
  });

  return (
    <div className={cls}>
      {dialogQueue.map(({ id, category, props }) => {
        return (
          <div key={id} className="fixed-container">
            {getDialog(category, id, props)}
          </div>
        );
      })}
    </div>
  );
});
