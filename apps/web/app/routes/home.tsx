import type { Route } from './+types/home';
import {
  createTodoSchema,
  VALIDATION_ERROR_MESSAGE,
  type Todo,
} from '@bmad/shared';
import { Box, Container, List } from '@chakra-ui/react';
import { startTransition, useOptimistic } from 'react';
import { useFetcher } from 'react-router';
import { TaskInput } from '../components/TaskInput';
import { EmptyState } from '../components/todos/empty-state/empty-state';
import { SectionHeader } from '../components/todos/section-header/section-header';
import { TodoItem } from '../components/todos/todo-item/todo-item';
import { createTodo, fetchTodos } from '../lib/api/index.server';

type ActionData = {
  error?: {
    message: string;
  };
};

export async function action({
  request,
}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const text = String(formData.get('text') ?? '');

  const parsed = createTodoSchema.safeParse({ text });
  if (!parsed.success) {
    return {
      error: {
        message: VALIDATION_ERROR_MESSAGE,
      },
    };
  }

  try {
    await createTodo({ text: parsed.data.text });
    return {};
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : 'Failed to create todo',
      },
    };
  }
}

export async function loader({}: Route.LoaderArgs) {
  const todos = await fetchTodos();
  return { todos };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<ActionData>();
  const todos: Todo[] = loaderData?.todos ?? [];

  const [optimisticTodos, addOptimisticTodo] = useOptimistic<
    Todo[],
    { text: string }
  >(todos, (state, update) => [
    ...state,
    {
      id: `optimistic-${crypto.randomUUID()}`,
      text: update.text,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    },
  ]);

  const handleCreateTodo = (text: string) => {
    const formData = new FormData();
    formData.set('text', text);
    startTransition(() => {
      addOptimisticTodo({ text });
      fetcher.submit(formData, { method: 'post' });
    });
  };

  const activeTodos = optimisticTodos.filter((t) => !t.isCompleted);
  const completedTodos = optimisticTodos.filter((t) => t.isCompleted);

  return (
    <Container
      maxW="640px"
      px={{ base: '4', md: '6', lg: '8' }}
      py={{ base: '6', md: '10' }}
    >
      <title>bmad-experiment</title>
      <meta name="description" content="Capture and manage your daily tasks" />

      <TaskInput
        onSubmit={handleCreateTodo}
        isSubmitting={fetcher.state === 'submitting'}
        errorMessage={fetcher.data?.error?.message}
        onErrorClear={() => fetcher.load('.')}
      />

      <SectionHeader label="ACTIVE" count={activeTodos.length} />
      {activeTodos.length === 0 ? (
        <EmptyState
          variant={optimisticTodos.length === 0 ? 'first-use' : 'all-done'}
        />
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
