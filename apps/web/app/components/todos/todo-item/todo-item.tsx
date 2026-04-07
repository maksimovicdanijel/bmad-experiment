import type { Todo } from '@bmad/shared';
import { Box, HStack, IconButton, List, Spinner, Text } from '@chakra-ui/react';
import { Check, Trash2 } from 'lucide-react';
import { formatTimestamp } from '~/lib/format-timestamp';

export interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isMutating?: boolean;
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  isMutating = false,
}: TodoItemProps) {
  const isCompleted = todo.isCompleted;

  return (
    <List.Item as="li" position="relative">
      <HStack justify="space-between" py="2" gap="3">
        <Box
          as="button"
          role="checkbox"
          aria-checked={isCompleted}
          aria-label={
            isCompleted
              ? `Mark ${todo.text} as active`
              : `Mark ${todo.text} as complete`
          }
          onClick={() => onToggle(todo.id)}
          minW="44px"
          minH="44px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          flexShrink={0}
        >
          <Box
            w="20px"
            h="20px"
            borderWidth="2px"
            borderColor={isCompleted ? 'accent.emphasis' : 'border.subtle'}
            borderRadius="md"
            bg={isCompleted ? 'accent.emphasis' : 'transparent'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            transition="background-color 200ms, border-color 200ms"
          >
            {isCompleted && (
              <Check size={14} color="var(--chakra-colors-fg-inverted)" />
            )}
          </Box>
        </Box>
        <Text
          flex="1"
          color={isCompleted ? 'fg.completed' : 'fg.default'}
          textDecoration={isCompleted ? 'line-through' : 'none'}
        >
          {todo.text}
        </Text>
        <Text fontSize="xs" color="fg.muted" flexShrink={0}>
          {formatTimestamp(todo.createdAt)}
        </Text>
        <IconButton
          aria-label={`Delete ${todo.text}`}
          onClick={() => onDelete(todo.id)}
          variant="ghost"
          size="sm"
          minW="44px"
          minH="44px"
          color="status.error"
        >
          <Trash2 size={16} />
        </IconButton>
      </HStack>
      {isMutating && (
        <Box
          data-testid="loading-overlay"
          position="absolute"
          inset="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="bg.panel/60"
          borderRadius="md"
          css={{
            opacity: 0,
            animation: 'fadeIn 150ms ease-in 200ms forwards',
            '@keyframes fadeIn': {
              to: { opacity: 1 },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              opacity: 1,
            },
          }}
        >
          <Spinner size="sm" color="accent.emphasis" />
        </Box>
      )}
    </List.Item>
  );
}
