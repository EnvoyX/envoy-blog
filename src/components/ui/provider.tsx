import { ChakraProvider } from '@chakra-ui/react';

import { systemChakraUI } from '../../utils/system';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={systemChakraUI}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
