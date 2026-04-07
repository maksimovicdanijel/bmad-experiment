import type { Route } from './+types/home';
import {
  createTodoSchema,
  VALIDATION_ERROR_MESSAGE,
  type Todo,
} from '@bmad/shared';
import { Box, Container, List } from '@chakra-ui/react';
import { useCallback, useMemo, useRef } from 'react';
import { useFetcher } from 'react-router';
import { TaskInput } from '../components/TaskInput';
import { ErrorBar } from '../components/todos/error-bar/error-bar';
import { EmptyState } from '../components/todos/empty-state/empty-state';
import { SectionHeader } from '../components/todos/section-header/section-header';
import { TodoItem } from '../components/todos/todo-item/todo-item';
import {
  createTodo,
  deleteTodo,
  fetchTodos,
  updateTodo,
} from '../lib/api/index.server';

type ActionData = {
  error?: {
    message: string;
    type: 'validation' | 'server';
  };
};

type OptimisticAction =
  | { type: 'add'; text: string }
  | { type: 'toggle'; id: string }
  | { type: 'delete'; id: string };

export function applyOptimisticTodoUpdate(
  state: Todo[],
  action: OptimisticAction,
): Todo[] {
  switch (action.type) {
    case 'add':
      return [
        ...state,
        {
          id: `optimistic-${crypto.randomUUID()}`,
          text: action.text,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        },
      ];
    case 'toggle':
      return state.map((t) =>
        t.id === action.id ? { ...t, isCompleted: !t.isCompleted } : t,
      );
    case 'delete':
      return state.filter((t) => t.id !== action.id);
  }
}

const NETWORK_ERROR_MESSAGE = 'Network error. Please try again.';
const SERVER_ERROR_MESSAGE = 'Something went wrong. Please try again.';

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return /network|failed to fetch|fetch failed|econnrefused|enotfound|timeout|timed out/.test(
    message,
  );
}

function getErrorResponse(error: unknown): ActionData {
  return {
    error: {
      message: isNetworkError(error)
        ? NETWORK_ERROR_MESSAGE
        : SERVER_ERROR_MESSAGE,
      type: 'server',
    },
  };
}

export async function action({
  request,
}: Route.ActionArgs): Promise<ActionData> {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? 'create');

  if (intent === 'toggle') {
    const id = String(formData.get('id') ?? '');
    const completed = formData.get('completed') === 'true';
    try {
      await updateTodo(id, { completed: !completed });
      return {};
    } catch (error) {
      return getErrorResponse(error);
    }
  }

  if (intent === 'delete') {
    const id = String(formData.get('id') ?? '');
    try {
      await deleteTodo(id);
      return {};
    } catch (error) {
      return getErrorResponse(error);
    }
  }

  // Default: create
  const text = String(formData.get('text') ?? '');
  const parsed = createTodoSchema.safeParse({ text });
  if (!parsed.success) {
    return {
      error: {
        message: VALIDATION_ERROR_MESSAGE,
        type: 'validation',
      },
    };
  }

  try {
    await createTodo({ text: parsed.data.text });
    return {};
  } catch (error) {
    return getErrorResponse(error);
  }
}

export async function loader({}: Route.LoaderArgs) {
  const todos = await fetchTodos();
  return { todos };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const fetcher = useFetcher<ActionData>();
  const todos = useMemo<Todo[]>(
    () => loaderData?.todos ?? [],
    [loaderData?.todos],
  );
  const lastFormDataRef = useRef<FormData | null>(null);

  const mutatingTodoId = useMemo(() => {
    if (fetcher.state === 'idle') return undefined;
    const intent = fetcher.formData?.get('intent');
    if (intent === 'toggle' || intent === 'delete') {
      return fetcher.formData?.get('id') as string;
    }
    return undefined;
  }, [fetcher.state, fetcher.formData]);

  // Derive optimistic state from fetcher.formData instead of useOptimistic.
  // fetcher.formData persists throughout the entire mutation cycle
  // (submitting → loading → idle), preventing the flash that occurs when
  // useOptimistic reverts its state before new loader data arrives.
  const optimisticTodos = useMemo(() => {
    if (!fetcher.formData) return todos;

    const intent = String(fetcher.formData.get('intent') ?? '');

    if (intent === 'toggle') {
      const id = String(fetcher.formData.get('id') ?? '');
      const completed = fetcher.formData.get('completed') === 'true';
      return todos.map((t) =>
        t.id === id ? { ...t, isCompleted: !completed } : t,
      );
    }

    if (intent === 'delete') {
      const id = String(fetcher.formData.get('id') ?? '');
      return todos.filter((t) => t.id !== id);
    }

    if (intent === 'create') {
      const text = String(fetcher.formData.get('text') ?? '');
      return [
        ...todos,
        {
          id: `optimistic-${text}`,
          text,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        },
      ];
    }

    return todos;
  }, [todos, fetcher.formData]);

  const handleCreateTodo = (text: string) => {
    const formData = new FormData();
    formData.set('intent', 'create');
    formData.set('text', text);
    lastFormDataRef.current = formData;
    fetcher.submit(formData, { method: 'post' });
  };

  const handleToggleTodo = useCallback(
    (id: string) => {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;
      const formData = new FormData();
      formData.set('intent', 'toggle');
      formData.set('id', id);
      formData.set('completed', String(todo.isCompleted));
      lastFormDataRef.current = formData;
      fetcher.submit(formData, { method: 'post' });
    },
    [todos, fetcher],
  );

  const handleDeleteTodo = useCallback(
    (id: string) => {
      const formData = new FormData();
      formData.set('intent', 'delete');
      formData.set('id', id);
      lastFormDataRef.current = formData;
      fetcher.submit(formData, { method: 'post' });
    },
    [fetcher],
  );

  const handleRetry = useCallback(() => {
    if (lastFormDataRef.current) {
      fetcher.submit(lastFormDataRef.current, { method: 'post' });
    }
  }, [fetcher]);

  const handleDismiss = useCallback(() => {
    fetcher.load('.');
  }, [fetcher]);

  const serverError =
    fetcher.data?.error?.type === 'server'
      ? fetcher.data.error.message
      : undefined;

  const validationError =
    fetcher.data?.error?.type === 'validation'
      ? fetcher.data.error.message
      : undefined;

  const activeTodos = optimisticTodos.filter((t) => !t.isCompleted);
  const completedTodos = optimisticTodos.filter((t) => t.isCompleted);

  return (
    <Container
      as="main"
      maxW="640px"
      px={{ base: '4', md: '6', lg: '8' }}
      py={{ base: '6', md: '10' }}
    >
      <title>bmad-experiment</title>
      <meta name="description" content="Capture and manage your daily tasks" />

      <TaskInput
        onSubmit={handleCreateTodo}
        isSubmitting={fetcher.state === 'submitting'}
        errorMessage={validationError}
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
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onDelete={handleDeleteTodo}
              isMutating={todo.id === mutatingTodoId}
            />
          ))}
        </List.Root>
      )}

      <Box mt="6">
        <SectionHeader label="COMPLETED" count={completedTodos.length} />
        {completedTodos.length > 0 && (
          <List.Root as="ul" listStyle="none" gap="0">
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={handleToggleTodo}
                onDelete={handleDeleteTodo}
                isMutating={todo.id === mutatingTodoId}
              />
            ))}
          </List.Root>
        )}
      </Box>

      <ErrorBar
        message={serverError}
        onRetry={handleRetry}
        onDismiss={handleDismiss}
      />
    </Container>
  );
}
