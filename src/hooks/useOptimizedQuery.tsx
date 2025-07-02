
import { useQuery } from '@tanstack/react-query';
import { Query, getDocs } from 'firebase/firestore';
import { VoterData } from '@/lib/types';

interface UseVotersQueryOptions {
  query: Query;
  queryKey: any[];
  enabled?: boolean;
  staleTime?: number;
}

export const useVotersQuery = ({ query, queryKey, enabled = true, staleTime = 5 * 60 * 1000 }: UseVotersQueryOptions) => {
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (!query) return [];
      
      const snapshot = await getDocs(query);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VoterData));
    },
    enabled,
    staleTime,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
