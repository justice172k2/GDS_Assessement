export const removeDuplicate = <T>(values: T[]): T[] => Array.from(new Set(values));

export const extractMentionedEmails = (notification: string): string[] => {
  const matches = notification.match(/@([\w.+-]+@[\w-]+\.[\w.]+)/g) ?? [];
  return matches.map((match) => match.slice(1).toLowerCase());
};

export const toBooleanFromDb = (value: boolean | number | string): boolean =>
  value === true || value === 1 || value === '1';
