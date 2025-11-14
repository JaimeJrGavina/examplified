import React, { useState } from 'react';
import { Flag, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { Question } from '../types';

interface ExamSidebarProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  flaggedQuestions: Set<string>;
  onNavigate: (index: number) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

type FilterType = 'All' | 'Flagged' | 'Unanswered' | 'Answered';

const ExamSidebar: React.FC<ExamSidebarProps> = ({
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onNavigate,
  isOpen,
  toggleSidebar
}) => {
  const [filter, setFilter] = useState<FilterType>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getStatusColor = (index: number, id: string) => {
    const isCurrent = index === currentQuestionIndex;
    const hasAnswer = answers[id] && answers[id].trim().length > 0;
    
    // Examplified Logic approximation:
    // Current: Blue border.
    // Answered: Filled Blue.
    // Unanswered: Gray border.
    
    if (isCurrent && hasAnswer) return "bg-[#007bff] border-[#007bff] text-white ring-2 ring-blue-200"; // Answered & Current
    if (isCurrent) return "bg-white border-[#007bff] text-[#007bff] ring-2 ring-blue-200"; // Unanswered & Current
    if (hasAnswer) return "bg-[#007bff] border-[#007bff] text-white"; // Answered
    return "bg-white border-gray-300 text-gray-500 hover:border-gray-400"; // Unanswered
  };

  const filteredQuestions = questions.map((q, idx) => ({ ...q, originalIndex: idx })).filter(q => {
    const hasAnswer = answers[q.id] && answers[q.id].trim().length > 0;
    const isFlagged = flaggedQuestions.has(q.id);

    if (filter === 'Flagged') return isFlagged;
    if (filter === 'Unanswered') return !hasAnswer;
    if (filter === 'Answered') return hasAnswer;
    return true;
  });

  return (
    <div
      className={`
        flex flex-col bg-[#f8f9fa] border-r border-gray-300 h-full
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-0 overflow-hidden'}
      `}
    >
      {/* Filter Header */}
      <div className="h-12 bg-white border-b border-gray-300 flex items-center justify-between px-4 shrink-0">
         <div className="relative w-full">
            <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider hover:text-blue-600 w-full"
            >
                <Filter className="w-4 h-4" />
                {filter === 'All' ? 'Filter' : filter}
                <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${isFilterOpen ? 'rotate-90' : ''}`} />
            </button>
            
            {isFilterOpen && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-200 shadow-lg rounded-b-md z-20 py-1">
                    {['All', 'Flagged', 'Unanswered', 'Answered'].map((f) => (
                        <div 
                            key={f}
                            onClick={() => { setFilter(f as FilterType); setIsFilterOpen(false); }}
                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${filter === f ? 'text-blue-600 font-bold' : 'text-gray-700'}`}
                        >
                            {f}
                        </div>
                    ))}
                </div>
            )}
         </div>
      </div>

      {/* Question List */}
      <div className="flex-1 overflow-y-auto p-4 custom-scroll">
        <div className="space-y-3">
            {filteredQuestions.map((q) => {
                const idx = q.originalIndex;
                const isFlagged = flaggedQuestions.has(q.id);
                const statusClasses = getStatusColor(idx, q.id);

                return (
                    <button
                        key={q.id}
                        onClick={() => onNavigate(idx)}
                        className="group w-full flex items-center gap-3 p-1 hover:bg-gray-100 rounded transition-colors relative"
                    >
                        {/* Circle Indicator */}
                        <div className={`
                            w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold shadow-sm transition-all
                            ${statusClasses}
                        `}>
                            {idx + 1}
                        </div>

                        {/* Text Label */}
                        <div className="flex flex-col items-start">
                            <span className={`text-sm font-medium ${idx === currentQuestionIndex ? 'text-blue-700' : 'text-gray-600'}`}>
                                Question {idx + 1}
                            </span>
                            <span className="text-xs text-gray-400">
                                {answers[q.id]?.trim().length > 0 ? 'Answered' : 'Unanswered'}
                            </span>
                        </div>

                        {/* Flag Icon */}
                        {isFlagged && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Flag className="w-4 h-4 text-orange-500 fill-orange-500" />
                            </div>
                        )}
                    </button>
                );
            })}
            
            {filteredQuestions.length === 0 && (
                <div className="text-center text-gray-500 text-sm py-8">
                    No questions found for filter "{filter}"
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ExamSidebar;