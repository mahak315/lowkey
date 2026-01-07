import { useState } from 'react';
import { Send } from 'lucide-react';

interface ConnectScreenProps {
  onSubmit: (vent: string) => void;
}

export default function ConnectScreen({ onSubmit }: ConnectScreenProps) {
  const [vent, setVent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSubmit = () => {
    if (vent.trim()) {
      setIsAnimating(true);
      setTimeout(() => {
        onSubmit(vent);
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="text-5xl mb-4">🌙</div>
          <h1 className="text-4xl font-light text-rose-200">lowkey</h1>
          <p className="text-rose-300/80 text-sm">Talk it out. Quietly.</p>
        </div>

        <div className="space-y-6 mt-12">
          <div className="space-y-3">
            <label className="text-rose-200/90 text-sm font-light block">
              What's on your mind?
            </label>
            <textarea
              value={vent}
              onChange={(e) => setVent(e.target.value)}
              placeholder="Type your thoughts here..."
              className="w-full h-40 bg-zinc-900 border border-rose-900/30 rounded-lg px-4 py-3 text-rose-100 placeholder-rose-300/30 focus:outline-none focus:border-rose-500/50 resize-none font-light transition-colors"
              autoFocus
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!vent.trim() || isAnimating}
            className={`w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-900/30 disabled:cursor-not-allowed text-white py-3 rounded-lg font-light flex items-center justify-center gap-2 transition-all ${
              isAnimating ? 'animate-pulse' : ''
            }`}
          >
            <span>Connect with someone</span>
            <Send
              className={`w-4 h-4 transition-all ${
                isAnimating ? 'translate-x-20 -translate-y-20 opacity-0' : ''
              }`}
              style={{ transitionDuration: '800ms' }}
            />
          </button>
        </div>

        <div className="text-center space-y-4 mt-12 pt-8 border-t border-rose-900/30">
          <p className="text-rose-300/60 text-xs font-light">
            Anonymous • No sign-up • Safe space
          </p>
          <div className="text-rose-300/50 text-xs space-y-1">
            <p>Be kind • Listen with empathy • No medical advice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
