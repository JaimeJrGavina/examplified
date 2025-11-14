

import React, { useRef, useEffect, useState } from 'react';
import { Question } from '../types';
import { 
  Flag, ChevronLeft, ChevronRight, Highlighter, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, IndentDecrease, IndentIncrease, Undo, Redo,
  Subscript, Superscript, Type, Hash, Sigma
} from 'lucide-react';

interface QuestionAreaProps {
  question: Question;
  currentAnswer: string;
  onAnswerChange: (text: string) => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
  onNext: () => void;
  onPrev: () => void;
  questionIndex: number;
  totalQuestions: number;
}

const QuestionArea: React.FC<QuestionAreaProps> = ({
  question,
  currentAnswer,
  onAnswerChange,
  isFlagged,
  onToggleFlag,
  onNext,
  onPrev,
  questionIndex,
  totalQuestions
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Sync local contentEditable with parent state (only on mount or question change)
  useEffect(() => {
    if (editorRef.current) {
        // Simple check to avoid resetting cursor position if unnecessary re-render
        if (editorRef.current.innerHTML !== currentAnswer) {
            editorRef.current.innerHTML = currentAnswer;
        }
        updateCounts();
    }
  }, [question.id]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      onAnswerChange(html);
      updateCounts();
    }
  };

  const updateCounts = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || "";
    setCharCount(text.length);
    setWordCount(text.trim().split(/\s+/).filter(w => w.length > 0).length);
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  return (
    <div className="flex flex-col bg-[#eef2f6]">
      
      {/* Question Header Control Bar */}
      <div className="bg-white border-b border-gray-300 h-14 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">Question {questionIndex + 1}</span>
                {/* <ChevronDown className="w-4 h-4 text-gray-400" /> */}
            </div>
            
            <button 
                onClick={onToggleFlag}
                className={`
                    flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border
                    ${isFlagged 
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700' 
                        : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'}
                `}
            >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-yellow-600 text-yellow-600' : ''}`} />
                FLAG QUESTION
            </button>

            <button className="p-2 text-gray-400 hover:text-yellow-500 transition-colors rounded hover:bg-yellow-50" title="Highlighter">
                <Highlighter className="w-5 h-5" />
            </button>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={onPrev} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30" disabled={questionIndex === 0}>
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={onNext} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30" disabled={questionIndex === totalQuestions - 1}>
                <ChevronRight className="w-6 h-6" />
            </button>
        </div>
      </div>

      {/* Content Area - Split Vertical */}
      <div className="flex flex-col p-4 gap-4 max-w-5xl mx-auto w-full">
        
        {/* Top: Fact Pattern / Question Text */}
        <div 
            className="bg-white rounded-sm shadow-sm border border-gray-300 p-8 relative"
        >
            <div className="prose max-w-none text-gray-800 leading-relaxed text-lg font-serif select-text">
                {question.text.split('\n').map((p, i) => (
                    <p key={i} className="mb-4">{p}</p>
                ))}
            </div>
        </div>

        {/* Bottom: Answer Editor */}
        <div className="bg-white rounded-sm shadow-sm border border-gray-300 flex flex-col min-h-[400px]">
            {/* Answer Header */}
            <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">Essay Answer</span>
                </div>
                <div className="flex items-center gap-2">
                    <Type className="w-3 h-3" />
                    <span>{charCount}/100000 characters</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-[#f1f3f4] border-b border-gray-300 p-1 flex items-center flex-wrap gap-1 select-none">
                {/* Font Controls (Mock Visuals) */}
                <div className="flex items-center bg-white border border-gray-300 rounded-sm h-7 px-2 mr-1">
                    <span className="text-xs font-serif pr-4">Times New Roman</span>
                    <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
                </div>
                <div className="flex items-center bg-white border border-gray-300 rounded-sm h-7 px-2 mr-2 w-14">
                    <span className="text-xs">14pt</span>
                    <ChevronDown className="w-3 h-3 text-gray-500 ml-auto" />
                </div>

                <div className="h-5 w-px bg-gray-300 mx-1"></div>

                {/* Formatting */}
                <ToolbarBtn icon={<Undo className="w-3.5 h-3.5" />} onClick={() => execCmd('undo')} title="Undo" />
                <ToolbarBtn icon={<Redo className="w-3.5 h-3.5" />} onClick={() => execCmd('redo')} title="Redo" />
                
                <div className="h-5 w-px bg-gray-300 mx-1"></div>

                <ToolbarBtn icon={<Bold className="w-3.5 h-3.5" />} onClick={() => execCmd('bold')} title="Bold" />
                <ToolbarBtn icon={<Underline className="w-3.5 h-3.5" />} onClick={() => execCmd('underline')} title="Underline" />
                <ToolbarBtn icon={<Italic className="w-3.5 h-3.5" />} onClick={() => execCmd('italic')} title="Italic" />
                
                <div className="h-5 w-px bg-gray-300 mx-1"></div>

                <ToolbarBtn icon={<Subscript className="w-3.5 h-3.5" />} onClick={() => execCmd('subscript')} title="Subscript" />
                <ToolbarBtn icon={<Superscript className="w-3.5 h-3.5" />} onClick={() => execCmd('superscript')} title="Superscript" />

                <div className="h-5 w-px bg-gray-300 mx-1"></div>

                <ToolbarBtn icon={<AlignLeft className="w-3.5 h-3.5" />} onClick={() => execCmd('justifyLeft')} title="Align Left" />
                <ToolbarBtn icon={<AlignCenter className="w-3.5 h-3.5" />} onClick={() => execCmd('justifyCenter')} title="Center" />
                <ToolbarBtn icon={<AlignRight className="w-3.5 h-3.5" />} onClick={() => execCmd('justifyRight')} title="Align Right" />
                <ToolbarBtn icon={<AlignJustify className="w-3.5 h-3.5" />} onClick={() => execCmd('justifyFull')} title="Justify" />

                <div className="h-5 w-px bg-gray-300 mx-1"></div>

                <ToolbarBtn icon={<Sigma className="w-3.5 h-3.5" />} onClick={() => execCmd('insertText', 'Ω')} title="Special Character" />
                <ToolbarBtn icon={<div className="font-serif font-bold text-xs">Page Break</div>} onClick={() => execCmd('insertHorizontalRule')} title="Page Break" wide />

                <div className="h-5 w-px bg-gray-300 mx-1"></div>

                <ToolbarBtn icon={<IndentDecrease className="w-3.5 h-3.5" />} onClick={() => execCmd('outdent')} title="Decrease Indent" />
                <ToolbarBtn icon={<IndentIncrease className="w-3.5 h-3.5" />} onClick={() => execCmd('indent')} title="Increase Indent" />
                <ToolbarBtn icon={<List className="w-3.5 h-3.5" />} onClick={() => execCmd('insertUnorderedList')} title="Bullet List" />
                <ToolbarBtn icon={<ListOrdered className="w-3.5 h-3.5" />} onClick={() => execCmd('insertOrderedList')} title="Numbered List" />

            </div>

            {/* Editor */}
            <div 
                className="flex-1 overflow-y-auto bg-white cursor-text relative"
                onClick={() => editorRef.current?.focus()}
            >
                <div
                    ref={editorRef}
                    contentEditable
                    onInput={handleInput}
                    className="w-full min-h-full p-6 outline-none text-black"
                    style={{ 
                        fontFamily: '"Times New Roman", Times, serif',
                        fontSize: '14pt',
                        lineHeight: '1.5',
                    }}
                    spellCheck={false}
                />
                
                {(!currentAnswer || currentAnswer.trim() === '' || currentAnswer === '<br>') && (
                    <div className="absolute top-6 left-6 text-gray-300 pointer-events-none" style={{ fontFamily: '"Times New Roman", serif', fontSize: '14pt' }}>
                        |
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};

const ToolbarBtn: React.FC<{ icon: React.ReactNode, onClick: () => void, title: string, wide?: boolean }> = ({ icon, onClick, title, wide }) => (
    <button 
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className={`flex items-center justify-center h-7 rounded-sm hover:bg-gray-300 hover:shadow-inner transition-colors text-gray-700 ${wide ? 'px-2' : 'w-8'}`}
        title={title}
    >
        {icon}
    </button>
);

function ChevronDown(props: any) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            {...props}
        >
            <path d="m6 9 6 6 6-6"/>
        </svg>
    );
}

export default QuestionArea;