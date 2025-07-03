
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useRoleBasedDataAccess } from './useRoleBasedDataAccess';
import { useVotersQuery } from './useOptimizedQuery';

interface UseOptimizedVoterAccessOptions {
  pageSize?: number;
  enableCache?: boolean;
}

export const useOptimizedVoterAccess = (options: UseOptimizedVoterAccessOptions = {}) => {
  const { userProfile } = useAuth();
  const { createVoterQuery } = useRoleBasedDataAccess();
  
  const votersQuery = createVoterQuery();
  
  const queryKey = useMemo(() => {
    const baseKey = ['optimized-voters', userProfile?.uid, userProfile?.role];
    if (userProfile?.role === 'village_admin') {
      baseKey.push(userProfile.accessScope?.village_id);
    }
    return baseKey;
  }, [userProfile]);

  const { data: voters = [], isLoading, error } = useVotersQuery({
    query: votersQuery!,
    queryKey,
    enabled: !!userProfile && !!votersQuery,
    staleTime: options.enableCache ? 5 * 60 * 1000 : 0,
  });

  const stats = useMemo(() => {
    if (!Array.isArray(voters)) return { total: 0, willVote: 0, highProbability: 0, withPhone: 0 };

    return {
      total: voters.length,
      willVote: voters.filter(v => v['Will Vote'] === 'Yes').length,
      highProbability: voters.filter(v => (v['Vote Probability (%)'] || 0) >= 70).length,
      withPhone: voters.filter(v => v.Phone).length
    };
  }, [voters]);

  return {
    voters,
    stats,
    isLoading,
    error
  };
};
