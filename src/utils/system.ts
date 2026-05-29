import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  preflight: false, // this completely disables Chakra's global CSS reset/preflight
});

// create system combining the defaults and custom config override
export const systemChakraUI = createSystem(defaultConfig, config);
