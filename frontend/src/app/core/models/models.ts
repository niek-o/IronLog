export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserResponse;
}

export type MuscleCategory =
  | 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Core' | 'Cardio' | 'FullBody';

export const MUSCLE_CATEGORIES: MuscleCategory[] = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'FullBody',
];

export interface ExerciseResponse {
  id: string;
  name: string;
  category: MuscleCategory;
  equipment?: string | null;
  notes?: string | null;
  isCustom: boolean;
}

export interface ExerciseRequest {
  name: string;
  category: MuscleCategory;
  equipment?: string | null;
  notes?: string | null;
}

export interface TemplateExerciseRequest {
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number | null;
}

export interface TemplateExerciseResponse {
  id: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number | null;
}

export interface TemplateRequest {
  name: string;
  description?: string | null;
  exercises: TemplateExerciseRequest[];
}

export interface TemplateResponse {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  exercises: TemplateExerciseResponse[];
}

export interface WorkoutSetRequest {
  exerciseId: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number | null;
  completed: boolean;
}

export interface WorkoutSetResponse {
  id: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number;
  weightKg: number;
  rpe?: number | null;
  completed: boolean;
}

export interface WorkoutSessionRequest {
  name: string;
  templateId?: string | null;
  notes?: string | null;
  sets?: WorkoutSetRequest[];
}

export interface WorkoutSessionUpdateRequest {
  name: string;
  notes?: string | null;
  complete: boolean;
}

export interface WorkoutSessionResponse {
  id: string;
  name: string;
  templateId?: string | null;
  templateName?: string | null;
  startedAt: string;
  completedAt?: string | null;
  notes?: string | null;
  sets: WorkoutSetResponse[];
}

export interface BodyMetricRequest {
  date: string;
  weightKg?: number | null;
  bodyFatPercent?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  armsCm?: number | null;
  thighsCm?: number | null;
  notes?: string | null;
}

export interface BodyMetricResponse extends BodyMetricRequest {
  id: string;
}

export interface ExerciseProgressPoint {
  date: string;
  maxWeightKg: number;
  totalReps: number;
  estimatedOneRepMax: number;
}

export interface ExerciseProgressResponse {
  exerciseId: string;
  exerciseName: string;
  points: ExerciseProgressPoint[];
}

export interface VolumePoint {
  week: string;
  totalVolumeKg: number;
  setCount: number;
}

export interface DashboardSummary {
  totalWorkouts: number;
  workoutsThisWeek: number;
  totalVolumeKgThisWeek: number;
  currentStreakDays: number;
  weeklyVolume: VolumePoint[];
  latestBodyMetric?: BodyMetricResponse | null;
}
