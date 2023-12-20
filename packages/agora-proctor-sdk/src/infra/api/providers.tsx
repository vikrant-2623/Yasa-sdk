import { FC, createContext } from 'react';
import { FcrTheme } from '@proctor/ui-kit';
import { FcrUIConfig } from '../types/config';
export const uiConfigContext = createContext({} as FcrUIConfig);
import { I18nProvider, ThemeProvider } from 'agora-common-libs';

const { Provider, Consumer } = uiConfigContext;

export const Providers: FC<{ language: string; uiConfig: FcrUIConfig; theme: FcrTheme }> = ({
  children,
  language,
  uiConfig,
  theme,
}) => {
  return (
    <I18nProvider language={language}>
      <ThemeProvider value={theme}>
        <Provider value={uiConfig}>{children}</Provider>
      </ThemeProvider>
    </I18nProvider>
  );
};

export const UIConfigConsumer = Consumer;
