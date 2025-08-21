import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/Dashboard';
import Users from '@/components/Users';
import Students from '@/components/Students';
import Teachers from '@/components/Teachers';
import Parents from '@/components/Parents';
import Grades from '@/components/Grades';
import Classes from '@/components/Classes';
import Subjects from '@/components/Subjects';
import Institutes from '@/components/Institutes';
import Grading from '@/components/Grading';
import Attendance from '@/components/Attendance';
import AttendanceMarking from '@/components/AttendanceMarking';
import AttendanceMarkers from '@/components/AttendanceMarkers';
import QRAttendance from '@/components/QRAttendance';
import Lectures from '@/components/Lectures';
import LiveLectures from '@/components/LiveLectures';
import Homework from '@/components/Homework';
import Exams from '@/components/Exams';
import Results from '@/components/Results';
import Profile from '@/components/Profile';
import InstituteDetails from '@/components/InstituteDetails';
import Login from '@/components/Login';
import InstituteSelector from '@/components/InstituteSelector';
import ClassSelector from '@/components/ClassSelector';
import SubjectSelector from '@/components/SubjectSelector';
import ParentChildrenSelector from '@/components/ParentChildrenSelector';
import Gallery from '@/components/Gallery';
import Settings from '@/components/Settings';
import Appearance from '@/components/Appearance';
import TeacherStudents from '@/components/TeacherStudents';
import TeacherHomework from '@/components/TeacherHomework';
import TeacherExams from '@/components/TeacherExams';
import TeacherLectures from '@/components/TeacherLectures';
import AttendanceMarkerSubjectSelector from '@/components/AttendanceMarkerSubjectSelector';
import InstituteUsers from '@/components/InstituteUsers';
import OrganizationDashboard from '@/components/OrganizationDashboard';

const AppContent = () => {
  const { user, login, selectedInstitute, selectedClass, selectedSubject, selectedChild } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    await login({ email: credentials.email, password: credentials.password });
  };

  const handleUserLogin = (userData: any) => {
    // This is already handled by the login function in auth context
    console.log('User logged in:', userData);
  };

  const renderComponent = () => {
    // For Student role - simplified interface
    if (user?.role === 'Student') {
      if (!selectedInstitute && user.institutes.length === 1) {
        // Auto-select the only institute available
        // This should be handled by the auth context
      }
      
      if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'attendance':
          return <Attendance />;
        case 'lectures':
          return <Lectures />;
        case 'homework':
          return <Homework />;
        case 'exams':
          return <Exams />;
        case 'results':
          return <Results />;
        case 'profile':
          return <Profile />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'appearance':
          return <Appearance />;
        default:
          return <Dashboard />;
      }
    }

    // For Parent role
    if (user?.role === 'Parent') {
      if (currentPage === 'parent-children') {
        return <ParentChildrenSelector />;
      }

      if (!selectedChild && currentPage !== 'parent-children' && currentPage !== 'profile') {
        return <ParentChildrenSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'attendance':
          return <Attendance />;
        case 'homework':
          return <Homework />;
        case 'results':
          return <Results />;
        case 'exams':
          return <Exams />;
        case 'profile':
          return <Profile />;
        case 'parent-children':
          return <ParentChildrenSelector />;
        case 'appearance':
          return <Appearance />;
        default:
          return <ParentChildrenSelector />;
      }
    }

    // For Teacher role
    if (user?.role === 'Teacher') {
      if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      if (currentPage === 'select-class') {
        return <ClassSelector />;
      }

      if (currentPage === 'select-subject') {
        return <SubjectSelector />;
      }

      const classRequiredPages = ['attendance-marking', 'grading'];
      if (selectedInstitute && !selectedClass && classRequiredPages.includes(currentPage)) {
        return <ClassSelector />;
      }

      const subjectRequiredPages = ['lectures'];
      if (selectedClass && !selectedSubject && subjectRequiredPages.includes(currentPage)) {
        return <SubjectSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'students':
          return <Students />;
        case 'parents':
          return <Parents />;
        case 'classes':
          return <Classes />;
        case 'subjects':
          return <Subjects />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'grading':
        case 'grades-table':
        case 'create-grade':
        case 'assign-grade-classes':
        case 'view-grade-classes':
          return <Grading />;
        case 'attendance':
          return <Attendance />;
        case 'attendance-marking':
          return <AttendanceMarking onNavigate={setCurrentPage} />;
        case 'qr-attendance':
          return <QRAttendance />;
        case 'lectures':
          return user?.role === 'Teacher' ? <TeacherLectures /> : <Lectures />;
        case 'homework':
          return user?.role === 'Teacher' ? <TeacherHomework /> : <Homework />;
        case 'exams':
          return user?.role === 'Teacher' ? <TeacherExams /> : <Exams />;
        case 'results':
          return <Results />;
        case 'profile':
          return <Profile />;
        case 'appearance':
          return <Appearance />;
        default:
          return <Dashboard />;
      }
    }

    // For AttendanceMarker role
    if (user?.role === 'AttendanceMarker') {
      if (!selectedInstitute && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      if (currentPage === 'select-class') {
        return <ClassSelector />;
      }

      if (currentPage === 'select-subject') {
        return <AttendanceMarkerSubjectSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'qr-attendance':
          return <QRAttendance />;
        case 'attendance-marking':
          return <AttendanceMarking onNavigate={setCurrentPage} />;
        case 'profile':
          return <Profile />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'select-class':
          return <ClassSelector />;
        case 'appearance':
          return <Appearance />;
        case 'settings':
          return <Settings />;
        default:
          return <QRAttendance />;
      }
    }

    // For InstituteAdmin and other roles - full access within their institute
    if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
      return <InstituteSelector />;
    }

    if (currentPage === 'select-class') {
      return <ClassSelector />;
    }

    if (currentPage === 'select-subject') {
      return <SubjectSelector />;
    }

    const classRequiredPages = ['attendance-marking', 'grading'];
    if (selectedInstitute && !selectedClass && classRequiredPages.includes(currentPage)) {
      return <ClassSelector />;
    }

    const subjectRequiredPages = ['lectures'];
    if (selectedClass && !selectedSubject && subjectRequiredPages.includes(currentPage)) {
      return <SubjectSelector />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'institute-users':
        return <InstituteUsers />;
      case 'users':
        return <Users />;
      case 'students':
        return <Students />;
      case 'teachers':
        return <Teachers />;
      case 'parents':
        return <Parents />;
      case 'grades':
        return <Grades />;
      case 'classes':
        return <Classes />;
      case 'subjects':
        return <Subjects />;
      case 'institutes':
        return <Institutes />;
      case 'select-institute':
        return <InstituteSelector />;
      case 'institute-details':
        return <InstituteDetails />;
      case 'grading':
      case 'grades-table':
      case 'create-grade':
      case 'assign-grade-classes':
      case 'view-grade-classes':
        return <Grading />;
      case 'attendance':
        return <Attendance />;  
      case 'attendance-marking':
        return <AttendanceMarking onNavigate={setCurrentPage} />;
      case 'qr-attendance':
        return <QRAttendance />;
      case 'attendance-markers':
        return <AttendanceMarkers />;
      case 'lectures':
        return <Lectures />;
      case 'live-lectures':
        return <LiveLectures />;
      case 'homework':
        return <Homework />;
      case 'exams':
        return <Exams />;
      case 'results':
        return <Results />;
      case 'profile':
        return <Profile />;
      case 'gallery':
        return <Gallery />;
      case 'settings':
        return <Settings />;
      case 'appearance':
        return <Appearance />;
      case 'teacher-students':
        return <TeacherStudents />;
      case 'organization-dashboard':
        return <OrganizationDashboard />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={handleUserLogin} loginFunction={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex w-full h-screen">
        {/* Desktop Sidebar */}
        <Sidebar 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header onMenuClick={handleMenuClick} />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {renderComponent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppContent;