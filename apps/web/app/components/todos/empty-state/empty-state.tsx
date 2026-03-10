import { Heading, Text, VStack } from '@chakra-ui/react';
import { ClipboardList, CircleCheckBig } from 'lucide-react';

interface EmptyStateProps {
  variant: 'first-use' | 'all-done';
}

export function EmptyState({ variant }: EmptyStateProps) {
  const isFirstUse = variant === 'first-use';
  const IconComponent = isFirstUse ? ClipboardList : CircleCheckBig;

  return (
    <VStack
      role="status"
      aria-live="polite"
      gap="3"
      py="10"
      textAlign="center"
      css={{
        animation: 'fadeIn 200ms ease-in',
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
        '@keyframes fadeIn': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <IconComponent
        size={40}
        color={
          isFirstUse
            ? 'var(--chakra-colors-fg-muted)'
            : 'var(--chakra-colors-status-success)'
        }
        aria-hidden="true"
      />
      <Heading size="md">
        {isFirstUse ? 'Nothing here yet.' : 'All done!'}
      </Heading>
      <Text color="fg.muted">
        {isFirstUse
          ? 'Type above to capture your first task.'
          : 'Your active list is clear.'}
      </Text>
    </VStack>
  );
}
