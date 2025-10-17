import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send, Users, DollarSign, RefreshCw, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTableData } from '@/hooks/useTableData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { apiClient } from '@/api/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface SenderMask {
  maskId: string;
  isActive: boolean;
  displayName: string;
  phoneNumber: string;
}

interface SMSCredentials {
  verificationStage: string;
  availableCredits: number;
  totalCreditsGranted: number;
  totalCreditsUsed: number;
  maskIds: string[];
  senderMasks: SenderMask[];
  isActive: boolean;
}

interface PaymentSubmission {
  id: string;
  instituteId: string;
  submittedBy: string;
  requestedCredits: number;
  paymentAmount: string;
  paymentMethod: string;
  paymentReference: string;
  paymentSlipUrl: string | null;
  paymentSlipFilename: string;
  status: string;
  creditsGranted: number;
  costPerCredit: string | null;
  verifiedBy: string;
  verifiedAt: string;
  rejectionReason: string | null;
  adminNotes: string;
  submissionNotes: string;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
}

const SMS = () => {
  const { currentInstituteId } = useAuth();
  const instituteRole = useInstituteRole();
  const { toast } = useToast();

  // SMS Credentials state
  const [credentials, setCredentials] = useState<SMSCredentials | null>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [selectedMaskId, setSelectedMaskId] = useState<string>('');

  // Bulk SMS state
  const [bulkMessage, setBulkMessage] = useState('');
  const [recipientType, setRecipientType] = useState<string>('STUDENTS');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedUserTypes, setSelectedUserTypes] = useState<string[]>([]);
  const [bulkScheduledAt, setBulkScheduledAt] = useState('');
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [isBulkNow, setIsBulkNow] = useState(true);

  // Payment submissions state
  const [paymentSubmissions, setPaymentSubmissions] = useState<PaymentSubmission[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [paymentsTotal, setPaymentsTotal] = useState(0);
  const paymentsLimit = 10;
  const [selectedPayment, setSelectedPayment] = useState<PaymentSubmission | null>(null);
  const [viewPaymentDialogOpen, setViewPaymentDialogOpen] = useState(false);

  // Custom SMS state
  const [customMessage, setCustomMessage] = useState('');
  const [customRecipients, setCustomRecipients] = useState<Array<{ name: string; phoneNumber: string }>>([]);
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [isCustomSending, setIsCustomSending] = useState(false);
  const [isCustomNow, setIsCustomNow] = useState(true);
  const [customScheduledAt, setCustomScheduledAt] = useState('');

  // Input states for adding IDs
  const [newClassId, setNewClassId] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('');

  // Auto-set scheduled time when component mounts (Sri Lanka timezone)
  useEffect(() => {
    const getSriLankaTime = () => {
      const now = new Date();
      // Convert to Sri Lanka time (UTC+5:30)
      const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      return sriLankaTime.toISOString().slice(0, 16);
    };
    const sriLankaTime = getSriLankaTime();
    setBulkScheduledAt(sriLankaTime);
    setCustomScheduledAt(sriLankaTime);
  }, []);

  // Fetch SMS credentials on mount and when institute changes
  useEffect(() => {
    if (currentInstituteId) {
      fetchCredentials();
      fetchPaymentSubmissions();
    }
  }, [currentInstituteId, paymentsPage]);

  const fetchPaymentSubmissions = async () => {
    if (!currentInstituteId) return;
    
    setLoadingPayments(true);
    try {
      const response: any = await apiClient.get(
        `/sms/payment-submissions/${currentInstituteId}?page=${paymentsPage}&limit=${paymentsLimit}`
      );
      
      // Handle both single object and array responses
      if (response.items) {
        setPaymentSubmissions(response.items);
        setPaymentsTotal(response.total || 0);
      } else if (Array.isArray(response)) {
        setPaymentSubmissions(response);
        setPaymentsTotal(response.length);
      } else {
        // Single object response
        setPaymentSubmissions([response]);
        setPaymentsTotal(1);
      }
    } catch (error) {
      console.error('Failed to fetch payment submissions:', error);
      setPaymentSubmissions([]);
      setPaymentsTotal(0);
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchCredentials = async () => {
    if (!currentInstituteId) {
      console.log('❌ No currentInstituteId, skipping fetch');
      return;
    }
    
    console.log('🔄 Fetching SMS credentials for institute:', currentInstituteId);
    setLoadingCredentials(true);
    try {
      const response = await apiClient.get(`/sms/credentials/status?instituteId=${currentInstituteId}`);
      console.log('✅ SMS credentials response:', response);
      setCredentials(response as SMSCredentials);
      console.log('✅ Credentials set successfully:', response);
    } catch (error) {
      console.error('❌ Failed to fetch SMS credentials:', error);
      toast({
        title: 'Warning',
        description: 'Could not load SMS credits information',
        variant: 'destructive',
      });
    } finally {
      setLoadingCredentials(false);
    }
  };

  // Check if user has permission
  const allowedRoles = new Set(['InstituteAdmin', 'INSTITUTE_ADMIN']);
  if (!allowedRoles.has(String(instituteRole))) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Only Institute Admins can access SMS features.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentInstituteId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>No Institute Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please select an institute to send SMS.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBulkSMS = async () => {
    if (!bulkMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMaskId) {
      toast({
        title: 'Error',
        description: 'Please select a mask ID',
        variant: 'destructive',
      });
      return;
    }

    if (selectedUserTypes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one user type',
        variant: 'destructive',
      });
      return;
    }

    setIsBulkSending(true);
    try {
      const response: any = await apiClient.post(
        `/sms/send-bulk?instituteId=${currentInstituteId}`,
        {
          messageTemplate: bulkMessage,
          recipientType: recipientType,
          classIds: selectedClasses,
          subjectIds: selectedSubjects,
          userTypes: selectedUserTypes,
          maskId: selectedMaskId,
          isNow: isBulkNow,
          scheduledAt: isBulkNow ? new Date().toISOString() : bulkScheduledAt,
        }
      );

      toast({
        title: 'Success',
        description: `${response.message || 'SMS scheduled successfully'}. Recipients: ${response.totalRecipients || 0}. Estimated Credits: ${response.estimatedCredits || 0}`,
      });

      // Reset form
      setBulkMessage('');
      setRecipientType('STUDENTS');
      setSelectedClasses([]);
      setSelectedSubjects([]);
      setSelectedUserTypes([]);
      const now = new Date();
      const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      setBulkScheduledAt(sriLankaTime.toISOString().slice(0, 16));
      setIsBulkNow(true);
      
      // Refresh credentials
      fetchCredentials();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send bulk SMS',
        variant: 'destructive',
      });
    } finally {
      setIsBulkSending(false);
    }
  };


  const toggleUserType = (userType: string) => {
    setSelectedUserTypes((prev) =>
      prev.includes(userType) ? prev.filter((t) => t !== userType) : [...prev, userType]
    );
  };

  const addClassId = () => {
    if (newClassId.trim() && !selectedClasses.includes(newClassId.trim())) {
      setSelectedClasses([...selectedClasses, newClassId.trim()]);
      setNewClassId('');
    }
  };

  const removeClassId = (id: string) => {
    setSelectedClasses(selectedClasses.filter(c => c !== id));
  };

  const addSubjectId = () => {
    if (newSubjectId.trim() && !selectedSubjects.includes(newSubjectId.trim())) {
      setSelectedSubjects([...selectedSubjects, newSubjectId.trim()]);
      setNewSubjectId('');
    }
  };

  const removeSubjectId = (id: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== id));
  };


  const addCustomRecipient = () => {
    if (!customName.trim() || !customPhone.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter both name and phone number',
        variant: 'destructive',
      });
      return;
    }

    const phoneRegex = /^\+94\d{9}$/;
    if (!phoneRegex.test(customPhone.trim())) {
      toast({
        title: 'Error',
        description: 'Phone number must be in format +94XXXXXXXXX',
        variant: 'destructive',
      });
      return;
    }

    setCustomRecipients([...customRecipients, { name: customName.trim(), phoneNumber: customPhone.trim() }]);
    setCustomName('');
    setCustomPhone('');
  };

  const removeCustomRecipient = (index: number) => {
    setCustomRecipients(customRecipients.filter((_, i) => i !== index));
  };

  const handleCustomSMS = async () => {
    if (!customMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    if (customRecipients.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one recipient',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedMaskId) {
      toast({
        title: 'Error',
        description: 'Please select a mask ID',
        variant: 'destructive',
      });
      return;
    }

    setIsCustomSending(true);
    try {
      const response: any = await apiClient.post('/sms/send-custom', {
        messageTemplate: customMessage,
        customRecipients,
        maskId: selectedMaskId,
        isNow: isCustomNow,
        scheduledAt: isCustomNow ? new Date().toISOString() : customScheduledAt,
      });

      toast({
        title: 'Success',
        description: `${response.message || 'SMS scheduled successfully'}. Recipients: ${response.totalRecipients}. Status: ${response.status}`,
      });

      // Reset form
      setCustomMessage('');
      setCustomRecipients([]);
      setCustomName('');
      setCustomPhone('');
      const now = new Date();
      const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      setCustomScheduledAt(sriLankaTime.toISOString().slice(0, 16));
      setIsCustomNow(true);
      
      // Refresh credentials
      fetchCredentials();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to send custom SMS',
        variant: 'destructive',
      });
    } finally {
      setIsCustomSending(false);
    }
  };

  console.log('🎨 Rendering SMS component, credentials:', credentials);
  console.log('🏢 Current Institute ID:', currentInstituteId);
  
  const [activeTab, setActiveTab] = useState('bulk');

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* SMS Credits Display */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Credits Information
            </CardTitle>
            <div className="flex items-center gap-2">
              {credentials && (
                <Badge variant={credentials.isActive ? 'default' : 'destructive'}>
                  {credentials.isActive ? 'Active' : 'Inactive'}
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={fetchCredentials} disabled={loadingCredentials}>
                <RefreshCw className={`h-4 w-4 ${loadingCredentials ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loadingCredentials ? (
            <p className="text-muted-foreground">Loading SMS credentials...</p>
          ) : credentials ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Available Credits</p>
                <p className="text-2xl font-bold text-primary">{Math.floor(Number(credentials.availableCredits))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Used</p>
                <p className="text-2xl font-bold">{Number(credentials.totalCreditsUsed)}</p>
              </div>
              <div>
                <Label htmlFor="mask-id">Mask Name</Label>
                <Select value={selectedMaskId} onValueChange={setSelectedMaskId}>
                  <SelectTrigger id="mask-id" className="mt-1">
                    <SelectValue placeholder="Select a mask" />
                  </SelectTrigger>
                  <SelectContent>
                    {credentials.senderMasks && credentials.senderMasks.map((mask) => (
                      <SelectItem key={mask.maskId} value={mask.maskId}>
                        <div className="flex flex-col">
                          <span className="font-medium">{mask.displayName}</span>
                          <span className="text-xs text-muted-foreground">{mask.phoneNumber}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No credentials data available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            SMS Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="bulk" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <Users className="h-4 w-4 shrink-0" />
                <span className={activeTab === "bulk" ? "" : "hidden sm:inline"}>
                  Bulk SMS
                </span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className={activeTab === "custom" ? "" : "hidden sm:inline"}>
                  Custom SMS
                </span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
                <DollarSign className="h-4 w-4 shrink-0" />
                <span className={activeTab === "payments" ? "" : "hidden sm:inline"}>
                  Payments
                </span>
              </TabsTrigger>
            </TabsList>

            {/* Bulk SMS Tab */}
            <TabsContent value="bulk" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-message">Message Template</Label>
                  <Textarea
                    id="bulk-message"
                    placeholder="Dear {{firstName}}, your class schedule has been updated..."
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use {`{{firstName}}`} and {`{{lastName}}`} as placeholders
                  </p>
                </div>

                <div>
                  <Label htmlFor="recipient-type">Recipient Type</Label>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger id="recipient-type" className="mt-2">
                      <SelectValue placeholder="Select recipient type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CUSTOM">Custom</SelectItem>
                      <SelectItem value="STUDENTS">Students</SelectItem>
                      <SelectItem value="TEACHERS">Teachers</SelectItem>
                      <SelectItem value="PARENTS">Parents</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="ALL">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>User Types</Label>
                  <div className="flex flex-wrap gap-4 mt-2">
                    {['STUDENT', 'TEACHER', 'PARENT', 'ATTENDANCE_MARKER'].map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`usertype-${type}`}
                          checked={selectedUserTypes.includes(type)}
                          onCheckedChange={() => toggleUserType(type)}
                        />
                        <label htmlFor={`usertype-${type}`} className="text-sm cursor-pointer">
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="class-ids">Class IDs</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="class-ids"
                      placeholder="Enter class ID"
                      value={newClassId}
                      onChange={(e) => setNewClassId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addClassId()}
                    />
                    <Button type="button" onClick={addClassId} size="icon" variant="outline">
                      +
                    </Button>
                  </div>
                  {selectedClasses.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedClasses.map((id) => (
                        <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => removeClassId(id)}>
                          {id} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="subject-ids">Subject IDs</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="subject-ids"
                      placeholder="Enter subject ID"
                      value={newSubjectId}
                      onChange={(e) => setNewSubjectId(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSubjectId()}
                    />
                    <Button type="button" onClick={addSubjectId} size="icon" variant="outline">
                      +
                    </Button>
                  </div>
                  {selectedSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSubjects.map((id) => (
                        <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => removeSubjectId(id)}>
                          {id} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="bulk-scheduled">Scheduled At</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bulk-is-now"
                        checked={isBulkNow}
                        onCheckedChange={(checked) => {
                          setIsBulkNow(checked as boolean);
                          const now = new Date();
                          const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
                          setBulkScheduledAt(sriLankaTime.toISOString().slice(0, 16));
                        }}
                      />
                      <label htmlFor="bulk-is-now" className="text-sm cursor-pointer">
                        Send Now
                      </label>
                    </div>
                  </div>
                  <Input
                    id="bulk-scheduled"
                    type="datetime-local"
                    value={bulkScheduledAt}
                    onChange={(e) => setBulkScheduledAt(e.target.value)}
                    disabled={isBulkNow}
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleBulkSMS} disabled={isBulkSending} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {isBulkSending ? 'Sending...' : 'Send Bulk SMS'}
                </Button>
              </div>
            </TabsContent>

            {/* Custom SMS Tab */}
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="custom-message">Message Template</Label>
                  <Textarea
                    id="custom-message"
                    placeholder="Hello {{name}}, welcome to our institute! Your admission is confirmed."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Use {`{{name}}`} as placeholder for recipient name
                  </p>
                </div>

                <div>
                  <Label>Add Recipients</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <Input
                      placeholder="Recipient Name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addCustomRecipient()}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="+94771234567"
                        value={customPhone}
                        onChange={(e) => setCustomPhone(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomRecipient()}
                      />
                      <Button type="button" onClick={addCustomRecipient} size="icon" variant="outline">
                        +
                      </Button>
                    </div>
                  </div>
                  {customRecipients.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium">Recipients ({customRecipients.length}):</p>
                      <div className="flex flex-wrap gap-2">
                        {customRecipients.map((recipient, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="cursor-pointer px-3 py-1"
                            onClick={() => removeCustomRecipient(index)}
                          >
                            {recipient.name} - {recipient.phoneNumber} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="custom-scheduled">Scheduled At</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="custom-is-now"
                        checked={isCustomNow}
                        onCheckedChange={(checked) => {
                          setIsCustomNow(checked as boolean);
                          const now = new Date();
                          const sriLankaTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
                          setCustomScheduledAt(sriLankaTime.toISOString().slice(0, 16));
                        }}
                      />
                      <label htmlFor="custom-is-now" className="text-sm cursor-pointer">
                        Send Now
                      </label>
                    </div>
                  </div>
                  <Input
                    id="custom-scheduled"
                    type="datetime-local"
                    value={customScheduledAt}
                    onChange={(e) => setCustomScheduledAt(e.target.value)}
                    disabled={isCustomNow}
                    className="mt-2"
                  />
                </div>

                <Button onClick={handleCustomSMS} disabled={isCustomSending} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  {isCustomSending ? 'Sending...' : 'Send Custom SMS'}
                </Button>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Payment Submissions</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchPaymentSubmissions}
                    disabled={loadingPayments}
                  >
                    <RefreshCw className={`h-4 w-4 ${loadingPayments ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {loadingPayments ? (
                  <p className="text-muted-foreground">Loading payment submissions...</p>
                ) : (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Payment Ref</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Credits Requested</TableHead>
                          <TableHead>Credits Granted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paymentSubmissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                              No payment submissions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          paymentSubmissions.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-medium">#{payment.id}</TableCell>
                              <TableCell>{payment.paymentReference}</TableCell>
                              <TableCell>Rs. {payment.paymentAmount}</TableCell>
                              <TableCell>{payment.paymentMethod}</TableCell>
                              <TableCell>{payment.requestedCredits}</TableCell>
                              <TableCell>{payment.creditsGranted}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    payment.status === 'VERIFIED' ? 'default' : 
                                    payment.status === 'PENDING' ? 'secondary' : 
                                    'destructive'
                                  }
                                >
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {payment.submittedAt && new Date(payment.submittedAt).toString() !== 'Invalid Date' 
                                  ? format(new Date(payment.submittedAt), 'MMM dd, yyyy HH:mm')
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPayment(payment);
                                    setViewPaymentDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {paymentSubmissions.length} of {paymentsTotal} submissions
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentsPage(p => Math.max(1, p - 1))}
                      disabled={paymentsPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {paymentsPage} of {Math.ceil(paymentsTotal / paymentsLimit)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPaymentsPage(p => p + 1)}
                      disabled={paymentsPage >= Math.ceil(paymentsTotal / paymentsLimit)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>


          </Tabs>
        </CardContent>
      </Card>

      {/* View Payment Details Dialog */}
      <Dialog open={viewPaymentDialogOpen} onOpenChange={setViewPaymentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Submission Details</DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment ID</label>
                  <p className="text-base">#{selectedPayment.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Institute ID</label>
                  <p className="text-base">{selectedPayment.instituteId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted By</label>
                  <p className="text-base">{selectedPayment.submittedBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge 
                      variant={
                        selectedPayment.status === 'VERIFIED' ? 'default' : 
                        selectedPayment.status === 'PENDING' ? 'secondary' : 
                        'destructive'
                      }
                    >
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Amount</label>
                  <p className="text-base font-semibold">Rs. {selectedPayment.paymentAmount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-base">{selectedPayment.paymentMethod}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Reference</label>
                  <p className="text-base">{selectedPayment.paymentReference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cost Per Credit</label>
                  <p className="text-base">{selectedPayment.costPerCredit || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Requested Credits</label>
                  <p className="text-base">{selectedPayment.requestedCredits}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Credits Granted</label>
                  <p className="text-base font-semibold text-green-600">{selectedPayment.creditsGranted}</p>
                </div>
              </div>

              {selectedPayment.paymentSlipFilename && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Slip</label>
                  <p className="text-base">{selectedPayment.paymentSlipFilename}</p>
                  {selectedPayment.paymentSlipUrl && (
                    <a 
                      href={selectedPayment.paymentSlipUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Payment Slip
                    </a>
                  )}
                </div>
              )}

              {selectedPayment.submissionNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Submission Notes</label>
                  <p className="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                    {selectedPayment.submissionNotes}
                  </p>
                </div>
              )}

              {selectedPayment.adminNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                  <p className="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                    {selectedPayment.adminNotes}
                  </p>
                </div>
              )}

              {selectedPayment.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-red-500">Rejection Reason</label>
                  <p className="text-base text-red-600">{selectedPayment.rejectionReason}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPayment.verifiedBy && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verified By</label>
                    <p className="text-base">{selectedPayment.verifiedBy}</p>
                  </div>
                )}
                {selectedPayment.verifiedAt && new Date(selectedPayment.verifiedAt).toString() !== 'Invalid Date' && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Verified At</label>
                    <p className="text-base">{format(new Date(selectedPayment.verifiedAt), 'PPpp')}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <label className="font-medium">Submitted At</label>
                  <p>{selectedPayment.submittedAt && new Date(selectedPayment.submittedAt).toString() !== 'Invalid Date' ? format(new Date(selectedPayment.submittedAt), 'PPpp') : 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium">Created At</label>
                  <p>{selectedPayment.createdAt && new Date(selectedPayment.createdAt).toString() !== 'Invalid Date' ? format(new Date(selectedPayment.createdAt), 'PPpp') : 'N/A'}</p>
                </div>
                <div>
                  <label className="font-medium">Updated At</label>
                  <p>{selectedPayment.updatedAt && new Date(selectedPayment.updatedAt).toString() !== 'Invalid Date' ? format(new Date(selectedPayment.updatedAt), 'PPpp') : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SMS;
