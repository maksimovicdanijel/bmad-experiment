import type { Route } from './+types/home';
import { Box, Container, Heading, List, Text } from '@chakra-ui/react';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'bmad-experiment' },
    {
      name: 'description',
      content: 'React Router SSR scaffold with Chakra UI',
    },
  ];
}

export default function Home() {
  return (
    <Container maxW="4xl" py={{ base: '12', md: '16' }}>
      <Box
        rounded="lg"
        borderWidth="1px"
        borderColor="border.subtle"
        bg="bg.panel"
        p={{ base: '6', md: '8' }}
      >
        <Heading size="lg">bmad-experiment web scaffold</Heading>
        <Text mt="3" color="fg.muted">
          React Router v7 SSR is active and Chakra UI v3 is now wired as the
          application UI system.
        </Text>
        <List.Root mt="6" gap="2" color="fg.default">
          <List.Item>
            Dark-only Charcoal Focus theme foundation is active.
          </List.Item>
          <List.Item>Root error boundary is SSR-safe and accessible.</List.Item>
          <List.Item>
            API client generation outputs are emitted to apps/web/app/lib.
          </List.Item>
        </List.Root>
      </Box>
    </Container>
  );
}
