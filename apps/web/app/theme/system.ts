import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { charcoalFocusTokens } from './tokens';

const customConfig = defineConfig({
  globalCss: {
    html: {
      colorScheme: 'dark',
      bg: 'bg.canvas',
    },
    body: {
      bg: 'bg.canvas',
      color: 'fg.default',
      minHeight: '100vh',
    },
    '*::selection': {
      bg: 'accent.emphasis',
      color: 'fg.default',
    },
  },
  theme: {
    tokens: charcoalFocusTokens,
    semanticTokens: {
      colors: {
        'bg.canvas': { value: '{colors.charcoal.950}' },
        'bg.panel': { value: '{colors.charcoal.900}' },
        'fg.default': { value: '{colors.charcoal.50}' },
        'fg.muted': { value: '{colors.charcoal.100}' },
        'border.subtle': { value: '{colors.charcoal.700}' },
        'accent.emphasis': { value: '{colors.cyan.400}' },
        'status.success': { value: '{colors.green.400}' },
        'status.error': { value: '{colors.red.400}' },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
