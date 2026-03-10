import { HStack, Text } from '@chakra-ui/react';

interface SectionHeaderProps {
  label: string;
  count: number;
}

export function SectionHeader({ label, count }: SectionHeaderProps) {
  return (
    <HStack role="heading" aria-level={2} gap="2" py="2">
      <Text
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="0.08em"
        color="fg.muted"
      >
        {label}
      </Text>
      <Text fontSize="xs" color="fg.muted" aria-live="polite">
        — {count}
      </Text>
    </HStack>
  );
}
