export interface Profile {
  name: string;
  height_cm: number;
  weight_kg: number;
  age: number;
}

export interface Run {
  id: string;
  date: string; // ISO 8601 format
  distance_m: number;
  total_time_sec: number;
  avg_speed_kmh: number;
  max_speed_kmh: number;
  notes: string;
}

export interface Goal {
  distance_target_km: number;
  days_target: number; // e.g., run 5 days a week
  time_target_1_6km: string; // MM:SS format for 1.6km (1 mile)
  start_date: string; // ISO 8601 format
}

export interface Insight {
  id: string;
  title: string;
  content: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface WeeklyPlan {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
}

export interface InsightsData {
  insights: Insight[];
  weeklyPlan: WeeklyPlan;
  improvementScore: number;
}

export interface PersonalRecords {
  longestDistance: number; // in km
  longestDuration: number; // in seconds
  fastestAvgSpeed: number; // in km/h
}