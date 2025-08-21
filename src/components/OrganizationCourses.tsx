import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe, Lock, Target, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { getOrgUrl } from '@/contexts/utils/auth.api';
import { useAuth } from '@/contexts/AuthContext';

interface Course {
  causeId: string;
  title: string;
  description: string;
  isPublic: boolean;
  organizationId: string;
}

interface CoursesResponse {
  data: Course[];
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

const OrganizationCourses = () => {
  const { selectedOrganization, setSelectedCourse, setSelectedOrganization } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadOrganizationCourses = async () => {
    if (!selectedOrganization) {
      toast.error('No organization selected');
      return;
    }

    setIsLoading(true);
    try {
      const orgToken = localStorage.getItem('org_access_token');
      if (!orgToken) {
        toast.error('Organization access token not found');
        return;
      }

      const baseUrl = getOrgUrl();
      const response = await fetch(
        `${baseUrl}/organization/api/v1/organizations/${selectedOrganization.organizationId}/causes`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${orgToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to load courses');
      }

      const data: CoursesResponse = await response.json();
      setCourses(data.data);
      setHasLoaded(true);
      toast.success('Courses loaded successfully!');
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    toast.success(`Selected course: ${course.title}`);
  };

  const handleBackToOrganizations = () => {
    setSelectedOrganization(null);
  };

  if (!selectedOrganization) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Organization Selected</h3>
            <p className="text-muted-foreground text-center">
              Please select an organization first to view its courses.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToOrganizations}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Organizations
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-2">
              Courses from {selectedOrganization.name}
            </p>
          </div>
        </div>
        <Button 
          onClick={loadOrganizationCourses}
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
              <BookOpen className="h-4 w-4" />
              Load Courses
            </>
          )}
        </Button>
      </div>

      {hasLoaded && courses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Courses Found</h3>
            <p className="text-muted-foreground text-center">
              This organization doesn't have any courses yet.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.causeId} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg text-foreground flex-1 pr-2">
                  {course.title}
                </CardTitle>
                <div className="flex items-center">
                  {course.isPublic ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-orange-600" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                {course.description}
              </p>

              <div className="flex items-center gap-2">
                <Badge variant={course.isPublic ? 'default' : 'secondary'}>
                  {course.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>

              <Button 
                onClick={() => handleSelectCourse(course)}
                className="w-full mt-4"
              >
                Select Course
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OrganizationCourses;