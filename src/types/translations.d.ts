// src/types/translations.d.ts

// Define la estructura para el objeto 'calendar'
interface CalendarTranslations {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
  today: string;
  select_date: string;
  of: string;
  no_appointments: string;
  blocked: string;
  reserved: string;
  available: string;
  reserve_button: string;
  enable_slots: string;
  past: string;
}

// Define la estructura para el objeto 'messages'
interface MessagesTranslations {
  reservation_success: string;
  reservation_error: string;
  enable_success: string;
  enable_error: string;
  no_authentication: string;
  user_not_found: string;
  not_authorized: string;
  incomplete_data: string;
  select_date_first: string;
  confirm_reservation: string;
  appointment_not_available: string;
  internal_server_error: string;
}

// Define la estructura para el objeto 'email'
interface EmailTranslations {
  professional_subject: string;
  professional_text_details: string;
  professional_html_details: string;
  user_subject: string;
  user_text_confirmation: string;
  user_html_confirmation: string;
}

// Define la estructura completa de un archivo de traducción (ej. es.json o en.json)
export interface Translations {
  calendar: CalendarTranslations;
  messages: MessagesTranslations;
  email: EmailTranslations;
}