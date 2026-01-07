import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQItem: React.FC<{ item: FAQItem; isOpen: boolean; onToggle: () => void }> = ({ item, isOpen, onToggle }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsTyping(true);
      setDisplayedText('');
      let index = 0;
      const interval = setInterval(() => {
        if (index < item.answer.length) {
          setDisplayedText(item.answer.slice(0, index + 1));
          index++;
        } else {
          setIsTyping(false);
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    } else {
      setDisplayedText('');
      setIsTyping(false);
    }
  }, [isOpen, item.answer]);

  return (
    <div className="border border-gray-700/50 rounded-lg overflow-hidden bg-gray-800/30 hover:bg-gray-800/50 hover:border-brand-orange/40 transition-all duration-300 hover:shadow-lg hover:shadow-brand-orange/10">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left group"
      >
        <span className="text-sm font-medium text-gray-100 group-hover:text-brand-orange transition-all duration-300 pr-3">{item.question}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-brand-orange transition-all duration-500 flex-shrink-0 ${isOpen ? 'rotate-180 text-brand-orange' : ''}`} />
      </button>
      <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-4 pt-1">
            <p className="text-sm text-gray-400 leading-relaxed">
              {displayedText}
              {isTyping && <span className="inline-block w-0.5 h-4 bg-brand-orange ml-0.5 animate-pulse"></span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<FAQItem[]>([]);
  const [lastFetch, setLastFetch] = useState(Date.now());

  const loadFAQs = () => {

    fetch(`${import.meta.env.BASE_URL}json/faq.json?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        setFaqData(data);
        setLastFetch(Date.now());
      })
      .catch(err => {
        console.error('Failed to load FAQ:', err);
      });
  };

  useEffect(() => {
    loadFAQs();
  }, []);

  return (
    <div className="animate-fade-in pb-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-brand-orange" />
          <h3 className="text-lg font-semibold text-white">Frequently Asked Questions</h3>
        </div>
        {/* <span className="text-xs text-gray-500">({faqData.length} FAQs)</span> */}
      </div>
      <div className="space-y-2.5">
        {faqData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="loader-container">
              <div className="loader-bar">
                <div className="loader-progress" />
              </div>
              <div className="loader-text" />
            </div>
            <style>{`
              .loader-container {
                display: flex;
                flex-direction: column;
                align-items: center;
              }
              .loader-bar {
                width: 100px;
                height: 3px;
                background-color: rgb(31, 41, 55);
                border-radius: 20px;
                overflow: hidden;
              }
              .loader-progress {
                width: 60px;
                height: 3px;
                background-color: #ff7a00;
                border-radius: 20px;
                margin-left: -60px;
                animation: go 1s 0s infinite;
              }
              @keyframes go {
                from {
                  margin-left: -100px;
                  width: 80px;
                }
                to {
                  width: 30px;
                  margin-left: 110px;
                }
              }
              .loader-text {
                width: 150px;
                height: 30px;
                margin-top: 20px;
                text-align: center;
                color: white;
                font-size: 14px;
                white-space: nowrap;
              }
              .loader-text::before {
                content: "Fetching FAQs";
                color: #9ca3af;
                animation: text 1s 0s infinite;
              }
              @keyframes text {
                0% { content: "Fetching FAQs"; }
                30% { content: "Fetching FAQs."; }
                60% { content: "Fetching FAQs.."; }
                100% { content: "Fetching FAQs..."; }
              }
            `}</style>
          </div>
        ) : (
          faqData.map((item, index) => (
            <FAQItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default FAQ;
