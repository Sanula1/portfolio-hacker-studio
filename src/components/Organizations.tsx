import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, BookOpen, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getOrgUrl } from '@/contexts/utils/auth.api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Organization {
  organizationId: string;
  name: string;
  type: 'INSTITUTE' | 'GLOBAL';
  isPublic: boolean;
  needEnrollmentVerification: boolean;
  imageUrl: string | null;
  instituteId: string | null;
  userRole: string;
  isVerified: boolean;
  joinedAt: string;
  memberCount: number;
  causeCount: number;
}

const Organizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isOrganizationLoggedIn, clearOrganizationLogin } = useAuth();
  const navigate = useNavigate();

  const loadEnrolledOrganizations = async () => {
    setIsLoading(true);
    try {
      const baseUrl = getOrgUrl();
      if (!baseUrl) {
        toast.error('Organization server URL is not configured.');
        return;
      }

      const orgToken = localStorage.getItem('org_access_token');
      if (!orgToken) {
        toast.error('Organization authentication required.');
        return;
      }

      const response = await fetch(`${baseUrl}/organization/api/v1/organizations/user/enrolled`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${orgToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load organizations: ${response.status}`);
      }

      const data = await response.json();
      setOrganizations(data.data || []);
      toast.success('Organizations loaded successfully!');
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrganization = (organization: Organization) => {
    // Store selected organization in localStorage or context
    localStorage.setItem('selectedOrganization', JSON.stringify(organization));
    toast.success(`Selected ${organization.name}`);
    // Navigate to organization gallery page
    navigate('/gallery');
  };

  const handleBack = () => {
    clearOrganizationLogin();
    navigate('/');
  };

  if (!isOrganizationLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Organization Login Required</h3>
          <p className="text-muted-foreground">Please login to view your organizations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">My Organizations</h1>
          <p className="text-muted-foreground">View and manage your enrolled organizations</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button onClick={loadEnrolledOrganizations} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading...
            </>
          ) : (
            <>
              <Building2 className="mr-2 h-4 w-4" />
              Load Organizations
            </>
          )}
        </Button>
      </div>

      {organizations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <Card key={org.organizationId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {org.type} • {org.userRole}
                    </CardDescription>
                  </div>
                  {org.imageUrl && (
                    <img 
                      src={org.imageUrl} 
                      alt={org.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={org.isPublic ? "default" : "secondary"}>
                      {org.isPublic ? "Public" : "Private"}
                    </Badge>
                    <Badge variant={org.isVerified ? "default" : "outline"}>
                      {org.isVerified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {org.memberCount} members
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {org.causeCount} courses
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full"
                    onClick={() => handleSelectOrganization(org)}
                  >
                    Select Organization
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {organizations.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Organizations Found</h3>
          <p className="text-muted-foreground">Click "Load Organizations" to view your enrolled organizations.</p>
        </div>
      )}
    </div>
  );
};

export default Organizations;