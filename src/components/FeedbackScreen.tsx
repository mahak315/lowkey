import { useState } from 'react';
import { Feeling } from '../types';
import { supabase } from '../lib/supabase';

interface FeedbackScreenProps {
  sessionId: string;
  userId: string;
  onComplete: () => void;
}

const supportTips = [
  "It's okay to start with a simple hello",
  "Listening matters more than having perfect words",
  "You don't need to fix everything to help someone",
  "Taking time for yourself is not selfish",
  "Small connections can make a big difference",
  "Your feelings are valid, no matter what they are"
];

export default function FeedbackScreen({ sessionId, userId, onComplete }: FeedbackScreenProps) {
  const [feeling, setFeeling] = useState<Feeling | null>(null);
  const [needsHelp, setNeedsHelp] = useState<boolean | null>(null);
  const [showTips, setShowTips] = useState(false);

  const submitFeedback = async (selectedFeeling: Feeling) => {
    setFeeling(selectedFeeling);

    await supabase.from('feedback').insert({
      session_id: sessionId,
      user_id: userId,
      feeling: selectedFeeling,
      needs_help: false,
    });

    setShowTips(true);
  };

  const handleNeedsHelp = async (needs: boolean) => {
    setNeedsHelp(needs);

    await supabase
      .from('feedback')
      .update({ needs_help: needs })
      .eq('session_id', sessionId)
      .eq('user_id', userId);

    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  if (showTips && needsHelp === null) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="text-4xl">✨</div>
            <h2 className="text-2xl text-rose-200 font-light">
              {feeling === 'better' ? "Glad you're feeling better" :
               feeling === 'worse' ? 'Thank you for sharing' :
               'Every feeling is okay'}
            </h2>
          </div>

          <div className="bg-zinc-900 border border-rose-900/30 rounded-lg p-6 space-y-4">
            <p className="text-rose-200 text-sm font-light text-center">
              A gentle reminder:
            </p>
            <p className="text-rose-300/80 text-sm font-light italic text-center">
              {supportTips[Math.floor(Math.random() * supportTips.length)]}
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-rose-200 text-sm text-center font-light">
              Do you still need support?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleNeedsHelp(false)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 border border-rose-900/30 text-rose-200 py-3 rounded-lg font-light transition-colors"
              >
                Feeling better
              </button>
              <button
                onClick={() => handleNeedsHelp(true)}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-lg font-light transition-colors"
              >
                Still need help
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (needsHelp !== null) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="text-4xl">🌙</div>
          <div className="space-y-4">
            <h2 className="text-2xl text-rose-200 font-light">
              {needsHelp ? 'You deserve support' : 'Take care of yourself'}
            </h2>
            <p className="text-rose-300/80 text-sm font-light">
              {needsHelp
                ? "Consider reaching out to a trusted friend or professional. You're worth it."
                : "Remember, you can always come back when you need someone to talk to."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="text-4xl">🌙</div>
          <h2 className="text-2xl text-rose-200 font-light">
            How are you feeling now?
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => submitFeedback('better')}
            className="bg-zinc-900 hover:bg-zinc-800 border border-rose-900/30 rounded-lg p-6 transition-all hover:scale-105 group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">😊</div>
            <p className="text-rose-200 text-sm font-light">Better</p>
          </button>

          <button
            onClick={() => submitFeedback('neutral')}
            className="bg-zinc-900 hover:bg-zinc-800 border border-rose-900/30 rounded-lg p-6 transition-all hover:scale-105 group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">😐</div>
            <p className="text-rose-200 text-sm font-light">Same</p>
          </button>

          <button
            onClick={() => submitFeedback('worse')}
            className="bg-zinc-900 hover:bg-zinc-800 border border-rose-900/30 rounded-lg p-6 transition-all hover:scale-105 group"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">😔</div>
            <p className="text-rose-200 text-sm font-light">Worse</p>
          </button>
        </div>

        <p className="text-rose-300/60 text-xs text-center font-light">
          Your feedback helps us create a better experience
        </p>
      </div>
    </div>
  );
}
