import React, { useState } from 'react';
import { ChevronDown, MoreVertical, Clock } from 'lucide-react';

interface ExamHeaderProps {
  title: string;
  timeLeftSeconds: number;
  studentName?: string;
  onToggleHideExam: () => void;
  onSubmit: () => void;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({
  title,
  timeLeftSeconds,
  onToggleHideExam,
  onSubmit
}) => {
  const [controlsOpen, setControlsOpen] = useState(false);

  // Simple time formatter
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} Minutes remaining`; 
    // Examplified often shows "X Minutes remaining" or a specific timer in Tool Kit. 
    // We'll show a simple text for now or hide it in Tool Kit if strictly following screenshots, 
    // but for UX we'll keep a subtle indicator or putting it in the dropdown.
  };

  return (
    <header className="bg-[#2d3e50] h-14 flex items-center justify-between px-4 text-white select-none z-50 relative shadow-md">
      <div className="flex items-center gap-4">
        {/* Hamburger / Menu Icon Placeholder */}
        <div className="text-gray-400 hover:text-white cursor-pointer">
             <div className="space-y-1">
                <div className="w-5 h-0.5 bg-current"></div>
                <div className="w-5 h-0.5 bg-current"></div>
                <div className="w-5 h-0.5 bg-current"></div>
             </div>
        </div>
        
        <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight">Examplified</span>
            <span className="text-gray-400 text-sm mx-2">|</span>
            <span className="text-sm font-medium text-gray-200 truncate max-w-xs">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 text-sm font-medium">
        {/* Exam Controls Dropdown */}
        <div className="relative">
            <button 
                onClick={() => setControlsOpen(!controlsOpen)}
                className="flex items-center gap-1 px-3 py-1.5 hover:bg-[#3e526a] rounded transition-colors"
            >
                EXAM CONTROLS
                <ChevronDown className="w-4 h-4" />
            </button>
            
            {controlsOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white text-gray-800 rounded shadow-xl border border-gray-200 py-1 z-50 text-sm">
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100">
                        Exam Notices
                    </div>
                    <div 
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
                        onClick={() => {
                            onToggleHideExam();
                            setControlsOpen(false);
                        }}
                    >
                        Hide Exam
                    </div>
                    <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 text-gray-400">
                        Suspend Exam
                    </div>
                    <div 
                        className="px-4 py-2 hover:bg-green-50 text-green-700 cursor-pointer font-semibold"
                        onClick={() => {
                            onSubmit();
                            setControlsOpen(false);
                        }}
                    >
                        Submit Exam
                    </div>
                </div>
            )}
        </div>

        {/* Tool Kit Dropdown */}
        <button className="flex items-center gap-1 px-3 py-1.5 hover:bg-[#3e526a] rounded transition-colors border-l border-[#3e526a] ml-1">
            TOOL KIT
            <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default ExamHeader;