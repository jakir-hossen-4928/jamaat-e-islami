import { collection, getDocs, query, where, orderBy, limit, startAfter, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';
import { VoterData, User } from './types';

// Cache for stats to reduce Firestore reads
const statsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface DashboardStats {
  totalVoters?: number;
  totalUsers?: number;
  activeAdmins?: number;
  pendingApprovals?: number;
  highPriorityVoters?: number;
  maleVoters?: number;
  femaleVoters?: number;
  roleDistribution?: Record<string, number>;
  locationStats?: {
    totalDivisions?: number;
    totalDistricts?: number;
    totalUpazilas?: number;
    totalUnions?: number;
    totalVillages?: number;
  };
}

// Get cached stats or fetch from Firestore
const getCachedStats = async (key: string, fetcher: () => Promise<any>) => {
  const cached = statsCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await fetcher();
  statsCache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Optimized voter stats with minimal reads
export const getVoterStats = async (locationScope?: any): Promise<Partial<DashboardStats>> => {
  const cacheKey = `voter-stats-${JSON.stringify(locationScope)}`;
  
  return getCachedStats(cacheKey, async () => {
    const votersRef = collection(db, 'voters');
    let votersQuery = query(votersRef);
    
    // Apply location filters if provided
    if (locationScope) {
      if (locationScope.division_id) {
        votersQuery = query(votersRef, where('division_id', '==', locationScope.division_id));
      }
      if (locationScope.district_id) {
        votersQuery = query(votersRef, where('district_id', '==', locationScope.district_id));
      }
      if (locationScope.upazila_id) {
        votersQuery = query(votersRef, where('upazila_id', '==', locationScope.upazila_id));
      }
      if (locationScope.union_id) {
        votersQuery = query(votersRef, where('union_id', '==', locationScope.union_id));
      }
      if (locationScope.village_id) {
        votersQuery = query(votersRef, where('village_id', '==', locationScope.village_id));
      }
    }
    
    // Get total count efficiently
    const countSnapshot = await getCountFromServer(votersQuery);
    const totalVoters = countSnapshot.data().count;
    
    // Get sample data for detailed stats (limited to reduce reads)
    const sampleQuery = query(votersQuery, limit(1000));
    const sampleSnapshot = await getDocs(sampleQuery);
    const sampleVoters = sampleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VoterData));
    
    // Calculate ratios from sample and apply to total
    const sampleSize = sampleVoters.length;
    const highPriorityRatio = sampleVoters.filter(v => v['Priority Level'] === 'High').length / sampleSize;
    const maleRatio = sampleVoters.filter(v => v.Gender === 'Male').length / sampleSize;
    const femaleRatio = sampleVoters.filter(v => v.Gender === 'Female').length / sampleSize;
    
    return {
      totalVoters,
      highPriorityVoters: Math.round(totalVoters * highPriorityRatio),
      maleVoters: Math.round(totalVoters * maleRatio),
      femaleVoters: Math.round(totalVoters * femaleRatio),
    };
  });
};

// Optimized user stats
export const getUserStats = async (): Promise<Partial<DashboardStats>> => {
  return getCachedStats('user-stats', async () => {
    const usersRef = collection(db, 'users');
    
    // Get counts efficiently
    const [totalUsersSnapshot, pendingUsersSnapshot, activeAdminsSnapshot] = await Promise.all([
      getCountFromServer(usersRef),
      getCountFromServer(query(usersRef, where('approved', '==', false))),
      getCountFromServer(query(usersRef, where('approved', '==', true)))
    ]);
    
    const totalUsers = totalUsersSnapshot.data().count;
    const pendingApprovals = pendingUsersSnapshot.data().count;
    const activeAdmins = activeAdminsSnapshot.data().count;
    
    // Get role distribution from a sample
    const sampleQuery = query(usersRef, limit(500));
    const sampleSnapshot = await getDocs(sampleQuery);
    const sampleUsers = sampleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as User));
    
    const roleDistribution = {
      super_admin: sampleUsers.filter(u => u.role === 'super_admin').length,
      division_admin: sampleUsers.filter(u => u.role === 'division_admin').length,
      district_admin: sampleUsers.filter(u => u.role === 'district_admin').length,
      upazila_admin: sampleUsers.filter(u => u.role === 'upazila_admin').length,
      union_admin: sampleUsers.filter(u => u.role === 'union_admin').length,
      village_admin: sampleUsers.filter(u => u.role === 'village_admin').length,
    };
    
    return {
      totalUsers,
      activeAdmins,
      pendingApprovals,
      roleDistribution,
    };
  });
};

// Location-based stats (using static data to avoid Firestore reads)
export const getLocationStats = (userRole: string, locationScope?: any): Partial<DashboardStats> => {
  // Static location data to avoid Firestore reads
  const staticLocationData = {
    totalDivisions: 8,
    totalDistricts: 64,
    totalUpazilas: 495,
    totalUnions: 4500,
    totalVillages: 87000,
  };
  
  // Calculate location stats based on user role and scope
  let locationStats = { ...staticLocationData };
  
  if (locationScope?.division_id) {
    // Filter based on division
    locationStats.totalDistricts = 8; // Average districts per division
  }
  
  if (locationScope?.district_id) {
    // Filter based on district
    locationStats.totalUpazilas = 8; // Average upazilas per district
  }
  
  if (locationScope?.upazila_id) {
    // Filter based on upazila
    locationStats.totalUnions = 9; // Average unions per upazila
  }
  
  if (locationScope?.union_id) {
    // Filter based on union
    locationStats.totalVillages = 20; // Average villages per union
  }
  
  return { locationStats };
};

// Combined stats for dashboard
export const getDashboardStats = async (userRole: string, locationScope?: any): Promise<DashboardStats> => {
  const [voterStats, userStats] = await Promise.all([
    getVoterStats(locationScope),
    userRole === 'super_admin' ? getUserStats() : Promise.resolve({}),
  ]);
  
  const locationStats = getLocationStats(userRole, locationScope);
  
  return {
    ...voterStats,
    ...userStats,
    ...locationStats,
  };
};

// Clear cache (useful for testing or manual refresh)
export const clearStatsCache = () => {
  statsCache.clear();
};

// Get real-time stats with minimal Firestore reads
export const getRealTimeStats = async (userRole: string, locationScope?: any) => {
  // For real-time updates, we can implement WebSocket or polling
  // For now, return cached stats with a shorter cache duration
  return getDashboardStats(userRole, locationScope);
}; 