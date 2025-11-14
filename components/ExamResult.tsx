

import React, { useState, useEffect } from 'react';
import { CheckCircle, Home, FileText, AlertTriangle } from 'lucide-react';
import { ExamSession, Exam, Question } from '../types';
import { gradeEssayAnswer, GradedAnswer } from '../services/geminiService';

// Sub-component for individual question result
interface QuestionResultCardProps {
    question: Question;
    userAnswer: string;
    questionIndex: number;
    onScoreCalculated: (score: number) => void;
}

const QuestionResultCard: React.FC<QuestionResultCardProps> = ({ question, userAnswer, questionIndex, onScoreCalculated }) => {
    const hasAnswer = userAnswer && userAnswer.trim().length > 0 && userAnswer.trim() !== '<br>';

    useEffect(() => {
        const getGrade = async () => {
            // Only grade if there's an answer and a model answer to compare against
            if (!hasAnswer || !question.modelAnswer) {
                onScoreCalculated(0);
                return;
            }
            try {
                const result = await gradeEssayAnswer(question.text, userAnswer, question.modelAnswer);
                onScoreCalculated(result.score);
            } catch (error) {
                console.error("Grading failed for question:", question.id, error);
                onScoreCalculated(0);
            }
        };

        getGrade();
    }, [question.id, question.text, question.modelAnswer, userAnswer, hasAnswer, onScoreCalculated]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Question Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <span className="font-bold text-gray-700">Problem {questionIndex + 1}</span>
                {!hasAnswer && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                        <AlertTriangle className="w-3 h-3" />
                        NO ANSWER SUBMITTED
                    </span>
                )}
            </div>

            <div className="p-6 space-y-6">
                 {/* Fact Pattern */}
                <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-500 font-bold mb-2">Fact Pattern</h4>
                    <div className="prose prose-sm max-w-none text-gray-800 bg-gray-50 p-4 rounded border border-gray-200 font-serif whitespace-pre-wrap">
                        {question.text}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Your Answer */}
                    <div>
                        <h4 className="text-sm uppercase tracking-wide text-blue-600 font-bold mb-2">Your Answer</h4>
                        <div
                            className="prose prose-sm max-w-none text-gray-900 bg-white p-4 rounded border border-blue-100 shadow-inner min-h-[150px] font-serif"
                            dangerouslySetInnerHTML={{ __html: hasAnswer ? userAnswer : '<span class="text-gray-400 italic">No answer provided.</span>' }}
                        />
                    </div>
                    {/* Model Answer */}
                    <div>
                        <h4 className="text-sm uppercase tracking-wide text-green-700 font-bold mb-2 flex items-center gap-2">
                           <CheckCircle className="w-4 h-4" /> Model Answer
                        </h4>
                        <div className="prose prose-sm max-w-none text-gray-800 bg-green-50/50 p-4 rounded border border-green-100 min-h-[150px] font-serif leading-relaxed whitespace-pre-wrap">
                             {question.modelAnswer ? question.modelAnswer : (
                                <span className="text-gray-400 italic">No model answer available.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


// Main component
interface ExamResultProps {
    session: ExamSession;
    exam: Exam;
    onReturnToDashboard: () => void;
}

const ExamResult: React.FC<ExamResultProps> = ({ session, exam, onReturnToDashboard }) => {
    const [scores, setScores] = useState<Record<string, number>>({});
    const totalQuestions = exam.questions?.length || 0;
    const questions = exam.questions || [];

    const handleScoreUpdate = (questionId: string, score: number) => {
        setScores(prev => ({ ...prev, [questionId]: score }));
    };

    // FIX: Add explicit return type to the reduce function's callback to ensure correct type inference.
    const totalScore = Object.values(scores).reduce((sum: number, score: number): number => sum + score, 0);
    const maxScore = totalQuestions * 10;
    const allScoresReported = Object.keys(scores).length === totalQuestions;
    const percentage = maxScore > 0 && allScoresReported ? Math.round((Number(totalScore) / maxScore) * 100) : null;

    return (
        <div className="flex flex-col h-screen bg-gray-100 font-sans">
            {/* Header */}
            <header className="bg-[#2d3e50] text-white p-6 shadow-md shrink-0">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Submission Complete</h1>
                        <p className="text-gray-300 text-sm">Assessment: {exam.title}</p>
                    </div>
                     <div className="flex items-center gap-6">
                        {percentage !== null ? (
                            <div className="text-right">
                                <span className="text-sm text-gray-300">Overall Score</span>
                                <p className="text-3xl font-bold">{percentage}% <span className="text-lg font-medium text-gray-200">({totalScore}/{maxScore})</span></p>
                            </div>
                        ) : (
                            <div className="text-right">
                                <span className="text-sm text-gray-300">Calculating Score...</span>
                                <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin mt-2 ml-auto"></div>
                            </div>
                        )}
                        <div className="bg-green-500/20 border border-green-500/30 px-4 py-2 rounded flex items-center gap-2 text-green-100">
                            <CheckCircle className="w-5 h-5" />
                            <span>Securely Uploaded</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto p-8">
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Performance Review</h2>
                        <p className="text-gray-500">Each answer has been automatically graded and analyzed by AI.</p>
                    </div>
                    <button 
                        onClick={onReturnToDashboard}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        Back to Dashboard
                    </button>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Graded Responses
                </h3>

                <div className="space-y-8">
                    {questions.map((q, index) => (
                       <QuestionResultCard
                            key={q.id}
                            question={q}
                            userAnswer={session.answers[q.id] || ''}
                            questionIndex={index}
                            onScoreCalculated={(score) => handleScoreUpdate(q.id, score)}
                       />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ExamResult;