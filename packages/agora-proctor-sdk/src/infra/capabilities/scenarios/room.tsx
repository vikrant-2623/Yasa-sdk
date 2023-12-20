import { useStore } from '@proctor/infra/hooks/ui-store';
import { observer } from 'mobx-react';
import React, { FC, useEffect } from 'react';

type Props = {
  children?: React.ReactNode;
};

const Room: FC<Props> = observer(({ children }) => {
  const { join } = useStore();

  useEffect(() => {
    join();
  }, []);

  return <React.Fragment>{children}</React.Fragment>;
});

export default Room;
