
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { collection, getDocs, query, Query, DocumentData } from 'firebase/firestore';

interface OptimizedQueryOptions extends Omit<UseQueryOptions, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  firestoreQuery: Query<DocumentData>;
  enabled?: boolean;
}

export const useOptimizedQuery = <T,>(options: OptimizedQueryOptions) => {
  return useQuery({
    queryKey: options.queryKey,
    queryFn: async () => {
      const snapshot = await getDocs(options.firestoreQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    enabled: options.enabled,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    ...options
  });
};

// Cached query for voters with aggressive caching
export const useVotersQuery = (queryConfig: {
  query: Query<DocumentData>;
  queryKey: string[];
  enabled?: boolean;
}) => {
  return useOptimizedQuery({
    queryKey: queryConfig.queryKey,
    firestoreQuery: queryConfig.query,
    enabled: queryConfig.enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes for voter data
    gcTime: 30 * 60 * 1000, // Keep for 30 minutes
  });
};
