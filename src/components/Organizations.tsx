import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, Users, BookOpen, Eye, Globe, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Organization } from '@/contexts/types/auth.types';
import { getOrgUrl, getApiHeaders } from '@/contexts/utils/auth.api';
import { toast } from 'sonner';

const Organizations = () => {
  const { user, setOrganizationLoggedIn, setSelectedOrganization } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has restricted role
  const isRestrictedUser = user?.userType && ['InstituteAdmin', 'Teacher', 'Student'].includes(user.userType);

  const loadOrganizations = async () => {
    if (!isRestrictedUser) {
      toast.error('Access denied. This feature is only available for InstituteAdmin, Teacher, and Student users.');
      return;
    }

    setIsLoading(true);
    try {
      const orgUrl = getOrgUrl();
      if (!orgUrl) {
        toast.error('Organization service not configured');
        return;
      }

      const response = await fetch(`${orgUrl}/organization/api/v1/organizations/user/enrolled`, {
        method: 'GET',
        headers: getApiHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to load organizations: ${response.status}`);
      }

      const data = await response.json();
      setOrganizations(data.data || []);
      toast.success(`Loaded ${data.data?.length || 0} organizations`);
    } catch (error) {
      console.error('Error loading organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    toast.success(`Selected organization: ${organization.name}`);
  };

  const handleBackToMain = () => {
    setOrganizationLoggedIn(false);
  };

  const getTypeIcon = (type: string) => {
    return type === 'GLOBAL' ? Globe : Building2;
  };

  const getTypeColor = (type: string) => {
    return type === 'GLOBAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return 'bg-purple-100 text-purple-800';
      case 'MODERATOR':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToMain}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Main
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Organizations</h1>
            <p className="text-muted-foreground">View your enrolled organizations</p>
          </div>
        </div>
        <Button onClick={loadOrganizations} disabled={isLoading || !isRestrictedUser}>
          {isLoading ? 'Loading...' : 'Load Organizations'}
        </Button>
      </div>

      {!isRestrictedUser && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <Shield className="h-4 w-4" />
              <p className="text-sm">Access denied. This feature is only available for InstituteAdmin, Teacher, and Student users.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => {
          const TypeIcon = getTypeIcon(org.type);
          
          return (
            <Card key={org.organizationId} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <TypeIcon className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                  </div>
                  {org.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className={getTypeColor(org.type)}>
                    {org.type}
                  </Badge>
                  <Badge className={getRoleColor(org.userRole)}>
                    {org.userRole}
                  </Badge>
                  {org.isPublic && (
                    <Badge variant="outline" className="text-blue-600">
                      <Eye className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{org.memberCount} members</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{org.causeCount} courses</span>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Joined: {new Date(org.joinedAt).toLocaleDateString()}
                </div>
                
                <Button 
                  onClick={() => handleSelectOrganization(org)}
                  className="w-full"
                  size="sm"
                >
                  Select Organization
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {organizations.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No organizations found. Click "Load Organizations" to fetch your enrolled organizations.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Organizations;