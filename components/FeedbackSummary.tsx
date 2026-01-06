import React, { useEffect } from 'react';
import { FeedbackQuestion, UserResponse } from './FeedbackStep';

interface FeedbackSummaryProps {
  questions: FeedbackQuestion[];
  responses: UserResponse[];
  onRestart: () => void;
}

const SummaryIcons: Record<string, React.ReactNode> = {
  rating: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  ),
  features: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  experience: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  improvement: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  message: (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
};

const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({
  questions,
  responses,
  onRestart
}) => {
  return (
    <div className="w-full flex flex-col items-center bg-dark-bg selection:bg-orange-500/30 selection:text-orange-200 relative">
      {/* Background soft glow for depth in dark mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-orange-600/20 blur-[50px] sm:blur-[75px] lg:blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-orange-900/10 blur-[50px] sm:blur-[75px] lg:blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-5xl flex flex-col px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="flex flex-col w-full py-1 sm:py-3 lg:py-2 relative">
          <div className="flex-grow overflow-y-auto hide-scrollbar pt-1 sm:pt-2 pb-4 sm:pb-6 lg:pb-4">
            <div className="text-center mb-6 sm:mb-8 lg:mb-4 xl:mb-6 pt-2 sm:pt-4 lg:pt-2 relative">
              <div className="seal-container relative mx-auto mb-3 sm:mb-4 lg:mb-2 w-10 h-10 sm:w-12 sm:h-12 lg:w-8 lg:h-8 xl:w-10 xl:h-10">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-pulse blur-lg xl:blur-xl" />
                <div className="success-seal seal-bounce relative w-full h-full rounded-full flex items-center justify-center text-white z-10">
                   <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-4 lg:h-4 xl:w-6 xl:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                   </svg>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-xl xl:text-2xl font-black text-white mb-1 sm:mb-2 tracking-tighter stagger-item">
                Thank You!
              </h2>
              <p className="text-[9px] sm:text-[10px] lg:text-[8px] xl:text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] lg:tracking-[0.5em] stagger-item">
                Feedback Submitted
              </p>
            </div>

            <div className="relative space-y-4 sm:space-y-6 lg:space-y-2 xl:space-y-3 mb-8 sm:mb-10 lg:mb-4 px-1 sm:px-2">
              {/* Vertical Track Line */}
              <div className="absolute left-[18px] sm:left-[20px] lg:left-[16px] xl:left-[20px] top-3 sm:top-4 lg:top-2 bottom-3 sm:bottom-4 lg:bottom-2 w-[1.5px] sm:w-[2px] bg-zinc-900 -z-10" />

              {questions.map((q, idx) => {
                const resp = responses.find(r => r.questionId === q.id);
                const answer = resp ? (Array.isArray(resp.answer) ? resp.answer.join(', ') : resp.answer) : 'Skipped';
                const baseDelay = 0.1 + idx * 0.05;

                return (
                  <div 
                    key={q.id} 
                    className="stagger-item group flex items-start gap-3 sm:gap-4 lg:gap-2 xl:gap-3"
                    style={{ animationDelay: `${baseDelay}s` }}
                  >
                    {/* Column 1: Sidebar */}
                    <div className="relative flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 lg:w-8 lg:h-8 xl:w-10 xl:h-10 flex items-center justify-center">
                       <div className="absolute inset-0 bg-dark-bg rounded-lg sm:rounded-xl lg:rounded-lg border border-zinc-800 shadow-lg sm:shadow-xl group-hover:border-orange-500/50 transition-colors duration-500" />
                       <div className="relative w-4 h-4 sm:w-5 sm:h-5 lg:w-3 lg:h-3 xl:w-4 xl:h-4 text-orange-500 group-hover:scale-110 transition-transform duration-500">
                          {SummaryIcons[q.icon || 'message']}
                       </div>
                    </div>

                    {/* Column 2: Content */}
                    <div 
                      className="flex flex-col gap-1 sm:gap-1.5 lg:gap-0.5 pt-0.5 sm:pt-1 lg:pt-0 subtle-reveal"
                      style={{ animationDelay: `${baseDelay + 0.15}s` }}
                    >
                      <span className="text-[8px] sm:text-[9px] lg:text-[7px] xl:text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">
                        {q.question}
                      </span>
                      <p className="text-zinc-50 font-bold text-sm sm:text-base lg:text-xs xl:text-sm leading-tight tracking-tight break-words">
                        {answer || <span className="text-zinc-800 italic">No response</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="py-2 sm:py-3 flex-shrink-0 border-t border-zinc-800 flex flex-col items-center gap-2 bg-dark-bg/95 backdrop-blur-md stagger-item z-30">
            <button
              onClick={onRestart}
              className="px-6 py-2 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-400 transition-all active:scale-95 transform flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Submit Another</span>
            </button>
            <p className="text-zinc-700 font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[7px] sm:text-[8px] lg:text-[9px] xl:text-[10px]">
              Powered by Runa Fitness
            </p>
          </footer>
        </div>
      </div>

      <style jsx>{`
        .stagger-item {
          animation: staggerPop 0.4s cubic-bezier(0.2, 1, 0.3, 1) backwards;
        }

        @keyframes staggerPop {
          0% { 
            opacity: 0; 
            transform: translateY(10px) scale(0.99); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }

        .subtle-reveal {
          animation: innerReveal 0.8s cubic-bezier(0.2, 1, 0.3, 1) backwards;
        }

        @keyframes innerReveal {
          0% { 
            opacity: 0; 
            transform: translateY(4px); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .success-seal {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          box-shadow: 
            0 20px 50px -12px rgba(249, 115, 22, 0.4),
            inset 0 0 20px rgba(255, 255, 255, 0.2);
          border: 4px solid #18181b;
        }

        .seal-bounce {
          animation: sealPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes sealPop {
          0% { transform: scale(0.8) rotate(-5deg); opacity: 0; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default FeedbackSummary;
