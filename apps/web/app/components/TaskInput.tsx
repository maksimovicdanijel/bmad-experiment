import { createTodoSchema, VALIDATION_ERROR_MESSAGE } from '@bmad/shared';
import { Button, Input, Text, VStack } from '@chakra-ui/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';

export interface TaskInputProps {
  onSubmit: (text: string) => void;
  isSubmitting?: boolean;
  errorMessage?: string;
  /** Called when the user starts typing after a server error, so the parent can clear fetcher state. */
  onErrorClear?: () => void;
}

function validateText(text: string): string | null {
  const parsed = createTodoSchema.safeParse({ text });
  if (!parsed.success) {
    return VALIDATION_ERROR_MESSAGE;
  }

  return null;
}

export function TaskInput({
  onSubmit,
  isSubmitting = false,
  errorMessage,
  onErrorClear,
}: TaskInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationResult = validateText(value);
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    setValidationError(null);
    onSubmit(value);
    setValue('');
  };

  const resolvedError = validationError ?? errorMessage;

  return (
    <VStack as="section" align="stretch" gap="2" mb="6">
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}
      >
        <Input
          ref={inputRef}
          name="text"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setValidationError(null);
            if (errorMessage) {
              onErrorClear?.();
            }
          }}
          placeholder="Add a task..."
          aria-label="Task text"
          aria-invalid={resolvedError ? 'true' : 'false'}
          flex="1"
          h="44px"
        />
        <Button
          type="submit"
          minW="44px"
          minH="44px"
          h="44px"
          px="4"
          loading={isSubmitting}
          data-touch-target="44"
          css={
            isSubmitting
              ? {
                  '& [data-part="spinner"]': {
                    opacity: 0,
                    animation: 'showSpinner 0s ease-in 200ms forwards',
                  },
                  '@keyframes showSpinner': {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }
              : undefined
          }
        >
          Add
        </Button>
        {isSubmitting && (
          <span
            data-testid="loading-delay-wrapper"
            aria-hidden="true"
            style={{
              position: 'absolute',
              width: 0,
              height: 0,
              overflow: 'hidden',
              animationDelay: '200ms',
            }}
          />
        )}
      </form>

      {resolvedError && (
        <Text role="alert" color="red.300" fontSize="sm">
          {resolvedError}
        </Text>
      )}
    </VStack>
  );
}
