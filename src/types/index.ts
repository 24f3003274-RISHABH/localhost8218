export type ExamCategory = 
  | 'All'
  | 'Computer Science & Tech'
  | 'Science'
  | 'Commerce & Management'
  | 'Humanities & Social Sciences';

export interface TestSeries {
  id: string;
  title: string;
  exam: string; // e.g. "CUET PG 2026"
  subject: string; // e.g. "Computer Science & Information Technology"
  subjectCode: string; // e.g. "SCQP09"
  category: ExamCategory;
  testsCount: number;
  questionsCount?: number;
  duration?: string; // e.g. "105 Mins per test"
  accessDuration: string; // e.g. "6 Months access (Valid till Exam Day)"
  price: number; // in INR (0 if free)
  originalPrice?: number;
  isFree: boolean;
  featured?: boolean;
  description: string;
  features: string[];
  syllabusTopics: string[];
  difficultyLevel: 'Foundational' | 'Moderate' | 'Advanced' | 'Comprehensive';
  language: 'English' | 'Bilingual (Hindi / English)';
}

export interface NavItem {
  label: string;
  href: string;
  isPrimaryAction?: boolean;
}

export interface ContactFormData {
  fullName: string;
  email: string;
  subjectCode: string;
  queryType: 'Technical Support' | 'Test Series Query' | 'Syllabus & Pattern' | 'Enrollment / Billing' | 'Other';
  message: string;
}
