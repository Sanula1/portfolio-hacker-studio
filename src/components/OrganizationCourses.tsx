import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Eye, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Course } from '@/contexts/types/auth.types';
import { getOrgUrl, getApiHeaders } from '@/contexts/utils/auth.api';
import { toast } from 'sonner';

const OrganizationCourses = () => {
  const { user, selectedOrganization, setSelectedCourse, setSelectedOrganization } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has restricted role
  const isRestrictedUser = user?.userType && ['InstituteAdmin', 'Teacher', 'Student'].includes(user.userType);

  const loadCourses = async () => {
    if (!isRestrictedUser) {
      toast.error('Access denied. This feature is only available for InstituteAdmin, Teacher, and Student users.');
      return;
    }

    if (!selectedOrganization) {
      toast.error('No organization selected');
      return;
    }

    setIsLoading(true);
    try {
      const orgUrl = getOrgUrl();
      if (!orgUrl) {
        toast.error('Organization service not configured');
        return;
      }

      const response = await fetch(`${orgUrl}/organization/api/v1/organizations/${selectedOrganization.organizationId}/causes`, {
        method: 'GET',
        headers: getApiHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to load courses: ${response.status}`);
      }

      const data = await response.json();
      setCourses(data.data || []);
      toast.success(`Loaded ${data.data?.length || 0} courses`);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses');
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToOrganizations}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Organization Courses</h1>
            <p className="text-muted-foreground">
              {selectedOrganization ? `Courses in ${selectedOrganization.name}` : 'Select an organization first'}
            </p>
          </div>
        </div>
        <Button onClick={loadCourses} disabled={isLoading || !isRestrictedUser || !selectedOrganization}>
          {isLoading ? 'Loading...' : 'Load Courses'}
        </Button>
      </div>

      {!selectedOrganization && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-600">Please select an organization first to view its courses.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.causeId} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <Badge variant={course.isPublic ? "secondary" : "outline"}>
                  {course.isPublic ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      Public
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription className="text-sm">
                {course.description}
              </CardDescription>
              
              <div className="text-xs text-muted-foreground">
                Course ID: {course.causeId}
              </div>
              
              <Button 
                onClick={() => handleSelectCourse(course)}
                className="w-full"
                size="sm"
              >
                Select Course
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && !isLoading && selectedOrganization && (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No courses found. Click "Load Courses" to fetch courses for this organization.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrganizationCourses;