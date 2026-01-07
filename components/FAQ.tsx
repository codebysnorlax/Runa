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
    fetch(`/Runa/json/faq.json?t=${Date.now()}`)
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
          <div className="text-center py-8 text-gray-400">Loading FAQs...</div>
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
