import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, clearStatsCache } from '@/lib/dashboardStats';
import { useAuth } from './useAuth';

interface UseRealTimeStatsOptions {
  refetchInterval?: number;
  staleTime?: number;
  enabled?: boolean;
}

export const useRealTimeStats = (options: UseRealTimeStatsOptions = {}) => {
  const { userProfile } = useAuth();
  const {
    refetchInterval = 30000, // 30 seconds default
    staleTime = 10000, // 10 seconds default
    enabled = true,
  } = options;

  const userRole = userProfile?.role || 'user';
  const locationScope = userProfile?.accessScope;

  const queryKey = [
    'real-time-stats',
    userRole,
    locationScope?.division_id,
    locationScope?.district_id,
    locationScope?.upazila_id,
    locationScope?.union_id,
    locationScope?.village_id,
  ];

  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey,
    queryFn: () => getDashboardStats(userRole, locationScope),
    refetchInterval,
    staleTime,
    enabled: enabled && !!userProfile,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const refreshStats = async () => {
    // Clear cache to force fresh data
    clearStatsCache();
    return refetch();
  };

  return {
    stats,
    isLoading,
    error,
    refetch: refreshStats,
    isRefetching,
    userRole,
    locationScope,
  };
};

// Hook for specific stat types
export const useVoterStats = (options?: UseRealTimeStatsOptions) => {
  const { stats, ...rest } = useRealTimeStats(options);
  
  return {
    voterStats: {
      totalVoters: stats?.totalVoters || 0,
      maleVoters: stats?.maleVoters || 0,
      femaleVoters: stats?.femaleVoters || 0,
      highPriorityVoters: stats?.highPriorityVoters || 0,
    },
    ...rest,
  };
};

export const useUserStats = (options?: UseRealTimeStatsOptions) => {
  const { stats, ...rest } = useRealTimeStats(options);
  
  return {
    userStats: {
      totalUsers: stats?.totalUsers || 0,
      activeAdmins: stats?.activeAdmins || 0,
      pendingApprovals: stats?.pendingApprovals || 0,
      roleDistribution: stats?.roleDistribution || {},
    },
    ...rest,
  };
};

export const useLocationStats = (options?: UseRealTimeStatsOptions) => {
  const { stats, ...rest } = useRealTimeStats(options);
  
  return {
    locationStats: stats?.locationStats || {},
    ...rest,
  };
}; 