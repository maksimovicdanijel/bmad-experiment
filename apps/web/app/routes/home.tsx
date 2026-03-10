import type { Route } from './+types/home';
import type { Todo } from '@bmad/shared';
import { Box, Container, List } from '@chakra-ui/react';
import { EmptyState } from '../components/todos/empty-state/empty-state';
import { SectionHeader } from '../components/todos/section-header/section-header';
import { TodoItem } from '../components/todos/todo-item/todo-item';
import { fetchTodos } from '../lib/api/index.server';

export async function loader({}: Route.LoaderArgs) {
  const todos = await fetchTodos();
  return { todos };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const todos: Todo[] = loaderData?.todos ?? [];

  const activeTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  return (
    <Container
      maxW="640px"
      px={{ base: '4', md: '6', lg: '8' }}
      py={{ base: '6', md: '10' }}
    >
      <title>bmad-experiment</title>
      <meta name="description" content="Capture and manage your daily tasks" />

      {/* TaskInput will go here in Story 2.5 */}

      <SectionHeader label="ACTIVE" count={activeTodos.length} />
      {activeTodos.length === 0 ? (
        <EmptyState variant={todos.length === 0 ? 'first-use' : 'all-done'} />
      ) : (
        <List.Root as="ul" listStyle="none" gap="0">
          {activeTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} />
          ))}
        </List.Root>
      )}

      <Box mt="6">
        <SectionHeader label="COMPLETED" count={completedTodos.length} />
        {completedTodos.length > 0 && (
          <List.Root as="ul" listStyle="none" gap="0">
            {completedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </List.Root>
        )}
      </Box>
    </Container>
  );
}
