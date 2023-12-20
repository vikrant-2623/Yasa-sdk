import { observer } from 'mobx-react';
import { useState } from 'react';
import { useStore } from '@proctor/infra/hooks/ui-store';
import { Button, Modal } from '@proctor/ui-kit';
import { BaseDialogProps } from '.';
import { useI18n } from 'agora-common-libs';

export const Quit: React.FC<
  BaseDialogProps & { onOk: (back: boolean) => void; showOption: boolean }
> = observer(({ id, onOk, showOption }) => {
  const { shareUIStore } = useStore();
  const t = useI18n();
  const { removeDialog } = shareUIStore;

  const [type, setType] = useState<'back' | 'quit'>(showOption ? 'back' : 'quit');

  return (
    <Modal
      style={{ width: 300 }}
      title={t('toast.leave_room')}
      onOk={() => {
        onOk(type === 'back');
        removeDialog(id);
      }}
      onCancel={() => {
        removeDialog(id);
      }}
      footer={[
        <Button key="cancel" type={'secondary'} action="cancel">
          {t('toast.cancel')}
        </Button>,
        <Button key="ok" type={'primary'} action="ok">
          {t('fcr_room_button_leave_confirm')}
        </Button>,
      ]}>
      {showOption ? (
        <div className="radio-container">
          <label className="customize-radio">
            <input
              type="radio"
              name="kickType"
              value="back"
              checked={type === 'back'}
              onChange={() => setType('back')}
            />
            <span className="ml-2">{t('fcr_group_back_to_main_room')}</span>
          </label>
          <label className="customize-radio">
            <input type="radio" name="kickType" value="quit" onChange={() => setType('quit')} />
            <span className="ml-2">{t('fcr_group_exit_room')}</span>
          </label>
        </div>
      ) : (
        t('toast.quit_room')
      )}
    </Modal>
  );
});
