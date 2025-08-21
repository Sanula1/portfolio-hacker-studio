import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl2, getOrgUrl } from '@/contexts/utils/auth.api';

const BackendConfiguration = () => {
  const [apiUrl, setApiUrl] = useState('');
  const [orgUrl, setOrgUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load current URLs from localStorage
    setApiUrl(getBaseUrl2());
    setOrgUrl(getOrgUrl());
  }, []);

  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API URL",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remove trailing slash if present
      const cleanUrl = apiUrl.trim().replace(/\/$/, '');
      localStorage.setItem('baseUrl2', cleanUrl);
      
      toast({
        title: "Success",
        description: "API URL saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save API URL",
        variant: "destructive"
      });
    }
  };

  const handleSaveOrgUrl = () => {
    if (!orgUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Organization URL",
        variant: "destructive"
      });
      return;
    }

    try {
      // Remove trailing slash if present
      const cleanUrl = orgUrl.trim().replace(/\/$/, '');
      localStorage.setItem('orgUrl', cleanUrl);
      
      toast({
        title: "Success",
        description: "Organization URL saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Organization URL",
        variant: "destructive"
      });
    }
  };

  const handleClearApiUrl = () => {
    localStorage.removeItem('baseUrl2');
    setApiUrl('');
    toast({
      title: "Success",
      description: "API URL cleared successfully"
    });
  };

  const handleClearOrgUrl = () => {
    localStorage.removeItem('orgUrl');
    setOrgUrl('');
    toast({
      title: "Success",
      description: "Organization URL cleared successfully"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Backend Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure your backend API endpoints for the application.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Main API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Main API Configuration</CardTitle>
            <CardDescription>
              Configure the main backend API URL for the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url">API Base URL</Label>
              <Input
                id="api-url"
                type="url"
                placeholder="https://your-api-domain.com"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The base URL for your main API endpoints
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveApiUrl}>
                Save API URL
              </Button>
              <Button variant="outline" onClick={handleClearApiUrl}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Organization API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Organization API Configuration</CardTitle>
            <CardDescription>
              Configure the organization backend API URL. This will be used as the base URL for organization endpoints.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org-url">Organization Base URL</Label>
              <Input
                id="org-url"
                type="url"
                placeholder="https://your-org-api-domain.com"
                value={orgUrl}
                onChange={(e) => setOrgUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                The base URL for organization API endpoints. Organization login will use this URL with /api/auth
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveOrgUrl}>
                Save Organization URL
              </Button>
              <Button variant="outline" onClick={handleClearOrgUrl}>
                Clear
              </Button>
            </div>
            
            {orgUrl && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Organization Login Endpoint:</strong><br />
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {orgUrl}/api/auth
                  </code>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration Status</CardTitle>
            <CardDescription>
              Current status of your backend configurations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">Main API:</span>
                <span className={`text-sm ${apiUrl ? 'text-green-600' : 'text-red-600'}`}>
                  {apiUrl ? 'Configured' : 'Not Configured'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm font-medium">Organization API:</span>
                <span className={`text-sm ${orgUrl ? 'text-green-600' : 'text-red-600'}`}>
                  {orgUrl ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackendConfiguration;