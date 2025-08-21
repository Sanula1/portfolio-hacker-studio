import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getOrgUrl } from '@/contexts/utils/auth.api';

interface OrganizationLoginProps {
  isOpen: boolean;
  onClose: () => void;
}

interface OrganizationLoginRequest {
  email: string;
  password: string;
}

interface OrganizationLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    organizations: any[];
  };
}

const OrganizationLogin = ({ isOpen, onClose }: OrganizationLoginProps) => {
  const [credentials, setCredentials] = useState<OrganizationLoginRequest>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = getOrgUrl();
      
      if (!baseUrl) {
        toast({
          title: "Error",
          description: "Organization API URL is not configured. Please configure it in Backend Configuration.",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch(`${baseUrl}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Login failed: ${response.status}`);
      }

      const data: OrganizationLoginResponse = await response.json();
      
      // Store organization tokens
      localStorage.setItem('org_access_token', data.accessToken);
      localStorage.setItem('org_refresh_token', data.refreshToken);
      localStorage.setItem('org_user', JSON.stringify(data.user));
      
      toast({
        title: "Success",
        description: "Successfully logged into organization"
      });

      // Reset form and close dialog
      setCredentials({ email: '', password: '' });
      onClose();

    } catch (error) {
      console.error('Organization login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Failed to login to organization",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCredentials({ email: '', password: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Organization Login</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-email">Email</Label>
            <Input
              id="org-email"
              type="email"
              placeholder="Enter your organization email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="org-password">Password</Label>
            <Input
              id="org-password"
              type="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationLogin;