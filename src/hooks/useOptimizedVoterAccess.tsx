
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { VoterData } from '@/lib/types';

interface UseOptimizedVoterAccessOptions {
  pageSize?: number;
  enableCache?: boolean;
  additionalFilters?: Record<string, any>;
}

export const useOptimizedVoterAccess = (options: UseOptimizedVoterAccessOptions = {}) => {
  const { pageSize = 50, enableCache = true, additionalFilters = {} } = options;
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  // Create optimized query key for caching
  const queryKey = useMemo(() => {
    return [
      'voters-optimized',
      userProfile?.uid,
      userProfile?.role,
      userProfile?.accessScope?.village_id,
      JSON.stringify(additionalFilters)
    ];
  }, [userProfile, additionalFilters]);

  // Create the Firestore query
  const createQuery = useMemo(() => {
    if (!userProfile) return null;

    const votersRef = collection(db, 'voters');
    const constraints = [];

    // Apply role-based filtering
    if (userProfile.role === 'village_admin' && userProfile.accessScope?.village_id) {
      constraints.push(where('village_id', '==', userProfile.accessScope.village_id));
    }

    // Apply additional filters
    Object.entries(additionalFilters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        constraints.push(where(field, '==', value));
      }
    });

    // Add ordering and limit
    constraints.push(orderBy('Last Updated', 'desc'));
    constraints.push(limit(pageSize));

    return query(votersRef, ...constraints);
  }, [userProfile, additionalFilters, pageSize]);

  // Use React Query for optimized data fetching
  const {
    data: voters = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!createQuery) return [];
      
      const snapshot = await getDocs(createQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as VoterData));
    },
    enabled: !!userProfile && !!createQuery,
    staleTime: enableCache ? 5 * 60 * 1000 : 0, // 5 minutes cache
    gcTime: enableCache ? 10 * 60 * 1000 : 0, // 10 minutes cache
  });

  // Memoized statistics for better performance
  const stats = useMemo(() => {
    if (!voters || voters.length === 0) {
      return {
        total: 0,
        male: 0,
        female: 0,
        willVote: 0,
        wontVote: 0,
        highProbability: 0,
        withPhone: 0
      };
    }

    return {
      total: voters.length,
      male: voters.filter(v => v.Gender === 'Male' || v.Gender === 'পুরুষ').length,
      female: voters.filter(v => v.Gender === 'Female' || v.Gender === 'মহিলা').length,
      willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
      wontVote: voters.filter(v => v['Will Vote'] === 'No').length,
      highProbability: voters.filter(v => (v['Vote Probability (%)'] || 0) >= 70).length,
      withPhone: voters.filter(v => v.Phone || v.Mobile).length
    };
  }, [voters]);

  // Clear cache function for real-time updates
  const clearCache = () => {
    queryClient.invalidateQueries({ queryKey: [queryKey[0]] });
  };

  // Prefetch next page for better UX
  const prefetchNextPage = () => {
    if (voters.length >= pageSize) {
      const nextPageKey = [...queryKey, 'page-2'];
      queryClient.prefetchQuery({
        queryKey: nextPageKey,
        queryFn: async () => {
          // Implementation for next page
          return [];
        },
        staleTime: 2 * 60 * 1000
      });
    }
  };

  useEffect(() => {
    prefetchNextPage();
  }, [voters]);

  return {
    voters,
    stats,
    isLoading,
    error,
    refetch,
    clearCache,
    canAccessAllData: userProfile?.role === 'super_admin',
    hasLocationRestriction: userProfile?.role === 'village_admin'
  };
};
