import { getBaseUrl, getAttendanceUrl, getApiHeaders } from '@/contexts/utils/auth.api';
import { enhancedCachedClient } from './enhancedCachedClient';

export interface StudentAttendanceRecord {
  studentId: string;
  studentCardId: string;
  studentName: string;
  instituteName: string;
  className?: string;
  subjectName?: string;
  lastAttendanceDate: string;
  attendanceCount: number;
  studentDetails: {
    email: string;
    phoneNumber: string;
    city: string;
    district: string;
    province: string;
    isActive: boolean;
    dateOfBirth: string;
    gender: string;
  };
}

export interface StudentAttendanceResponse {
  success: boolean;
  message: string;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    recordsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: StudentAttendanceRecord[];
}

export interface StudentAttendanceParams {
  page?: number;
  limit?: number;
  userId?: string;
  role?: string;
}

class InstituteStudentsApi {
  // 1. Institute-level attendance (InstituteAdmin only)
  async getInstituteStudentAttendance(
    instituteId: string, 
    params: StudentAttendanceParams = {},
    forceRefresh = false
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 50
    };

    console.log('Fetching institute student attendance for institute:', instituteId, 'with params:', queryParams);

    const endpoint = `/api/students/by-institute/${instituteId}/?page=${queryParams.page}&limit=${queryParams.limit}`;
    
    return enhancedCachedClient.get<StudentAttendanceResponse>(endpoint, undefined, {
      forceRefresh,
      ttl: 10,
      useStaleWhileRevalidate: true,
      userId: params.userId,
      instituteId,
      role: params.role
    });
  }

  // 2. Class-level attendance (InstituteAdmin, Teacher)
  async getClassStudentAttendance(
    instituteId: string,
    classId: string,
    params: StudentAttendanceParams = {},
    forceRefresh = false
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 50
    };

    console.log('Fetching class student attendance for institute:', instituteId, 'class:', classId, 'with params:', queryParams);

    const endpoint = `/api/students/by-institute/${instituteId}/class/${classId}?page=${queryParams.page}&limit=${queryParams.limit}`;
    
    return enhancedCachedClient.get<StudentAttendanceResponse>(endpoint, undefined, {
      forceRefresh,
      ttl: 10,
      useStaleWhileRevalidate: true,
      userId: params.userId,
      instituteId,
      classId,
      role: params.role
    });
  }

  // 3. Subject-level attendance (InstituteAdmin, Teacher)
  async getSubjectStudentAttendance(
    instituteId: string,
    classId: string,
    subjectId: string,
    params: StudentAttendanceParams = {},
    forceRefresh = false
  ): Promise<StudentAttendanceResponse> {
    const queryParams = {
      page: params.page || 1,
      limit: params.limit || 50
    };

    console.log('Fetching subject student attendance for institute:', instituteId, 'class:', classId, 'subject:', subjectId, 'with params:', queryParams);

    const endpoint = `/api/students/by-institute/${instituteId}/class/${classId}/subject/${subjectId}?page=${queryParams.page}&limit=${queryParams.limit}`;
    
    return enhancedCachedClient.get<StudentAttendanceResponse>(endpoint, undefined, {
      forceRefresh,
      ttl: 10,
      useStaleWhileRevalidate: true,
      userId: params.userId,
      instituteId,
      classId,
      subjectId,
      role: params.role
    });
  }
}

export const instituteStudentsApi = new InstituteStudentsApi();