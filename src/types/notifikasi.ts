export interface INotification {
  id: number;
  user_id: number;
  message_id?: number | null;
  ticket_number?: string | null;
  type: "new_message" | "ticket_closed" | "system";
  title: string;
  body?: string | null;
  is_read: boolean;
  created_at: string; // biasanya dari API berupa ISO string
}
