import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Images, Upload, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Gallery = () => {
  const { selectedOrganization, setSelectedOrganization } = useAuth();

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToOrganizations}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gallery</h1>
            <p className="text-muted-foreground">
              {selectedOrganization ? `Gallery for ${selectedOrganization.name}` : 'Organization Gallery'}
            </p>
          </div>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Image
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Placeholder gallery items */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <Card key={item} className="hover:shadow-lg transition-shadow">
            <div className="aspect-square bg-muted flex items-center justify-center">
              <Image className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Image {item}</CardTitle>
              <CardDescription className="text-xs">
                Sample gallery image
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <Images className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Gallery feature is coming soon. You'll be able to view and manage organization images here.
          </p>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Upload First Image
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Gallery;