import { useEffect, useState } from 'react';

const prompts = [
  "How are you feeling right now?",
  "You're not alone",
  "Take your time",
  "Someone will be here soon",
  "Your feelings are valid"
];

export default function ConnectingScreen() {
  const [currentPrompt, setCurrentPrompt] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrompt((prev) => (prev + 1) % prompts.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <div className="max-w-md w-full space-y-12 text-center">
        <div className="text-4xl">🌙</div>

        <div className="relative h-32 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-rose-500/30 rounded-full animate-pulse" style={{ animationDuration: '2s' }}></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-rose-500/40 rounded-full animate-pulse" style={{ animationDuration: '1.5s' }}></div>
          </div>
          <div className="w-8 h-8 bg-rose-500 rounded-full"></div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl text-rose-200 font-light">
            Connecting with a peer...
          </h2>
          <p className="text-rose-300/80 text-sm font-light min-h-[24px] transition-opacity duration-500">
            {prompts[currentPrompt]}
          </p>
        </div>

        <div className="pt-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
