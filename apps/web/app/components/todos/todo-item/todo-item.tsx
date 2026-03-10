import type { Todo } from '@bmad/shared';
import { HStack, List, Text } from '@chakra-ui/react';
import { formatTimestamp } from '~/lib/format-timestamp';

export function TodoItem({ todo }: { todo: Todo }) {
  const isCompleted = todo.isCompleted;

  return (
    <List.Item as="li">
      <HStack justify="space-between" py="2">
        <Text
          color={isCompleted ? 'fg.muted' : 'fg.default'}
          textDecoration={isCompleted ? 'line-through' : 'none'}
          opacity={isCompleted ? 0.6 : 1}
        >
          {todo.text}
        </Text>
        <Text fontSize="xs" color="fg.muted" flexShrink={0}>
          {formatTimestamp(todo.createdAt)}
        </Text>
      </HStack>
    </List.Item>
  );
}
