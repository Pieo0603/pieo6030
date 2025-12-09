export interface Message {
  id: string;
  author: string;
  content: string;
  imageUrl?: string;
  timestamp: number;
  isAnonymous: boolean;
  avatarUrl?: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface Track {
  title: string;
  artist: string;
  src: string;
  cover: string;
}

export interface ThemeConfig {
  id: string;
  hex: string;           // Hex color for the picker circle
  text: string;          // Primary text color class (e.g., text-pink-400)
  textDim: string;       // Secondary text color class
  border: string;        // Border color class
  shadow: string;        // Shadow class
  gradientTitle: string; // Gradient text for title
  buttonGradient: string;// Gradient for primary buttons
  icon: string;          // Icon color class
  inputFocus: string;    // Input focus ring/border classes
}

export interface StudyLog {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  subject: string;
  durationMinutes: number; // Thời gian thực tế đã học
  targetMinutes: number;   // Mục tiêu
  notes: string;
  timestamp: number;
  isCompleted: boolean; // Đạt mục tiêu hay không
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string;
  totalMinutes: number;
  sessionsCount: number;
  lastActive: number;
}