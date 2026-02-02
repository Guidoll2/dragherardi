// Tipos para el sistema educativo

export type UserRole = "admin" | "student";

export interface Classroom {
  _id: string;
  name: string;
  description: string;
  instructorId: string;
  instructorName: string;
  students: string[]; // Array de user IDs
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  coverImage?: string;
}

export interface EducationalMaterial {
  _id: string;
  classroomId: string;
  title: string;
  description: string;
  type: "text" | "pdf" | "word" | "excel" | "powerpoint" | "google-drive" | "link";
  content?: string; // Para texto plano
  fileUrl?: string; // Para archivos subidos
  externalLink?: string; // Para Google Drive o links externos
  uploadedBy: string;
  uploadedByName: string;
  createdAt: Date;
  order: number; // Para ordenar materiales
}

export interface LiveSession {
  _id: string;
  classroomId: string;
  title: string;
  description: string;
  scheduledFor: Date;
  duration: number; // en minutos
  streamUrl?: string; // URL del stream (Zoom, etc.)
  isLive: boolean;
  startedAt?: Date;
  endedAt?: Date;
  recordingUrl?: string;
  isPrivate: boolean; // Si la sesión requiere código
  accessCode?: string; // Código de acceso para sesiones privadas
}

export interface ChatMessage {
  _id: string;
  sessionId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  isInstructor: boolean;
  replyTo?: string; // ID del mensaje al que responde
}

export interface StudentProgress {
  _id: string;
  userId: string;
  classroomId: string;
  completedMaterials: string[]; // IDs de materiales vistos
  lastAccessedAt: Date;
  notes?: string;
}
