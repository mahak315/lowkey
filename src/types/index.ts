export interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'active' | 'ended';
  created_at: string;
  ended_at?: string;
}

export type AppState = 'connect' | 'connecting' | 'chat' | 'feedback';
export type Feeling = 'better' | 'neutral' | 'worse';
