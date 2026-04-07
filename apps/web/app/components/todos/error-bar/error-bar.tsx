import { Box, Button, HStack, IconButton, Text } from '@chakra-ui/react';
import { CircleAlert, X } from 'lucide-react';

export interface ErrorBarProps {
  message: string | undefined;
  onRetry: () => void;
  onDismiss: () => void;
}

export function ErrorBar({ message, onRetry, onDismiss }: ErrorBarProps) {
  if (!message) {
    return null;
  }

  return (
    <Box
      role="alert"
      aria-live="assertive"
      position="fixed"
      bottom={{ base: '0', md: '4' }}
      left={{ base: '0', md: '50%' }}
      right={{ base: '0', md: 'auto' }}
      transform={{ base: 'none', md: 'translateX(-50%)' }}
      width={{ base: '100%', md: 'auto' }}
      maxW={{ base: 'none', md: '640px' }}
      bg="red.900/10%"
      border="1px solid"
      borderColor="status.error"
      borderRadius={{ base: '0', md: 'md' }}
      px="4"
      py="3"
      zIndex="toast"
    >
      <HStack gap="3">
        <CircleAlert
          size={20}
          color="var(--chakra-colors-status-error)"
          aria-hidden="true"
        />
        <Text color="status.error" fontSize="sm" flex="1">
          {message}
        </Text>
        <Button
          size="sm"
          variant="outline"
          colorPalette="red"
          onClick={onRetry}
        >
          Retry
        </Button>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label="Dismiss"
          onClick={onDismiss}
        >
          <X size={16} />
        </IconButton>
      </HStack>
    </Box>
  );
}
