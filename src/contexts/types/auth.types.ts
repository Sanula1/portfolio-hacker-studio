export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Computed from firstName + lastName
  email: string;
  phone: string;
  userType: string;
  dateOfBirth: string;
  gender: string;
  nic: string;
  birthCertificateNo: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl: string;
  role: string;
  institutes?: Institute[]; // Optional institutes array
}

// Export UserRole type for use in other components
export type UserRole = 'InstituteAdmin' | 'Teacher' | 'Student' | 'AttendanceMarker' | 'Parent' | 'OrganizationManager';

export interface Institute {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  description: string;
  grade: number;
  specialty: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Child {
  id: string;
  userId: string;
  studentId: string;
  emergencyContact: string;
  medicalConditions: string;
  allergies: string;
  bloodGroup: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    imageUrl: string;
    dateOfBirth: string;
    gender: string;
    userType: string;
  };
}

export interface Organization {
  organizationId: string;
  name: string;
  type: string;
  isPublic: boolean;
  needEnrollmentVerification: boolean;
  imageUrl: string | null;
  instituteId: string | null;
  userRole: string;
  isVerified: boolean;
  joinedAt: string;
  memberCount: number;
  causeCount: number;
}

export interface Course {
  causeId: string;
  title: string;
  description: string;
  isPublic: boolean;
  organizationId: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthContextType {
  user: User | null;
  selectedInstitute: Institute | null;
  selectedClass: Class | null;
  selectedSubject: Subject | null;
  selectedChild: Child | null;
  selectedOrganization: Organization | null;
  selectedCourse: Course | null;
  currentInstituteId: string | null;
  currentClassId: string | null;
  currentSubjectId: string | null;
  currentChildId: string | null;
  isOrganizationLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setSelectedInstitute: (institute: Institute | null) => void;
  setSelectedClass: (classData: Class | null) => void;
  setSelectedSubject: (subject: Subject | null) => void;
  setSelectedChild: (child: Child | null) => void;
  setSelectedOrganization: (organization: Organization | null) => void;
  setSelectedCourse: (course: Course | null) => void;
  setOrganizationLoggedIn: (loggedIn: boolean) => void;
  loadUserInstitutes: () => Promise<Institute[]>;
  refreshUserData?: (forceRefresh?: boolean) => Promise<void>;
  validateUserToken?: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}
