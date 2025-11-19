// src/types/index.ts - Common type definitions

// User types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName?: string;
  lastName?: string;
}

// Constellation types
export interface Constellation {
  _id: string;  // MongoDB ObjectId
  id: number;   // ✅ Constellation ID (1-88)
  name: string;
  latinName?: string;
  abbreviation?: string;
  description?: string;
  mythology?: string;
  rightAscension?: number;
  declination?: number;
  area?: number;
  brightestStar?: string;
  visibility?: string;
  hemisphere?: string;
  season?: "Spring" | "Summer" | "Fall" | "Winter" | "Year-round";
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface Observation {
  _id: string;
  userId: string;
  constellationId: number;  
  photoUrl: string;
  cloudinaryPublicId: string;
  location: string;
  notes?: string;
  observationDate: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy type for backward compatibility (if needed)
export interface ConstellationObservation {
  id: string;
  userId: string;
  constellationId: string;
  observationDate: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  conditions?: string;
  notes?: string;
  rating?: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// Component prop types
export interface ChildrenProps {
  children: React.ReactNode;
}

export interface ClassNameProps {
  className?: string;
}

// Route types
export interface PrivateRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Filter and sort types
export interface ConstellationFilters {
  season?: string;
  visibility?: string;
  searchQuery?: string;
}

export interface SortOptions {
  field: string;
  order: "asc" | "desc";
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
  city?: string;
  country?: string;
}

// Export utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = (...args: unknown[]) => Promise<T>;