import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Target, Calendar, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { getOrgUrl } from '@/contexts/utils/auth.api';
import { useAuth } from '@/contexts/AuthContext';

interface Organization {
  organizationId: string;
  name: string;
  type: string;
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

interface OrganizationsResponse {
  data: Organization[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  meta: {
    sortBy: string;
    sortOrder: string;
  };
}

const Organizations = () => {
  const { setSelectedOrganization } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadEnrolledOrganizations = async () => {
    setIsLoading(true);
    try {
      const orgToken = localStorage.getItem('org_access_token');
      if (!orgToken) {
        toast.error('Organization access token not found');
        return;
      }

      const baseUrl = getOrgUrl();
      const response = await fetch(`${baseUrl}/organization/api/v1/organizations/user/enrolled`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${orgToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load organizations');
      }

      const data: OrganizationsResponse = await response.json();
      setOrganizations(data.data);
      setHasLoaded(true);
      toast.success('Organizations loaded successfully!');
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    toast.success(`Selected organization: ${org.name}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return 'bg-primary text-primary-foreground';
      case 'MODERATOR':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Organizations</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your enrolled organizations
          </p>
        </div>
        <Button 
          onClick={loadEnrolledOrganizations}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Loading...
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              Load Organizations
            </>
          )}
        </Button>
      </div>

      {hasLoaded && organizations.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Organizations Found</h3>
            <p className="text-muted-foreground text-center">
              You are not enrolled in any organizations yet.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card key={org.organizationId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground mb-2">
                    {org.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant={org.type === 'GLOBAL' ? 'default' : 'secondary'}>
                      {org.type}
                    </Badge>
                    <Badge className={getRoleColor(org.userRole)}>
                      {org.userRole}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {org.isPublic ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {org.memberCount} members
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {org.causeCount} courses
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Joined {formatDate(org.joinedAt)}
                </span>
              </div>

              {org.isVerified && (
                <Badge variant="outline" className="w-fit">
                  ✓ Verified
                </Badge>
              )}

              <Button 
                onClick={() => handleSelectOrganization(org)}
                className="w-full mt-4"
              >
                Select Organization
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Organizations;