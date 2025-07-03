
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
      
      console.log('Executing voters query with key:', queryKey);
      
      try {
        const snapshot = await getDocs(query);
        const voters = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as VoterData));
        
        console.log('Query result:', voters.length, 'voters found');
        return voters;
      } catch (error) {
        console.error('Error fetching voters:', error);
        return [];
      }
    },
    enabled,
    staleTime,
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
