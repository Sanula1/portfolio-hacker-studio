import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wifi } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { childAttendanceApi, MarkAttendanceByCardRequest } from '@/api/childAttendance.api';
import AppLayout from '@/components/layout/AppLayout';

const RFIDAttendance = () => {
  const { selectedInstitute, selectedClass, selectedSubject, currentInstituteId, user } = useAuth();
  const { toast } = useToast();
  const [rfidCardId, setRfidCardId] = useState('');
  const [status, setStatus] = useState<'present' | 'absent' | 'late'>('present');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannerStatus, setScannerStatus] = useState('Ready to Scan');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleMarkAttendance = async () => {
    if (!rfidCardId.trim()) {
      toast({
        title: "Error",
        description: "Please enter or scan an RFID card ID",
        variant: "destructive"
      });
      return;
    }

    if (!currentInstituteId || !selectedInstitute?.name) {
      toast({
        title: "Error",
        description: "Please select an institute first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setScannerStatus('Processing...');

    try {
      const request: MarkAttendanceByCardRequest = {
        studentId: rfidCardId.trim(),
        instituteId: currentInstituteId,
        instituteName: selectedInstitute.name,
        address: `${selectedInstitute.name} - RFID Scanner`,
        markingMethod: 'rfid/nfc',
        status: status
      };

      // Include class data if selected
      if (selectedClass) {
        request.classId = selectedClass.id;
        request.className = selectedClass.name;
      }

      // Include subject data if selected
      if (selectedSubject) {
        request.subjectId = selectedSubject.id;
        request.subjectName = selectedSubject.name;
      }

      const result = await childAttendanceApi.markAttendanceByCard(request);

      if (result.success) {
        toast({
          title: "Success",
          description: `Attendance marked for student ${rfidCardId.trim()} as ${status.toUpperCase()}`,
        });
        setRfidCardId('');
        setScannerStatus('Ready to Scan');
        inputRef.current?.focus();
      } else {
        throw new Error(result.message || 'Failed to mark attendance');
      }
    } catch (error) {
      console.error('Attendance marking error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to mark attendance',
        variant: "destructive"
      });
      setScannerStatus('Error - Try Again');
    } finally {
      setIsProcessing(false);
      setTimeout(() => setScannerStatus('Ready to Scan'), 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleMarkAttendance();
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Wifi className="h-6 w-6" />
              RFID Scanner
            </h1>
            <p className="text-sm text-muted-foreground">
              Tap your RFID card or enter the ID manually to mark attendance
            </p>
          </div>

          {/* Scanner Status Card */}
          <Card className="border-muted">
            <CardContent className="p-12 sm:p-16">
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* WiFi Icon with Animation */}
                <div className="relative">
                  <div className="bg-blue-100 dark:bg-blue-950/30 rounded-full p-12">
                    <Wifi className="h-16 w-16 text-blue-600 dark:text-blue-400" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {scannerStatus}
                  </h2>
                  <p className="text-muted-foreground">
                    Place your RFID card near the scanner or enter ID below
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Section */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* RFID Card ID Input */}
            <div className="space-y-2">
              <Label htmlFor="rfid-input" className="text-sm font-medium text-foreground">
                RFID Card ID
              </Label>
              <Input
                id="rfid-input"
                ref={inputRef}
                type="text"
                placeholder="Scan or enter RFID card ID..."
                value={rfidCardId}
                onChange={(e) => setRfidCardId(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isProcessing}
                className="h-12 text-base border-2 border-blue-500 focus:border-blue-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <Label htmlFor="status-select" className="text-sm font-medium text-foreground">
                Status
              </Label>
              <Select 
                value={status} 
                onValueChange={(value: 'present' | 'absent' | 'late') => setStatus(value)}
                disabled={isProcessing}
              >
                <SelectTrigger id="status-select" className="h-12 text-base border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mark Attendance Button */}
          <Button
            onClick={handleMarkAttendance}
            disabled={isProcessing || !rfidCardId.trim()}
            className="w-full h-14 text-lg font-medium bg-blue-500 hover:bg-blue-600 text-white"
            size="lg"
          >
            {isProcessing ? 'Processing...' : 'Mark Attendance'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default RFIDAttendance;