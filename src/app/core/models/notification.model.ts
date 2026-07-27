export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;   // LowStock, Appointment, System, Info
  link?: string;
  isRead: boolean;
  createdAt: string;
}