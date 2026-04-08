
export enum Severity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  CRITICAL = 'CRITICAL'
}

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export interface DiseasePrediction {
  name: string;
  confidence: number;
  severity: Severity;
  description: string;
  causes: string[];
  precautions: string[];
  specialist: string;
  medications: string[];
  workouts: string[];
  diets: string[];
  matchedSymptoms: { name: string; category: string; weight: number }[];
}

export interface UserHealthProfile {
  name: string;
  email: string;
  patient_id: string;
  age: number;
  gender: string;
  allergies: string[];
  history: string[];
  last_period?: string;
}

export interface User {
  id?: string;
  patient_id: string;
  username: string;
  email: string;
  password?: string;
  age: number;
  gender: string;
  security_question: string;
  security_answer: string;
  role: UserRole;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  prediction?: DiseasePrediction;
  isEmergency?: boolean;
  groundingUrls?: { title: string; uri: string }[];
  visualData?: any[];
  image?: string; 
  feedback?: 'like' | 'dislike';
}

export enum Language {
  EN = 'en',
  TA = 'ta',
  HI = 'hi',
  ES = 'es',
  AR = 'ar'
}

export interface InsurancePlan {
  id: string;
  name: string;
  type: 'Individual' | 'Family' | 'Senior' | 'Critical';
  premium: number;
  coverage: string;
  benefits: string[];
  waitingPeriod: string;
  taxBenefit: string;
}

export interface InsuranceRequest {
  id: string;
  planId: string;
  planName: string;
  userName: string;
  userEmail: string;
  premium: number;
  status: 'Submitted' | 'Processing' | 'Active';
  timestamp: string;
}

export interface Hospital {
  id?: string;
  name: string;
  address: string;
  rating: number;
  distance: string;
  phone: string;
  lat: number;
  lng: number;
  uri: string;
  type: 'Hospital' | 'Clinic' | 'Pharmacy';
  isOpen: boolean;
}

export interface Doctor {
  id?: string;
  name: string;
  specialist: string;
  experience: string;
  rating: number;
  phone: string;
  email: string;
  address: string;
  image: string;
  availability: string;
}

export interface Pharmacy {
  id?: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  isOpen: boolean;
  deliveryAvailable?: boolean;
}

export interface HealthContent {
  id?: string;
  title: string;
  category: 'Tips' | 'Nutrition' | 'Exercise' | 'MentalHealth';
  description: string;
  image: string;
  content: string;
}

export interface Medicine {
  id?: string;
  name: string;
  usage: string;
  sideEffects: string;
  image?: string;
}

export interface Outbreak {
  id: string;
  disease: string;
  location: string;
  severity: Severity;
  cases: number;
  status: 'Active' | 'Contained' | 'Under Observation';
  timestamp: string;
  lat: number;
  lng: number;
}

export interface HealthID {
  id: string;
  abhaNumber: string;
  name: string;
  dob: string;
  gender: string;
  qrCode: string;
  bloodGroup: string;
}

export interface EmergencyRequest {
  id: string;
  userId: string;
  userName: string;
  location: { lat: number; lng: number };
  type: 'Accident' | 'Cardiac' | 'Respiratory' | 'Other';
  status: 'Pending' | 'Dispatched' | 'Arrived' | 'Completed';
  timestamp: string;
  ambulanceId?: string;
}

export type ViewState = 
  | 'chat' 
  | 'report' 
  | 'fitness' 
  | 'insurance' 
  | 'admin' 
  | 'live' 
  | 'about' 
  | 'profile'
  | 'image-analysis' 
  | 'blood-analysis' 
  | 'medicine-analyzer' 
  | 'health-content' 
  | 'glob' 
  | 'hospitals' 
  | 'health-dashboard' 
  | 'medicine-reminder' 
  | 'emergency-sos' 
  | 'mental-health' 
  | 'health-records' 
  | 'appointment-booking' 
  | 'disease-awareness'
  | 'doctors'
  | 'telemedicine'
  | 'medicines'
  | 'gov'
  | 'health-id'
  | 'outbreak'
  | 'health-risk'
  | 'rural-health'
  | 'policy-analytics';

export interface ChatbotDataset {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}
