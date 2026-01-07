import React, { useState, useEffect } from 'react';
import { playClickSound } from '../utils/audioUtils';

export type QuestionType = 'single-choice' | 'multi-choice' | 'text';

export interface FeedbackQuestion {
  id: number;
  question: string;
  type: QuestionType;
  options?: string[];
  placeholder?: string;
  charLimit?: number;
  icon?: string;
}

export interface UserResponse {
  questionId: number;
  answer: string | string[];
}

interface FeedbackStepProps {
  question: FeedbackQuestion;
  stepNumber: number;
  totalSteps: number;
  currentResponse?: UserResponse;
  onResponse: (id: number, answer: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  cooldownTimer?: number;
  isSubmitting?: boolean;
}

const Icons: Record<string, React.ReactNode> = {
  rating: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" className="text-brand-orange" />
    </svg>
  ),
  features: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h7v7H3z" className="text-brand-orange" />
      <path d="M14 3h7v7h-7z" className="opacity-40 text-orange-300" />
      <path d="M14 14h7v7h-7z" className="text-orange-400" />
      <path d="M3 14h7v7H3z" className="opacity-40 text-orange-300" />
    </svg>
  ),
  experience: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" className="text-brand-orange" />
    </svg>
  ),
  improvement: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" className="text-brand-orange" />
    </svg>
  ),
  message: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" className="text-brand-orange" />
    </svg>
  )
};

const FeedbackStep: React.FC<FeedbackStepProps> = ({
  question,
  stepNumber,
  totalSteps,
  currentResponse,
  onResponse,
  onNext,
  onBack,
  onSkip,
  cooldownTimer = 0,
  isSubmitting = false
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [localText, setLocalText] = useState('');
  const [tappedOption, setTappedOption] = useState<string | null>(null);

  useEffect(() => {
    if (currentResponse) {
      if (question.type === 'multi-choice' && Array.isArray(currentResponse.answer)) {
        setSelectedOptions(currentResponse.answer);
      } else if (question.type === 'text' && typeof currentResponse.answer === 'string') {
        setLocalText(currentResponse.answer);
      } else if (question.type === 'single-choice' && typeof currentResponse.answer === 'string') {
        setSelectedOptions([currentResponse.answer]);
      }
    } else {
      setSelectedOptions([]);
      setLocalText('');
    }
  }, [question.id, currentResponse]);

  const handleOptionClick = (option: string) => {
    playClickSound();
    setTappedOption(option);

    if (question.type === 'single-choice') {
      setSelectedOptions([option]);
      onResponse(question.id, option);
    } else if (question.type === 'multi-choice') {
      const newSelection = selectedOptions.includes(option)
        ? selectedOptions.filter(o => o !== option)
        : [...selectedOptions, option];

      setSelectedOptions(newSelection);
      onResponse(question.id, newSelection);
    }

    setTimeout(() => setTappedOption(null), 150);
  };

  return (
    <div className="w-full flex flex-col items-center bg-dark-bg selection:bg-orange-500/30 selection:text-orange-200 relative">
      {/* Background soft glow for depth in dark mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-orange-600/20 blur-[50px] sm:blur-[75px] lg:blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-orange-900/10 blur-[50px] sm:blur-[75px] lg:blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-5xl flex flex-col px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="flex flex-col w-full">
          <header className="flex flex-col items-center py-2 sm:py-4 md:py-5 lg:py-2 flex-shrink-0 z-10">
            <div className="w-full grid grid-cols-3 items-center mb-3 sm:mb-4 md:mb-5 lg:mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-8 lg:h-8 bg-zinc-900/80 rounded-lg sm:rounded-xl md:rounded-xl lg:rounded-lg flex items-center justify-center shadow-lg border border-zinc-800 backdrop-blur-sm">
                  {Icons[question.icon || 'message']}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-zinc-500 font-black text-[8px] sm:text-[9px] md:text-[9px] lg:text-[8px] uppercase tracking-[0.15em] sm:tracking-[0.2em] leading-none mb-0.5 sm:mb-1">
                  Step
                </span>
                <span className="text-orange-500 font-extrabold text-xs sm:text-sm md:text-sm lg:text-xs">
                  {stepNumber} / {totalSteps}
                </span>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => {
                    playClickSound();
                    onSkip();
                  }}
                  disabled={cooldownTimer > 0}
                  className={`font-black text-[8px] sm:text-[9px] md:text-[9px] lg:text-[8px] px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg transition-all uppercase tracking-widest ${
                    cooldownTimer > 0
                      ? 'text-zinc-700 cursor-not-allowed'
                      : 'text-zinc-500 hover:text-orange-400 hover:bg-zinc-900'
                  }`}
                >
                  {cooldownTimer > 0 ? `${cooldownTimer}s` : 'Skip'}
                </button>
              </div>
            </div>

            <div className="w-full flex gap-0.5 sm:gap-1 px-0.5 sm:px-1">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-500 ease-out ${
                    i < stepNumber ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.3)] sm:shadow-[0_0_8px_rgba(249,115,22,0.4)]' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </header>

          <main className="flex-grow flex flex-col pb-2 sm:pb-3">
            <div key={question.id} className="pt-1 sm:pt-2 lg:pt-4">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-xl xl:text-2xl font-black text-white leading-[1.1] tracking-tight mb-4 sm:mb-6 md:mb-7 lg:mb-3 xl:mb-4 stagger-item">
                {question.question}
              </h1>

              <div className="space-y-2 sm:space-y-3 md:space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
                {question.options?.map((option, idx) => {
                  const isSelected = Array.isArray(currentResponse?.answer)
                    ? currentResponse.answer.includes(option)
                    : currentResponse?.answer === option;

                  const isTapping = tappedOption === option;

                  return (
                    <button
                      key={`${question.id}-${idx}`}
                      onClick={() => handleOptionClick(option)}
                      className={`stagger-item w-full text-left p-3 sm:p-4 md:p-4 lg:p-2 xl:p-3 rounded-xl sm:rounded-xl border-2 transition-all duration-300 flex items-center gap-3 sm:gap-4 md:gap-4 lg:gap-2 xl:gap-3 group ${
                        isTapping ? 'card-active-tap' : ''
                      } ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 shadow-[0_4px_20px_rgb(0,0,0,0.3)] sm:shadow-[0_6px_25px_rgb(0,0,0,0.35)] md:shadow-[0_7px_28px_rgb(0,0,0,0.37)] lg:shadow-[0_8px_30px_rgb(0,0,0,0.4)]'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60'
                      }`}
                      style={{ animationDelay: `${idx * 0.03}s` }}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-5 lg:h-5 xl:w-6 xl:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-700 bg-zinc-800 group-hover:border-zinc-600'
                      }`}>
                        <svg className={`w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 lg:w-2.5 lg:h-2.5 xl:w-3 xl:h-3 transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className={`text-sm sm:text-base md:text-base lg:text-xs xl:text-sm font-bold tracking-tight ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {option}
                      </span>
                    </button>
                  );
                })}

                {question.type === 'text' && (
                  <div className="stagger-item relative group lg:col-span-2" style={{ animationDelay: '0.1s' }}>
                    <textarea
                      autoFocus
                      className="w-full p-4 sm:p-5 md:p-6 lg:p-3 xl:p-4 rounded-2xl bg-zinc-900 border border-zinc-800 focus:border-orange-500 focus:outline-none text-base sm:text-lg md:text-xl lg:text-sm xl:text-base font-bold tracking-tight transition-all min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[100px] xl:min-h-[120px] resize-none placeholder:text-zinc-700 text-white leading-relaxed mb-4"
                      placeholder={question.placeholder}
                      maxLength={question.charLimit}
                      value={localText}
                      onChange={(e) => {
                        setLocalText(e.target.value);
                        onResponse(question.id, e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />

                    <div className="flex items-center justify-between px-4">
                      <span className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${localText.length >= (question.charLimit || 1000) * 0.9 ? 'text-red-500' : 'text-zinc-600'}`}>
                        {localText.length} / {question.charLimit || 1000}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <footer className="py-2 sm:py-3 flex-shrink-0 flex items-center justify-between bg-dark-bg/95 backdrop-blur-xl border-t border-zinc-800 z-20">
            <button
              onClick={() => {
                playClickSound();
                onBack();
              }}
              disabled={stepNumber === 1}
              className={`flex items-center gap-2 font-bold text-sm sm:text-base md:text-base lg:text-sm px-4 py-3 lg:px-3 lg:py-2 rounded-xl transition-all ${
                stepNumber === 1 ? 'opacity-0 pointer-events-none' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <svg className="w-5 h-5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button
              onClick={() => {
                playClickSound();
                onNext();
              }}
              disabled={!currentResponse?.answer || cooldownTimer > 0 || isSubmitting}
              className={`flex items-center gap-2 font-bold text-sm sm:text-base md:text-lg lg:text-sm px-8 sm:px-10 md:px-12 lg:px-6 py-3 sm:py-4 lg:py-2 rounded-xl transition-all transform active:scale-95 ${
                !currentResponse?.answer || cooldownTimer > 0 || isSubmitting
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white shadow-lg hover:bg-orange-400 hover:shadow-xl'
              }`}
            >
              {cooldownTimer > 0 ? `Wait ${cooldownTimer}s` :
               isSubmitting ? 'Submitting...' :
               stepNumber === totalSteps ? 'Submit' : 'Continue'}
              {isSubmitting ? (
                <svg className="w-5 h-5 lg:w-4 lg:h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
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

        .card-active-tap {
          transform: scale(0.97) !important;
          transition: transform 0.1s ease-out;
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

export default FeedbackStep;
