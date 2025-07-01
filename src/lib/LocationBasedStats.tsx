import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Phone, 
  Vote, 
  GraduationCap, 
  MapPin,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import { VoterData } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { canAccessLocation } from '@/lib/locationAccess';

interface LocationBasedStatsProps {
  voters: VoterData[];
}

const LocationBasedStats: React.FC<LocationBasedStatsProps> = ({ voters }) => {
  const { userProfile } = useAuth();

  // Filter voters based on user's access scope
  const accessibleVoters = useMemo(() => {
    if (!Array.isArray(voters)) return [];
    
    if (userProfile?.role === 'super_admin') {
      return voters;
    }
    
    return voters.filter(voter => canAccessLocation(userProfile, voter));
  }, [voters, userProfile]);

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const total = accessibleVoters.length;
    const willVote = accessibleVoters.filter(v => v['Will Vote'] === 'Yes').length;
    const wontVote = accessibleVoters.filter(v => v['Will Vote'] === 'No').length;
    const undecided = total - willVote - wontVote;
    const withPhone = accessibleVoters.filter(v => v.Phone).length;
    const students = accessibleVoters.filter(v => v.Student === 'Yes').length;
    const male = accessibleVoters.filter(v => v.Gender === 'Male').length;
    const female = accessibleVoters.filter(v => v.Gender === 'Female').length;
    const other = total - male - female;
    const young = accessibleVoters.filter(v => v.Age && v.Age <= 35).length;
    const elderly = accessibleVoters.filter(v => v.Age && v.Age >= 60).length;
    const highProbability = accessibleVoters.filter(v => 
      v['Vote Probability (%)'] && v['Vote Probability (%)'] >= 70
    ).length;
    const votedBefore = accessibleVoters.filter(v => v['Voted Before'] === 'Yes').length;
    const firstTime = accessibleVoters.filter(v => v['Voted Before'] === 'No').length;

    return {
      total,
      willVote,
      wontVote,
      undecided,
      withPhone,
      students,
      male,
      female,
      other,
      young,
      elderly,
      highProbability,
      votedBefore,
      firstTime,
      willVotePercentage: total > 0 ? Math.round((willVote / total) * 100) : 0,
      phonePercentage: total > 0 ? Math.round((withPhone / total) * 100) : 0,
      studentPercentage: total > 0 ? Math.round((students / total) * 100) : 0,
      youngPercentage: total > 0 ? Math.round((young / total) * 100) : 0
    };
  }, [accessibleVoters]);

  // Get location display name
  const getLocationDisplay = () => {
    if (userProfile?.role === 'super_admin') {
      return 'All Locations';
    }
    
    const scope = userProfile?.accessScope;
    if (!scope) return 'Unknown Area';
    
    const parts = [
      scope.division_name,
      scope.district_name,
      scope.upazila_name,
      scope.union_name,
      scope.village_name
    ].filter(Boolean);
    
    return parts.join(', ') || 'Specific Area';
  };

  const statCards = [
    {
      title: 'Total Voters',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: getLocationDisplay()
    },
    {
      title: 'Will Vote',
      value: stats.willVote,
      icon: Vote,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `${stats.willVotePercentage}% of total`
    },
    {
      title: 'With Phone',
      value: stats.withPhone,
      icon: Phone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: `${stats.phonePercentage}% of total`
    },
    {
      title: 'Students',
      value: stats.students,
      icon: GraduationCap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: `${stats.studentPercentage}% of total`
    }
  ];

  const demographicCards = [
    {
      title: 'Gender Distribution',
      items: [
        { label: 'Male', value: stats.male, color: 'bg-blue-500' },
        { label: 'Female', value: stats.female, color: 'bg-pink-500' },
        { label: 'Other', value: stats.other, color: 'bg-gray-500' }
      ]
    },
    {
      title: 'Age Groups',
      items: [
        { label: 'Young (≤35)', value: stats.young, color: 'bg-green-500' },
        { label: 'Middle Age', value: stats.total - stats.young - stats.elderly, color: 'bg-blue-500' },
        { label: 'Elderly (≥60)', value: stats.elderly, color: 'bg-orange-500' }
      ]
    },
    {
      title: 'Voting History',
      items: [
        { label: 'Voted Before', value: stats.votedBefore, color: 'bg-green-500' },
        { label: 'First Time', value: stats.firstTime, color: 'bg-yellow-500' },
        { label: 'Unknown', value: stats.total - stats.votedBefore - stats.firstTime, color: 'bg-gray-500' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Location Header */}
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Location Statistics</h2>
        </div>
        <Badge variant="outline" className="text-sm">
          {getLocationDisplay()}
        </Badge>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
          </CardHeader>
          <CardContent>
              <div className="text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
          </CardContent>
        </Card>
        ))}
      </div>

      {/* Voting Intent Breakdown */}
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Voting Intent Analysis
          </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.willVote}</div>
              <div className="text-sm text-green-700">Will Vote</div>
              <div className="text-xs text-green-600 mt-1">{stats.willVotePercentage}%</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.wontVote}</div>
              <div className="text-sm text-red-700">Won't Vote</div>
              <div className="text-xs text-red-600 mt-1">
                {stats.total > 0 ? Math.round((stats.wontVote / stats.total) * 100) : 0}%
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{stats.undecided}</div>
              <div className="text-sm text-yellow-700">Undecided</div>
              <div className="text-xs text-yellow-600 mt-1">
                {stats.total > 0 ? Math.round((stats.undecided / stats.total) * 100) : 0}%
              </div>
            </div>
          </div>
          </CardContent>
        </Card>

      {/* Demographic Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demographicCards.map((card, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
              <div className="space-y-3">
                {card.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-gray-600">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.value.toLocaleString()}</span>
                      <span className="text-xs text-gray-500">
                        ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                ))}
      </div>
          </CardContent>
        </Card>
        ))}
      </div>

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Additional Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{stats.highProbability}</div>
              <div className="text-xs text-gray-600">High Probability (≥70%)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{stats.young}</div>
              <div className="text-xs text-gray-600">Young Voters (≤35)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{stats.elderly}</div>
              <div className="text-xs text-gray-600">Elderly (≥60)</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{stats.firstTime}</div>
              <div className="text-xs text-gray-600">First Time Voters</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationBasedStats;
