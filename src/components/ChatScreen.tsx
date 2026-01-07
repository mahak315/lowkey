import { useEffect, useState, useRef } from 'react';
import { Send, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';

interface ChatScreenProps {
  sessionId: string;
  userId: string;
  initialVent: string;
  onEndChat: () => void;
}

export default function ChatScreen({ sessionId, userId, initialVent, onEndChat }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    subscribeToMessages();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      session_id: sessionId,
      sender_id: userId,
      content: newMessage.trim(),
    };

    await supabase.from('messages').insert(message);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEndChat = async () => {
    await supabase
      .from('chat_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', sessionId);

    onEndChat();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="bg-zinc-900 border-b border-rose-900/30 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🌙</div>
            <div>
              <h1 className="text-rose-200 font-light">Anonymous Chat</h1>
              <p className="text-rose-300/60 text-xs">Listen with kindness</p>
            </div>
          </div>
          <button
            onClick={handleEndChat}
            className="text-rose-300/60 hover:text-rose-300 transition-colors text-sm flex items-center gap-2 font-light"
          >
            <span>End Chat</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {initialVent && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 mb-8">
              <p className="text-rose-200/70 text-sm font-light italic">
                Initial vent: "{initialVent}"
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender_id === userId
                    ? 'bg-rose-500 text-white'
                    : 'bg-zinc-900 text-rose-100 border border-rose-900/30'
                }`}
              >
                <p className="text-sm font-light whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="bg-zinc-900 border-t border-rose-900/30 px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 bg-black border border-rose-900/30 rounded-lg px-4 py-3 text-rose-100 placeholder-rose-300/30 focus:outline-none focus:border-rose-500/50 resize-none font-light max-h-32"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-rose-500 hover:bg-rose-600 disabled:bg-rose-900/30 disabled:cursor-not-allowed text-white px-6 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
