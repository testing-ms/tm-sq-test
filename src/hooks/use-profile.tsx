import { useQuery } from '@tanstack/react-query';

export function useProfile() {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      // Fetch profile data
    }
  });

  return { profile };
}