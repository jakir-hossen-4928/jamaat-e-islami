import React, { useMemo } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Phone, MapPin } from 'lucide-react';
import { VoterData } from '@/lib/types';

interface VirtualizedVoterListProps {
  voters: VoterData[];
  onEdit?: (voter: VoterData) => void;
  onDelete?: (voterId: string) => void;
  isLoading?: boolean;
  height?: number;
  itemSize?: number;
}

const VoterCard = React.memo(({ 
  voter, 
  onEdit, 
  onDelete 
}: { 
  voter: VoterData; 
  onEdit?: (voter: VoterData) => void;
  onDelete?: (voterId: string) => void;
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg">{voter['Voter Name'] || 'নাম নেই'}</h3>
            <p className="text-sm text-gray-600">আইডি: {voter.ID}</p>
          </div>
          <div className="flex space-x-2">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(voter)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(voter.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          {voter.Phone && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 mr-2 text-gray-500" />
              {voter.Phone}
            </div>
          )}
          
          {voter['Village Name'] && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              {voter['Village Name']}
            </div>
          )}
          
          <div className="flex space-x-2 mt-3">
            {voter['Will Vote'] && (
              <Badge variant={voter['Will Vote'] === 'Yes' ? 'default' : 'secondary'}>
                ভোট: {voter['Will Vote'] === 'Yes' ? 'হ্যাঁ' : 'না'}
              </Badge>
            )}
            
            {voter['Vote Probability (%)'] && (
              <Badge variant="outline">
                সম্ভাবনা: {voter['Vote Probability (%)']}%
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

VoterCard.displayName = 'VoterCard';

const Row = React.memo(({ index, style, data }: ListChildComponentProps) => {
  const { voters, onEdit, onDelete } = data;
  const voter = voters[index];
  return (
    <div style={style}>
      <VoterCard voter={voter} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
});

const VirtualizedVoterList: React.FC<VirtualizedVoterListProps> = ({
  voters,
  onEdit,
  onDelete,
  isLoading = false,
  height = 600,
  itemSize = 120
}) => {
  const voterList = useMemo(() => voters || [], [voters]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!voterList.length) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500">কোন ভোটার পাওয়া যায়নি</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <List
      height={height}
      itemCount={voterList.length}
      itemSize={itemSize}
      width="100%"
      itemData={{ voters: voterList, onEdit, onDelete }}
    >
      {Row}
    </List>
  );
};

export default VirtualizedVoterList;
