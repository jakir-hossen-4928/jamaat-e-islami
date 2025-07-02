
import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { VoterData, User } from '@/lib/types';

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
  };
  roleDistribution: {
    super_admin: number;
    village_admin: number;
  };
}

interface UseRealTimeStatsOptions {
  refetchInterval?: number;
  staleTime?: number;
}

export const useRealTimeStats = (options: UseRealTimeStatsOptions = {}) => {
  const { refetchInterval = 30000, staleTime = 10000 } = options;
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['real-time-stats', userProfile?.uid],
    queryFn: async (): Promise<StatsData> => {
      if (!userProfile) {
        throw new Error('User profile not available');
      }

      // Fetch voters data
      const votersRef = collection(db, 'voters');
      let votersQuery = query(votersRef);

      // Apply role-based filtering
      if (userProfile.role === 'village_admin' && userProfile.accessScope?.village_id) {
        votersQuery = query(votersRef, where('village_id', '==', userProfile.accessScope.village_id));
      }

      const votersSnapshot = await getDocs(votersQuery);
      const voters = votersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));

      // Fetch users data (only super admin can see all users)
      let users: User[] = [];
      if (userProfile.role === 'super_admin') {
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        users = usersSnapshot.docs.map(doc => ({ 
          uid: doc.id, 
          ...doc.data() 
        } as User));
      }

      // Calculate voter statistics
      const totalVoters = voters.length;
      const maleVoters = voters.filter(v => v.Gender === 'Male' || v.Gender === 'পুরুষ').length;
      const femaleVoters = voters.filter(v => v.Gender === 'Female' || v.Gender === 'মহিলা').length;
      const highPriorityVoters = voters.filter(v => (v['Vote Probability (%)'] || 0) >= 80).length;

      // Calculate user statistics
      const activeAdmins = users.filter(u => u.approved).length;
      const pendingApprovals = users.filter(u => !u.approved).length;

      // Role distribution
      const roleDistribution = {
        super_admin: users.filter(u => u.role === 'super_admin').length,
        village_admin: users.filter(u => u.role === 'village_admin').length,
      };

      return {
        totalVoters,
        maleVoters,
        femaleVoters,
        highPriorityVoters,
        activeAdmins,
        pendingApprovals,
        locationStats: {
          totalDivisions: 8, // Bangladesh has 8 divisions
          totalDistricts: 64, // Approximate number of districts
        },
        roleDistribution,
      };
    },
    enabled: !!userProfile,
    refetchInterval,
    staleTime,
  });
};
