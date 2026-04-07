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
        'bg.canvas': {
          value: {
            base: '{colors.charcoal.950}',
            _dark: '{colors.charcoal.950}',
          },
        },
        'bg.panel': {
          value: {
            base: '{colors.charcoal.900}',
            _dark: '{colors.charcoal.900}',
          },
        },
        'fg.default': {
          value: {
            base: '{colors.charcoal.50}',
            _dark: '{colors.charcoal.50}',
          },
        },
        'fg.muted': {
          value: {
            base: '{colors.charcoal.100}',
            _dark: '{colors.charcoal.100}',
          },
        },
        'fg.completed': {
          value: {
            base: '{colors.charcoal.400}',
            _dark: '{colors.charcoal.400}',
          },
        },
        'border.subtle': {
          value: {
            base: '{colors.charcoal.700}',
            _dark: '{colors.charcoal.700}',
          },
        },
        'accent.emphasis': {
          value: { base: '{colors.cyan.400}', _dark: '{colors.cyan.400}' },
        },
        'status.success': {
          value: { base: '{colors.green.400}', _dark: '{colors.green.400}' },
        },
        'status.error': {
          value: { base: '{colors.red.400}', _dark: '{colors.red.400}' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
