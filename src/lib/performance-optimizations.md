# Dashboard Performance Optimizations

## Overview
This document outlines the performance optimizations implemented to reduce Firestore reads/writes and minimize database costs while providing real-time dashboard statistics.

## Key Optimizations

### 1. Optimized Stats Service (`dashboardStats.ts`)

#### Caching Strategy
- **Cache Duration**: 5 minutes for most stats
- **Cache Key**: Based on user role and location scope
- **Cache Invalidation**: Manual refresh with cache clearing

#### Efficient Data Fetching
- **Count Queries**: Use `getCountFromServer()` instead of fetching all documents
- **Sample-Based Calculations**: Use limited samples (1000 voters, 500 users) for ratios
- **Location Filtering**: Apply filters at query level to reduce data transfer

#### Sample-Based Statistics
```typescript
// Instead of fetching all voters, use sample for ratios
const sampleQuery = query(votersQuery, limit(1000));
const sampleVoters = sampleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Calculate ratios from sample and apply to total
const highPriorityRatio = sampleVoters.filter(v => v['Priority Level'] === 'High').length / sampleSize;
const totalHighPriority = Math.round(totalVoters * highPriorityRatio);
```

### 2. Real-Time Stats Hook (`useRealTimeStats.tsx`)

#### Smart Refetching
- **Refetch Interval**: 30 seconds for real-time updates
- **Stale Time**: 10 seconds to prevent unnecessary refetches
- **Retry Logic**: Exponential backoff with max 30-second delay

#### Query Key Optimization
```typescript
const queryKey = [
  'real-time-stats',
  userRole,
  locationScope?.division_id,
  locationScope?.district_id,
  locationScope?.upazila_id,
  locationScope?.union_id,
  locationScope?.village_id,
];
```

### 3. Reusable Stats Card Component (`stats-card.tsx`)

#### Benefits
- **Reduced Code Duplication**: Single component for all stat cards
- **Consistent Styling**: Unified color schemes and hover effects
- **Navigation Integration**: Built-in link support
- **Performance**: Optimized re-renders with proper prop types

### 4. Location-Based Data Optimization

#### Static Location Data
- **Avoid Firestore Reads**: Use static JSON data for location hierarchies
- **Client-Side Calculations**: Compute location stats locally
- **Cached Location Data**: Load once and reuse across components

#### Location Scope Filtering
```typescript
// Apply filters based on user's access scope
if (locationScope?.division_id) {
  votersQuery = query(votersRef, where('division_id', '==', locationScope.division_id));
}
```

## Cost Reduction Strategies

### 1. Firestore Read Optimization

#### Before Optimization
- Fetching all voter documents for counting
- Multiple separate queries for different stats
- No caching mechanism
- Real-time listeners on large collections

#### After Optimization
- Use `getCountFromServer()` for totals
- Sample-based calculations for detailed stats
- 5-minute cache for repeated queries
- Location-based filtering to reduce data scope

### 2. Query Efficiency

#### Optimized Queries
```typescript
// Efficient count queries
const [totalUsersSnapshot, pendingUsersSnapshot, activeAdminsSnapshot] = await Promise.all([
  getCountFromServer(usersRef),
  getCountFromServer(query(usersRef, where('approved', '==', false))),
  getCountFromServer(query(usersRef, where('approved', '==', true)))
]);
```

#### Batch Operations
- Parallel queries using `Promise.all()`
- Single query for multiple related stats
- Reduced network round trips

### 3. Caching Strategy

#### Multi-Level Caching
1. **React Query Cache**: Automatic caching with stale time
2. **Custom Stats Cache**: 5-minute cache for expensive calculations
3. **Location Data Cache**: Static data loaded once

#### Cache Invalidation
- Manual refresh with cache clearing
- Automatic invalidation on data updates
- Role and location-based cache keys

## Performance Metrics

### Expected Improvements
- **Read Operations**: 70-80% reduction in Firestore reads
- **Data Transfer**: 60-70% reduction in data transfer
- **Response Time**: 50-60% faster dashboard loading
- **Cost Reduction**: 60-80% reduction in Firestore costs

### Monitoring
- Track cache hit rates
- Monitor query performance
- Measure user experience improvements
- Cost tracking and optimization

## Best Practices

### 1. Query Optimization
- Always use `getCountFromServer()` for counts
- Apply filters at query level
- Use compound queries when possible
- Limit result sets with `limit()`

### 2. Caching
- Implement appropriate cache durations
- Use meaningful cache keys
- Clear cache on data updates
- Monitor cache effectiveness

### 3. Real-Time Updates
- Balance real-time needs with cost
- Use appropriate refetch intervals
- Implement smart retry logic
- Provide manual refresh options

### 4. Location-Based Access
- Filter data by user's access scope
- Use static location data
- Implement proper access control
- Cache location hierarchies

## Future Optimizations

### 1. Advanced Caching
- Implement Redis for server-side caching
- Add cache warming strategies
- Implement cache compression

### 2. Data Aggregation
- Use Firestore aggregation queries
- Implement background aggregation jobs
- Store pre-calculated statistics

### 3. Real-Time Improvements
- Implement WebSocket connections
- Use Firestore real-time listeners selectively
- Add optimistic updates

### 4. Monitoring and Analytics
- Add performance monitoring
- Implement cost tracking
- Create optimization dashboards
- Set up alerts for cost spikes

## Implementation Notes

### Files Modified
- `src/lib/dashboardStats.ts` - Optimized stats service
- `src/hooks/useRealTimeStats.tsx` - Real-time stats hook
- `src/components/ui/stats-card.tsx` - Reusable stats component
- `src/dashboards/SuperAdminDashboard.tsx` - Updated dashboard
- `src/dashboards/DivisionAdminDashboard.tsx` - Updated dashboard

### Dependencies
- React Query for caching and state management
- Firestore for data storage
- Lucide React for icons
- React Router for navigation

### Configuration
- Cache duration: 5 minutes
- Refetch interval: 30 seconds
- Stale time: 10 seconds
- Sample size: 1000 voters, 500 users 