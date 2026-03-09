import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';
import {
  Box,
  ChakraProvider,
  Code,
  Container,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';

import type { Route } from './+types/root';
import './app.css';
import { system } from './theme/system';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ChakraProvider value={system}>{children}</ChakraProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export interface ErrorBoundaryContent {
  message: string;
  details: string;
  stack?: string;
}

export function resolveErrorBoundaryContent(
  error: unknown,
): ErrorBoundaryContent {
  let message = 'Something went wrong';
  let details = 'An unexpected error occurred while rendering this page.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? 'Page not found' : 'Request failed';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return { message, details, stack };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const content = resolveErrorBoundaryContent(error);

  return (
    <Container maxW="3xl" py={{ base: '10', md: '16' }} role="alert">
      <VStack align="start" gap="4">
        <Heading size="lg">{content.message}</Heading>
        <Text color="fg.muted">{content.details}</Text>
        {content.stack && (
          <Box
            as="pre"
            width="full"
            maxH="xs"
            overflow="auto"
            rounded="md"
            borderWidth="1px"
            borderColor="border.subtle"
            bg="bg.panel"
            p="4"
            fontSize="sm"
          >
            <Code whiteSpace="pre">{content.stack}</Code>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
