import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, FileText, Eye, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { homeworkSubmissionsApi, HomeworkSubmission } from '@/api/homeworkSubmissions.api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

const StudentHomeworkSubmissions = () => {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('submissionDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();

  const fetchSubmissions = async () => {
    if (!selectedInstitute || !selectedClass || !selectedSubject || !user?.id) {
      console.log('Missing required selection:', { selectedInstitute, selectedClass, selectedSubject, userId: user?.id });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit,
        sortBy,
        sortOrder
      };

      const response = await homeworkSubmissionsApi.getStudentSubmissions(
        selectedInstitute.id,
        selectedClass.id,
        selectedSubject.id,
        user.id,
        params
      );

      setSubmissions(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error fetching student submissions:', error);
      toast({
        title: "Error",
        description: "Failed to load homework submissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [currentPage, limit, sortBy, sortOrder, selectedInstitute, selectedClass, selectedSubject, user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSubmissions();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('submissionDate');
    setSortOrder('DESC');
    setCurrentPage(1);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubmissions = submissions.filter(submission =>
    searchTerm === '' || 
    submission.homework?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.homework?.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Selection Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Institute: </span>
              <span className="font-semibold">{selectedInstitute?.name}</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Class: </span>
              <span className="font-semibold">{selectedClass?.name}</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Subject: </span>
              <span className="font-semibold">{selectedSubject?.name}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Homework Submissions</h2>
          <p className="text-muted-foreground">
            View your homework submissions and teacher corrections
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {total} Total Submissions
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search homework..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submissionDate">Submission Date</SelectItem>
                    <SelectItem value="createdAt">Created Date</SelectItem>
                    <SelectItem value="updatedAt">Updated Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Select value={sortOrder} onValueChange={(value: 'ASC' | 'DESC') => setSortOrder(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Newest First</SelectItem>
                    <SelectItem value="ASC">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Per Page</label>
                <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 items</SelectItem>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="20">20 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 flex items-end">
                <div className="flex gap-2 w-full">
                  <Button type="submit" className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <Card key={submission.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{submission.homework?.title}</h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {submission.homework?.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Submitted: {format(new Date(submission.submissionDate), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated: {format(new Date(submission.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                  </div>

                  {submission.remarks && (
                    <div className="mb-3 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-1">Remarks:</p>
                      <p className="text-sm">{submission.remarks}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {submission.teacherCorrectionFileUrl ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Corrected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <XCircle className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {submission.teacherCorrectionFileUrl && (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDownload(submission.teacherCorrectionFileUrl!, `correction-${submission.id}.pdf`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Correction
                  </Button>
                )}

                {submission.fileUrl && (
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open(submission.fileUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View My Submission
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, total)} of {total} submissions
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredSubmissions.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Submissions Found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm 
                ? 'No homework submissions match your search criteria.'
                : 'You haven\'t submitted any homework yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentHomeworkSubmissions;