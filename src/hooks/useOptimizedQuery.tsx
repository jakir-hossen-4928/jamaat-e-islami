
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { collection, getDocs, query, Query, DocumentData } from 'firebase/firestore';
import { VoterData } from '@/lib/types';

interface OptimizedQueryOptions<T = VoterData> extends Omit<UseQueryOptions<T[], Error>, 'queryKey' | 'queryFn'> {
  queryKey: (string | number | boolean | object)[];
  firestoreQuery: Query<DocumentData>;
  enabled?: boolean;
}

export const useOptimizedQuery = <T = VoterData,>(options: OptimizedQueryOptions<T>) => {
  return useQuery<T[], Error>({
    queryKey: options.queryKey,
    queryFn: async (): Promise<T[]> => {
      try {
        console.log('Executing Firestore query with cache');
        const snapshot = await getDocs(options.firestoreQuery);
        const results = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        console.log(`Query returned ${results.length} documents`);
        return results;
      } catch (error) {
        console.error('Query error:', error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    enabled: options.enabled ?? true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    ...options
  });
};

// Cached query for voters with aggressive caching
export const useVotersQuery = (queryConfig: {
  query: Query<DocumentData>;
  queryKey: (string | number | boolean | object)[];
  enabled?: boolean;
}) => {
  return useOptimizedQuery<VoterData>({
    queryKey: queryConfig.queryKey,
    firestoreQuery: queryConfig.query,
    enabled: queryConfig.enabled ?? true,
    staleTime: 15 * 60 * 1000, // 15 minutes for voter data
    gcTime: 30 * 60 * 1000, // Keep for 30 minutes
  });
};
