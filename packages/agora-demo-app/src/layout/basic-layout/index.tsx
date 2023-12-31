import { ASpin } from '@app/components/spin';
import { GlobalStoreContext, HistoryStoreContext } from '@app/stores';
import { useI18n } from 'agora-common-libs';
import { observer } from 'mobx-react';
import { FC, PropsWithChildren, useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import './index.css';

export const BasicLayout: FC<PropsWithChildren<unknown>> = observer(({ children }) => {
  const transI18n = useI18n();
  const globalStore = useContext(GlobalStoreContext);
  const historyStore = useContext(HistoryStoreContext);
  const history = useHistory();
  useEffect(() => {
    history.listen((location, action) => {
      switch (action) {
        case 'POP':
          historyStore.pop();
          break;
        case 'PUSH':
          historyStore.push(location.pathname);
          break;
        case 'REPLACE':
          historyStore.replace(location.pathname);
          break;
      }
    });
  }, []);

  return (
    <ASpin
      tip={transI18n('fcr_loading')}
      spinning={globalStore.loading}
      size={'large'}
      className="global-loading-container">
      <div style={{ height: '100vh' }}>{children}</div>
    </ASpin>
  );
});
