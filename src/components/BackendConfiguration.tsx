import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl, getBaseUrl2, getOrgUrl } from '@/contexts/utils/auth.api';

const BackendConfiguration = () => {
  const [backendUrl, setBackendUrl] = useState('');
  const [attendanceBackendUrl, setAttendanceBackendUrl] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load current URLs from localStorage and environment
    setBackendUrl(getBaseUrl());
    setAttendanceBackendUrl(getBaseUrl2() || getOrgUrl());
  }, []);

  const handleSaveBackendUrl = () => {
    if (!backendUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Backend URL",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remove trailing slash if present
      const cleanUrl = backendUrl.trim().replace(/\/$/, '');
      localStorage.setItem('baseUrl', cleanUrl);
      
      toast({
        title: "Success",
        description: "Backend URL saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Backend URL",
        variant: "destructive"
      });
    }
  };

  const handleSaveAttendanceUrl = () => {
    if (!attendanceBackendUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Attendance Backend URL",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remove trailing slash if present
      const cleanUrl = attendanceBackendUrl.trim().replace(/\/$/, '');
      localStorage.setItem('baseUrl2', cleanUrl);
      
      toast({
        title: "Success",
        description: "Attendance Backend URL saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Attendance Backend URL",
        variant: "destructive"
      });
    }
  };

  const testConnection = async () => {
    setIsTestingConnection(true);

    try {
      // Test main backend
      if (backendUrl) {
        try {
          const response = await fetch(`${backendUrl}/health`, {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          });
          
          if (response.ok) {
            toast({
              title: "Backend Connection",
              description: "✅ Main backend is reachable"
            });
          } else {
            toast({
              title: "Backend Connection",
              description: "⚠️ Main backend responded but may have issues",
              variant: "destructive"
            });
          }
        } catch (error) {
          toast({
            title: "Backend Connection",
            description: "❌ Main backend is not reachable",
            variant: "destructive"
          });
        }
      }

      // Test attendance backend
      if (attendanceBackendUrl) {
        try {
          const response = await fetch(`${attendanceBackendUrl}/health`, {
            method: 'GET',
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          });
          
          if (response.ok) {
            toast({
              title: "Attendance Backend Connection",
              description: "✅ Attendance backend is reachable"
            });
          } else {
            toast({
              title: "Attendance Backend Connection",
              description: "⚠️ Attendance backend responded but may have issues",
              variant: "destructive"
            });
          }
        } catch (error) {
          toast({
            title: "Attendance Backend Connection",
            description: "❌ Attendance backend is not reachable",
            variant: "destructive"
          });
        }
      }

    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backend Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure your backend API endpoints for the application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure the backend endpoints for your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Backend URL */}
          <div className="space-y-3">
            <Label htmlFor="backend-url" className="text-base font-medium">
              Backend URL
            </Label>
            <Input
              id="backend-url"
              type="url"
              placeholder="http://localhost:3000"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="text-sm"
            />
            <div className="text-sm text-muted-foreground">
              <strong>Current:</strong> {getBaseUrl() || 'Not configured'}
            </div>
            <Button 
              onClick={handleSaveBackendUrl}
              size="sm"
              className="w-fit"
            >
              Save Backend URL
            </Button>
          </div>

          {/* Attendance Backend URL */}
          <div className="space-y-3">
            <Label htmlFor="attendance-url" className="text-base font-medium">
              Attendance Backend URL
            </Label>
            <Input
              id="attendance-url"
              type="url"
              placeholder="http://localhost:3001"
              value={attendanceBackendUrl}
              onChange={(e) => setAttendanceBackendUrl(e.target.value)}
              className="text-sm"
            />
            <div className="text-sm text-muted-foreground">
              <strong>Current:</strong> {getBaseUrl2() || getOrgUrl() || 'Not configured'}
            </div>
            <Button 
              onClick={handleSaveAttendanceUrl}
              size="sm"
              className="w-fit"
            >
              Save Attendance URL
            </Button>
          </div>

          {/* ngrok Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <strong>For ngrok:</strong> Add <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">--host-header=localhost:3000</code> flag when starting tunnel
            </div>
          </div>

          {/* Test Connection */}
          <div className="pt-4 border-t">
            <Button 
              onClick={testConnection}
              disabled={isTestingConnection}
              variant="outline"
              className="w-full"
            >
              {isTestingConnection ? 'Testing Connection...' : 'Test Connection'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendConfiguration;