
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { useDataAccess } from '@/contexts/DataAccessContext';

interface StatsData {
  totalVoters: number;
  maleVoters: number;
  femaleVoters: number;
  highPriorityVoters: number;
  activeAdmins: number;
  pendingApprovals: number;
  locationStats: {
    totalDivisions: number;
    totalDistricts: number;
    totalUpazilas: number;
    totalUnions: number;
    totalVillages: number;
  };
  roleDistribution: {
    super_admin: number;
    division_admin: number;
    district_admin: number;
    upazila_admin: number;
    union_admin: number;
    village_admin: number;
  };
}

interface UseRealTimeStatsOptions {
  refetchInterval?: number;
  staleTime?: number;
  enabled?: boolean;
}

export const useRealTimeStats = (options: UseRealTimeStatsOptions = {}) => {
  const { userProfile } = useAuth();
  const { createVoterQuery, canAccessAllData } = useDataAccess();

  const fetchStats = async (): Promise<StatsData> => {
    try {
      // Fetch voters based on user's access scope
      const votersQuery = createVoterQuery();
      const votersSnapshot = votersQuery ? await getDocs(votersQuery) : null;
      const voters = votersSnapshot?.docs.map(doc => doc.data()) || [];

      // Calculate voter stats
      const totalVoters = voters.length;
      const maleVoters = voters.filter(voter => voter.Gender === 'Male' || voter.Gender === 'পুরুষ').length;
      const femaleVoters = voters.filter(voter => voter.Gender === 'Female' || voter.Gender === 'মহিলা').length;
      const highPriorityVoters = voters.filter(voter => voter['Priority Level'] === 'High' || voter['Priority Level'] === 'উচ্চ').length;

      // Fetch users data (only if user has permission)
      let activeAdmins = 0;
      let pendingApprovals = 0;
      let roleDistribution = {
        super_admin: 0,
        division_admin: 0,
        district_admin: 0,
        upazila_admin: 0,
        union_admin: 0,
        village_admin: 0
      };

      if (canAccessAllData || userProfile?.role === 'division_admin' || userProfile?.role === 'district_admin') {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const users = usersSnapshot.docs.map(doc => doc.data());

        activeAdmins = users.filter(user => user.approved && user.role && user.role !== 'user').length;
        pendingApprovals = users.filter(user => !user.approved).length;

        // Count role distribution
        users.forEach(user => {
          if (user.role && roleDistribution.hasOwnProperty(user.role)) {
            roleDistribution[user.role as keyof typeof roleDistribution]++;
          }
        });
      }

      // Location stats (simplified for now)
      const locationStats = {
        totalDivisions: 8,
        totalDistricts: 64,
        totalUpazilas: 495,
        totalUnions: 4571,
        totalVillages: 87319
      };

      return {
        totalVoters,
        maleVoters,
        femaleVoters,
        highPriorityVoters,
        activeAdmins,
        pendingApprovals,
        locationStats,
        roleDistribution
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  };

  return useQuery({
    queryKey: ['realTimeStats', userProfile?.uid, userProfile?.role],
    queryFn: fetchStats,
    refetchInterval: options.refetchInterval || 60000, // Default 1 minute
    staleTime: options.staleTime || 30000, // Default 30 seconds
    enabled: options.enabled !== false && !!userProfile,
    retry: 1
  });
};
