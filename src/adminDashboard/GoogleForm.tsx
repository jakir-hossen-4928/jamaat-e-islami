import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Form } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GoogleForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Google Form embed URL
  const formUrl =
    'https://docs.google.com/forms/d/e/1FAIpQLSfTXOzBLldvEGgfpSeARCQolp-1Lr2hl-GY1CwlUbAyc69NOA/viewform?embedded=true';

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    toast({
      title: 'Error',
      description: 'Failed to load the voter registration form. Please try again later.',
      variant: 'destructive',
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-green-50">
        <CardTitle className="flex items-center gap-2 text-green-800 text-base sm:text-lg">
          <Form className="w-5 h-5" />
          ভোটার যোগ ফর্ম
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading && (
          <div className="flex justify-center items-center h-[600px]">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        )}
        <div className="relative w-full h-[600px] sm:h-[800px]">
          <iframe
            src={formUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Voter Registration Form"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            className="rounded-md"
          >
            Loading…
          </iframe>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleForm;
