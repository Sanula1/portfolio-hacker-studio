import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, RefreshCw, UserCheck, UserX, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/components/layout/AppLayout';
import PageContainer from '@/components/layout/PageContainer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { transportApi, type TransportAttendanceRecord } from '@/api/transport.api';

const TransportAttendance: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { selectedTransport, setSelectedTransport, selectedChild } = useAuth();
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<TransportAttendanceRecord[]>([]);

  useEffect(() => {
    // Set transport from location state if available
    if (location.state?.transport && !selectedTransport) {
      setSelectedTransport(location.state.transport);
    } else if (!location.state?.transport && !selectedTransport) {
      // If no transport in state or context, redirect back
      navigate('/transport');
    }
  }, [location.state, selectedTransport, setSelectedTransport, navigate]);

  const handleBack = () => {
    setSelectedTransport(null);
    navigate(-1);
  };

  const loadAttendance = async () => {
    if (!selectedChild?.id || !selectedTransport?.bookhireId) {
      toast({
        title: "Error",
        description: "Missing student or transport information",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await transportApi.getStudentAttendance(
        selectedChild.id,
        selectedTransport.bookhireId,
        { page: 1, limit: 10 }
      );
      
      setAttendanceRecords(response.data.data);
      toast({
        title: "Success",
        description: `Loaded ${response.data.data.length} attendance records`,
      });
    } catch (error) {
      console.error('Error loading attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild?.id && selectedTransport?.bookhireId) {
      loadAttendance();
    }
  }, [selectedChild?.id, selectedTransport?.bookhireId]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-success/10 text-success border-success/20';
      case 'absent':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'late':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <UserCheck className="h-4 w-4" />;
      case 'absent':
        return <UserX className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!selectedTransport) {
    return (
      <AppLayout currentPage="transport-attendance">
        <PageContainer>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </PageContainer>
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="transport-attendance">
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Transport Attendance</h1>
              <p className="text-muted-foreground">Track your transport usage</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Attendance Records
                </CardTitle>
                <Button onClick={loadAttendance} disabled={loading} size="sm">
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading attendance...</span>
                </div>
              ) : attendanceRecords.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Pickup Time</TableHead>
                        <TableHead>Dropoff Time</TableHead>
                        <TableHead>Locations</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords.map((record, index) => (
                        <TableRow key={`${record.timestamp}-${index}`}>
                          <TableCell className="font-medium">
                            {formatDate(record.attendanceDate)}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge className={getStatusColor(record.pickupStatus)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(record.pickupStatus)}
                                  Pickup: {record.pickupStatus}
                                </div>
                              </Badge>
                              <Badge className={getStatusColor(record.dropoffStatus)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(record.dropoffStatus)}
                                  Dropoff: {record.dropoffStatus}
                                </div>
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.pickupTime || '-'}
                          </TableCell>
                          <TableCell>
                            {record.dropoffTime || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {record.pickupLocation && (
                                <div className="flex items-center gap-1 text-xs">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  {record.pickupLocation}
                                </div>
                              )}
                              {record.dropoffLocation && (
                                <div className="flex items-center gap-1 text-xs">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  {record.dropoffLocation}
                                </div>
                              )}
                              {!record.pickupLocation && !record.dropoffLocation && '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {record.notes || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attendance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default TransportAttendance;
