export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role: 'student' | 'admin' | 'studentmendunia';
  status?: string | null;
}

export interface PackageSection {
  id: number;
  name: string;
  description: string | null;
  order: number;
  duration_minutes: number | null;
  question_count: number;
  progress?: number;
}

export type AccessState = 'active' | 'locked' | 'completed';

export interface Package {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  level: string | null;
  duration_minutes: number;
  price: number;
  is_premium: boolean;
  status: string;
  thumbnail: string | null;
  total_questions?: number;
  access_state?: AccessState;
  progress?: number;
  sections?: PackageSection[];
}

export interface QuestionOption {
  id: number;
  option: string;
  option_text: string;
}

export interface Question {
  id: number;
  question_text: string;
  image: string | null;
  audio: string | null;
  explanation: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  score: number;
  section_name: string;
  options: QuestionOption[];
  selected_option_id: number | null;
}

export type AttemptStatus = 'in_progress' | 'completed' | 'expired' | 'abandoned';

export interface QuizAttempt {
  id: number;
  package_id: number;
  package_name?: string;
  status: AttemptStatus;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  total_questions: number;
  answered_count?: number;
  score: number | null;
  correct_answers: number;
  wrong_answers: number;
  unanswered: number;
}

export interface QuizReviewItem {
  question_id: number;
  question_text: string;
  image: string | null;
  audio: string | null;
  explanation: string | null;
  your_answer: QuestionOption | null;
  correct_answer: QuestionOption | null;
  is_correct: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  description: string;
  image?: string | null;
  published_at: string;
  is_read?: boolean;
}

export interface LearningModule {
  id: number;
  title: string;
  description: string | null;
  thumbnail: string | null;
  file_url: string | null;
  external_url: string | null;
  is_premium: boolean;
  price: number;
  status: 'draft' | 'published';
  category_id: number | null;
  category?: {
    id: number;
    name: string;
    slug?: string;
    description?: string | null;
    icon?: string | null;
    is_premium?: boolean;
    price?: number;
    duration_days?: number | null;
  } | null;
  published_at: string | null;
  accessible?: boolean;
}

export interface ModulePurchase {
  id: number;
  module_id: number;
  amount_paid: number;
  status: string;
  purchased_at: string | null;
  module?: LearningModule;
}

export interface DashboardData {
  user: { name: string };
  masa_berlaku: {
    is_active: boolean;
    label: string;
    days_left: number | null;
    expires_at: string | null;
  };
  referral: {
    code: string;
    used_orders: number;
    bonus_days: number;
  };
  stats: {
    average_score_7d: number;
    tests_this_week: number;
    accuracy_7d: number;
  };
  weak_areas: Array<{
    section: string;
    accuracy: number;
    total_answered: number;
  }>;
  streak: {
    days: number;
    weekly_minutes: number;
  };
  recent_tests: Array<{
    id: number;
    package_id: number;
    package: string;
    result: string | null;
    percent: number | null;
    status: AttemptStatus;
    started_at: string | null;
    finished_at: string | null;
  }>;
}

export interface SubscriptionData {
  is_active: boolean;
  referral_bonus_days: number;
  accesses: Array<{
    package: string;
    status: 'active' | 'expired';
    started_at: string | null;
    expires_at: string | null;
    days_left: number | null;
  }>;
}

export interface PaymentsData {
  transactions: Array<{
    id: number;
    invoice_number: string;
    total_amount: number;
    status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'expired';
    paid_at: string | null;
    created_at: string | null;
    items: Array<{ name: string; price: number }>;
    proof_image: string | null;
    payment_status: string | null;
  }>;
}

export interface ProgressData {
  overall: number;
  by_category: Record<string, number>;
  sections: Array<{
    section: string;
    package: string;
    package_id: number;
    best_score: number;
    last_score: number;
    average_score: number;
    attempts_count: number;
    last_attempted_at: string | null;
  }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    current_page: number;
    last_page: number;
    total?: number;
  };
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: Record<string, string[]> | unknown[];
}

// ── Admin ──────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  description: string | null;
  order: number;
  is_active: boolean;
  is_premium?: boolean;
  has_access?: boolean;
  price?: number;
  duration_days?: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdminDashboardData {
  total_users: number;
  active_users: number;
  total_packages: number;
  total_questions: number;
  total_attempts: number;
  average_score: number;
  transactions: number;
  reservations: number;
  recent_attempts: Array<{
    id: number;
    user: { id: number; name: string } | null;
    package: { id: number; name: string } | null;
    status: string;
    score: number | null;
    submitted_at: string | null;
  }>;
}

export type AdminPackage = Package & { sections_count?: number };

export interface AdminPackageInput {
  name: string;
  category?: string | null;
  level?: string | null;
  description?: string | null;
  duration_minutes?: number;
  price?: number;
  is_premium?: boolean;
  status?: 'draft' | 'published';
}

export interface AdminQuestionInput {
  section_id: number;
  question_text: string;
  explanation?: string | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  score?: number;
  order?: number;
  options?: Array<{ option: string; option_text: string; is_correct: boolean }>;
}

export interface AdminUserItem extends User {
  quiz_attempts_count?: number;
}

export interface AdminSubscriberItem {
  id: number;
  user: { id: number; name: string; email: string } | null;
  package: { id: number; name: string; price: number } | null;
  status: 'active' | 'expired';
  started_at: string | null;
  expires_at: string | null;
  days_left: number | null;
}

export interface KotobaCategory {
  id: number;
  name: string;
  description: string | null;
  type: 'JFT' | 'SSW';
  total_words: number;
  total_packages: number;
  icon: string | null;
  color: string;
  order: number;
  is_active: boolean;
}

export interface KotobaItem {
  id: number;
  category_id: number;
  category?: KotobaCategory;
  japanese: string;
  reading: string | null;
  meaning: string;
  example_sentence: string | null;
  example_translation: string | null;
  order: number;
  options: KotobaOption[] | null;
  is_active: boolean;
  topics?: KotobaTopic[];
  created_at: string;
  updated_at: string;
}

export interface KotobaOption {
  option: string;
  option_text: string;
  is_correct: boolean;
}

export type KotobaInput = Omit<KotobaItem, 'id' | 'category' | 'options' | 'topics' | 'created_at' | 'updated_at'> & {
  options?: KotobaOption[];
  topic_ids?: number[];
};

export interface KotobaTopic {
  id: number;
  category_id: number;
  category?: KotobaCategory;
  name: string;
  description: string | null;
  word_count: number;
  order: number;
  is_active: boolean;
  kotoba?: KotobaItem[];
}

export type KotobaTopicInput = Omit<KotobaTopic, 'id' | 'category' | 'kotoba'>;
