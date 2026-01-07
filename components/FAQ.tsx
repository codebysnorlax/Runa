import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  { question: "What is Runa?", answer: "Runa is an AI-powered running fitness app that helps you track runs, analyze performance, build streaks, and improve consistency with smart insights." },
  { question: "Is my data safe on Runa?", answer: "Yes. Your data is stored locally in your browser, giving you full control and strong privacy. You can also download a backup anytime." },
  { question: "Do I need an account to use Runa?", answer: "Yes. An account keeps your data secure and personalized, ensuring it stays separate from other users." },
  { question: "What can I track with Runa?", answer: "You can log your run distance, time, speed, notes, and view detailed stats, analytics, and progress over time." },
  { question: "Can I edit or delete my runs?", answer: "Yes. All runs can be edited or deleted at any time, and your stats update instantly." },
  { question: "Does Runa support goals and streaks?", answer: "Yes. Runa helps you set weekly goals and track running streaks to stay motivated and consistent." },
  { question: "What are AI Insights?", answer: "AI Insights analyze your running data and provide personalized tips, feedback, and training suggestions to help you improve." },
  { question: "Can I see analytics and charts?", answer: "Yes. Runa offers easy-to-read charts, heatmaps, and performance trends to track your progress visually." },
  { question: "Can I back up my data?", answer: "Yes. You can download your data as a backup file and restore it whenever needed." },
  { question: "Will Runa support cloud backup in the future?", answer: "Yes. Optional cloud backup is planned, allowing secure cross-device access while keeping you in control of your data." },
  { question: "Does Runa work on mobile devices?", answer: "Yes. Runa is fully responsive and works smoothly on mobile, tablet, and desktop." },
  { question: "How can I give feedback?", answer: "You can share feedback directly inside the app to help improve future updates." }
];

const FAQItem: React.FC<{ item: FAQItem; isOpen: boolean; onToggle: () => void }> = ({ item, isOpen, onToggle }) => (
  <div className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-800/30 hover:bg-gray-800/50 hover:border-brand-orange/40 transition-all duration-200">
    <button
      onClick={onToggle}
      className="w-full px-4 py-3.5 flex items-center justify-between text-left group"
    >
      <span className="text-sm font-medium text-gray-100 group-hover:text-brand-orange transition-colors pr-3">{item.question}</span>
      <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-brand-orange transition-all duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
      <div className="overflow-hidden">
        <div className="px-4 pb-4 pt-1">
          <p className="text-sm text-gray-400 leading-relaxed">{item.answer}</p>
        </div>
      </div>
    </div>
  </div>
);

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="animate-fade-in pb-6">
      <div className="flex items-center space-x-2 mb-5">
        <HelpCircle className="w-5 h-5 text-brand-orange" />
        <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
      </div>
      <div className="space-y-2.5">
        {FAQ_DATA.map((item, index) => (
          <FAQItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </div>
  );
};

export default FAQ;
