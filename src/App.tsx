import { useState, useEffect } from 'react';
import { supabase, generateUserId } from './lib/supabase';
import { AppState } from './types';
import ConnectScreen from './components/ConnectScreen';
import ConnectingScreen from './components/ConnectingScreen';
import ChatScreen from './components/ChatScreen';
import FeedbackScreen from './components/FeedbackScreen';

function App() {
  const [appState, setAppState] = useState<AppState>('connect');
  const [userId] = useState(() => generateUserId());
  const [queueId, setQueueId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [initialVent, setInitialVent] = useState<string>('');

  useEffect(() => {
    if (appState === 'connecting' && queueId) {
      const interval = setInterval(() => {
        checkForMatch();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [appState, queueId]);

  const handleSubmitVent = async (vent: string) => {
    setInitialVent(vent);
    setAppState('connecting');

    const waitingUsers = await supabase
      .from('waiting_queue')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1);

    if (waitingUsers.data && waitingUsers.data.length > 0) {
      const matchedUser = waitingUsers.data[0];

      await supabase
        .from('waiting_queue')
        .delete()
        .eq('id', matchedUser.id);

      const session = await supabase
        .from('chat_sessions')
        .insert({
          user1_id: matchedUser.id,
          user2_id: userId,
          status: 'active',
        })
        .select()
        .single();

      if (session.data) {
        await supabase.from('messages').insert({
          session_id: session.data.id,
          sender_id: matchedUser.id,
          content: matchedUser.initial_vent,
        });

        await supabase.from('messages').insert({
          session_id: session.data.id,
          sender_id: userId,
          content: vent,
        });

        setSessionId(session.data.id);
        setAppState('chat');
      }
    } else {
      const queue = await supabase
        .from('waiting_queue')
        .insert({
          id: userId,
          initial_vent: vent,
        })
        .select()
        .single();

      if (queue.data) {
        setQueueId(queue.data.id);
      }
    }
  };

  const checkForMatch = async () => {
    if (!queueId) return;

    const session = await supabase
      .from('chat_sessions')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'active')
      .maybeSingle();

    if (session.data) {
      await supabase
        .from('waiting_queue')
        .delete()
        .eq('id', queueId);

      setSessionId(session.data.id);
      setAppState('chat');
    }
  };

  const handleEndChat = () => {
    setAppState('feedback');
  };

  const handleFeedbackComplete = () => {
    setAppState('connect');
    setSessionId(null);
    setQueueId(null);
    setInitialVent('');
  };

  return (
    <>
      {appState === 'connect' && (
        <ConnectScreen onSubmit={handleSubmitVent} />
      )}
      {appState === 'connecting' && <ConnectingScreen />}
      {appState === 'chat' && sessionId && (
        <ChatScreen
          sessionId={sessionId}
          userId={userId}
          initialVent={initialVent}
          onEndChat={handleEndChat}
        />
      )}
      {appState === 'feedback' && sessionId && (
        <FeedbackScreen
          sessionId={sessionId}
          userId={userId}
          onComplete={handleFeedbackComplete}
        />
      )}
    </>
  );
}

export default App;
