
import React, { useState, useEffect } from 'react';
import { ViewState, Exam, ExamSession } from './types';
import { generateExamQuestions } from './services/geminiService';
import { MOCK_EXAMS } from './constants';
import Dashboard from './components/Dashboard';
import CustomerLogin from './components/CustomerLogin';
import CustomerRecovery from './components/CustomerRecovery';
import AdminLogin from './components/AdminLogin';
import ProtectedAdminDashboard from './components/ProtectedAdminDashboard';
import ExamHeader from './components/ExamHeader';
import ExamSidebar from './components/ExamSidebar';
import QuestionArea from './components/QuestionArea';
import ExamResult from './components/ExamResult';
import { EyeOff } from 'lucide-react';

const App: React.FC = () => {
    const [view, setView] = useState<ViewState>('DASHBOARD');
  const [availableExams, setAvailableExams] = useState<Exam[]>(MOCK_EXAMS);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [isExamHidden, setIsExamHidden] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
        const [customerToken, setCustomerToken] = useState<string | null>(sessionStorage.getItem('customerToken'));
        const [adminToken, setAdminToken] = useState<string | null>(sessionStorage.getItem('adminToken'));
        const [recoveryOpen, setRecoveryOpen] = useState(false);
        const [currentRoute, setCurrentRoute] = useState<string>(window.location.pathname);

    // Load exams from backend on app startup
    useEffect(() => {
        const loadExams = async () => {
            try {
                const res = await fetch('/exams');
                if (res.ok) {
                    const text = await res.text();
                    let data = null;
                    try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
                    if (data?.exams && data.exams.length > 0) {
                        setAvailableExams(data.exams);
                    }
                }
            } catch (err) {
                // Backend not running, use mock exams
                console.log('Backend not available, using mock exams');
            }
        };
        loadExams();
    }, []);

    // Handle route changes
    useEffect(() => {
      const handleRouteChange = () => {
        setCurrentRoute(window.location.pathname);
      };
      
      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }, []);

  useEffect(() => {
    if (view === 'TAKING_EXAM' && timeLeft > 0 && !isExamHidden) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam(); 
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [view, timeLeft, isExamHidden]);

  const handleSaveNewExam = (newExam: Exam) => {
      setAvailableExams(prev => [newExam, ...prev]);
      setView('DASHBOARD');
  };

    const handleDeleteExam = async (id: string) => {
            if (!confirm('Are you sure you want to delete this exam?')) return;
            const token = sessionStorage.getItem('adminToken');
            if (!token) {
                alert('Admin token missing. Please log in.');
                return;
            }
            try {
                const res = await fetch(`/admin/exams/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!res.ok) {
                    // Handle possible empty response body safely
                    let errMsg = res.statusText;
                    try {
                        const body = await res.text();
                        if (body) {
                            try {
                                const parsed = JSON.parse(body);
                                errMsg = parsed.error || JSON.stringify(parsed);
                            } catch (e) {
                                errMsg = body;
                            }
                        }
                    } catch (e) {
                        // ignore
                    }
                    alert(`Failed to delete exam: ${errMsg}`);
                    return;
                }

                // Try to parse response, but tolerate empty bodies
                try {
                    const body = await res.text();
                    if (body) {
                        try { JSON.parse(body); } catch (e) { /* ignore non-json */ }
                    }
                } catch (e) {
                    // ignore
                }

                setAvailableExams(prev => prev.filter(e => e.id !== id));
                alert('Exam deleted');
            } catch (err: any) {
                alert(`Error deleting exam: ${err.message}`);
            }
    };

  const handleEditExam = (updatedExam: Exam) => {
      setAvailableExams(prev => prev.map(e => e.id === updatedExam.id ? updatedExam : e));
  };

  const handleStartExam = async (exam: Exam) => {
    setIsLoading(true);
    setView('LOADING_EXAM');
    
    let questions = exam.questions;

    // If questions don't exist (mock data w/o questions), generate them
    if (!questions || questions.length === 0) {
         questions = await generateExamQuestions(exam.subject, 3);
    }
    
    const examWithQuestions = { ...exam, questions };
    setCurrentExam(examWithQuestions);
    
    setSession({
        examId: exam.id,
        answers: {},
        flaggedQuestions: new Set(),
        startTime: Date.now(),
        isCompleted: false
    });
    
    setTimeLeft(exam.durationMinutes * 60);
    setCurrentQuestionIndex(0);
    setIsLoading(false);
    setView('TAKING_EXAM');
  };

  const handleAnswer = (text: string) => {
    if (!session || !currentExam?.questions) return;
    const questionId = currentExam.questions[currentQuestionIndex].id;
    
    setSession(prev => {
        if (!prev) return null;
        return {
            ...prev,
            answers: { ...prev.answers, [questionId]: text }
        };
    });
  };

  const toggleFlag = () => {
    if (!session || !currentExam?.questions) return;
    const questionId = currentExam.questions[currentQuestionIndex].id;

    setSession(prev => {
        if (!prev) return null;
        const newFlags = new Set(prev.flaggedQuestions);
        if (newFlags.has(questionId)) {
            newFlags.delete(questionId);
        } else {
            newFlags.add(questionId);
        }
        return { ...prev, flaggedQuestions: newFlags };
    });
  };

  const handleSubmitExam = () => {
     if (!session) return;
     setSession(prev => prev ? ({ ...prev, isCompleted: true }) : null);
     setView('RESULT');
  };

  const navigateQuestion = (direction: 'prev' | 'next') => {
      if (direction === 'prev') {
          setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
      } else {
          setCurrentQuestionIndex(prev => Math.min((currentExam?.questions?.length || 1) - 1, prev + 1));
      }
  };

  // --- NEW ROUTING LOGIC ---

  const handleAdminLogin = (token: string) => {
    sessionStorage.setItem('adminToken', token);
    setAdminToken(token);
    setView('ADMIN_DASHBOARD');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminToken');
    setAdminToken(null);
    window.history.pushState({}, '', '/');
    setCurrentRoute('/');
    setView('DASHBOARD'); // Reset view state
  };

  const handleBackToDashboard = () => {
    // Admin back button - keeps admin token active
    window.history.pushState({}, '', '/');
    setCurrentRoute('/');
    setView('DASHBOARD');
  };

  // Admin Route: /admin
  if (currentRoute.startsWith('/admin')) {
    if (adminToken) {
      return (
          <ProtectedAdminDashboard 
            onSaveExam={handleSaveNewExam}
            onBack={handleLogout}
            onBackToDashboard={handleBackToDashboard}
          />
      );
    }
    return <AdminLogin onLogin={handleAdminLogin} onBackToStudentLogin={() => {
        window.history.pushState({}, '', '/');
        setCurrentRoute('/');
    }} />;
  }

  if (view === 'LOADING_EXAM') {
      return (
          <div className="h-screen flex flex-col items-center justify-center bg-[#2d3e50]">
              <div className="bg-white p-10 rounded-lg shadow-2xl flex flex-col items-center border-t-4 border-[#007bff]">
                <div className="w-12 h-12 border-4 border-[#007bff] border-t-transparent rounded-full animate-spin mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Examplified</h2>
                <p className="text-gray-600 font-medium">Preparing secure environment...</p>
              </div>
          </div>
      );
  }

  if (view === 'RESULT' && session && currentExam) {
      return <ExamResult session={session} exam={currentExam} onReturnToDashboard={() => setView('DASHBOARD')} />;
  }

    if (view === 'TAKING_EXAM' && currentExam && session && currentExam.questions) {
        const currentQ = currentExam.questions[currentQuestionIndex];
        const isFlagged = session.flaggedQuestions.has(currentQ.id);
        const isLastQuestion = currentQuestionIndex === currentExam.questions.length - 1;

        return (
          <div className="min-h-screen bg-[#f8f9fa] relative">
            {/* Hide Exam Overlay */}
            {isExamHidden && (
                <div className="fixed inset-0 bg-[#2d3e50] z-[100] flex flex-col items-center justify-center text-white">
                    <EyeOff className="w-24 h-24 mb-6 opacity-50" />
                    <h1 className="text-4xl font-bold mb-4">Exam Hidden</h1>
                    <p className="text-xl text-gray-300 mb-8">The exam content is currently hidden. Press the button below to resume.</p>
                    <button
                        onClick={() => setIsExamHidden(false)}
                        className="px-8 py-3 bg-[#007bff] hover:bg-blue-600 text-white rounded font-bold text-lg shadow-lg transition-transform hover:scale-105"
                    >
                        Resume Exam
                    </button>
                </div>
            )}

            <ExamHeader
                title={currentExam.title}
                timeLeftSeconds={timeLeft}
                onToggleHideExam={() => setIsExamHidden(true)}
                onSubmit={() => {
                    if(window.confirm("Are you sure you want to submit your exam?")) {
                        handleSubmitExam();
                    }
                }}
            />

            <div className="flex">
                {/* Sidebar Navigation Pane */}
                <div className="relative shadow-xl">
                     <ExamSidebar
                        questions={currentExam.questions}
                        currentQuestionIndex={currentQuestionIndex}
                        answers={session.answers}
                        flaggedQuestions={session.flaggedQuestions}
                        onNavigate={(idx) => setCurrentQuestionIndex(idx)}
                        isOpen={sidebarOpen}
                        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    />
                    {/* Sidebar Toggle Handle */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="absolute top-1/2 -right-3 w-6 h-12 bg-gray-300 hover:bg-gray-400 rounded-r flex items-center justify-center cursor-pointer shadow-md border-y border-r border-gray-400"
                        title="Toggle Navigation Pane"
                    >
                        <div className="w-1 h-4 border-l border-r border-gray-500"></div>
                    </button>
                </div>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="pb-10"> {/* Add padding bottom for footer space */}
                        <QuestionArea
                            question={currentQ}
                            currentAnswer={session.answers[currentQ.id] || ''}
                            onAnswerChange={handleAnswer}
                            isFlagged={isFlagged}
                            onToggleFlag={toggleFlag}
                            onNext={() => navigateQuestion('next')}
                            onPrev={() => navigateQuestion('prev')}
                            questionIndex={currentQuestionIndex}
                            totalQuestions={currentExam.questions.length}
                        />
                    </div>

                    {/* Footer Status Bar */}
                    <footer className="fixed bottom-0 left-0 right-0 h-10 bg-[#e2e8f0] border-t border-gray-300 flex items-center justify-between px-4 text-xs font-semibold text-gray-600 select-none z-10">
                        <div className="flex items-center gap-6">
                            <span>{currentQuestionIndex + 1} OF {currentExam.questions.length} QUESTIONS</span>
                            <span>VERSION 2M.6.4</span>
                        </div>
                        <div className="flex items-center h-full">
                             <button
                                onClick={() => navigateQuestion('prev')}
                                disabled={currentQuestionIndex === 0}
                                className="h-full px-6 hover:bg-gray-300 disabled:opacity-50 disabled:hover:bg-transparent border-l border-gray-300 bg-[#343a40] text-white"
                            >
                                Previous
                            </button>
                            {isLastQuestion ? (
                                <button
                                    onClick={() => {
                                        if(window.confirm("Are you sure you want to submit your exam?")) {
                                            handleSubmitExam();
                                        }
                                    }}
                                    className="h-full px-8 bg-green-600 hover:bg-green-700 text-white font-bold tracking-wide ml-2 transition-colors"
                                >
                                    Submit
                                </button>
                            ) : (
                                 <button
                                    onClick={() => navigateQuestion('next')}
                                    className="h-full px-8 bg-[#007bff] hover:bg-blue-600 text-white font-bold tracking-wide ml-2 transition-colors"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </footer>
                </main>
            </div>
          </div>
        );
    }

  // Default student dashboard view
  if (customerToken || adminToken) {
    return (
      <Dashboard
        exams={availableExams}
        onStartExam={handleStartExam}
        onDeleteExam={handleDeleteExam}
        onEditExam={handleEditExam}
        isAdmin={!!adminToken}
        onOpenAdmin={() => {
          window.history.pushState({}, '', '/admin');
          setCurrentRoute('/admin');
        }}
      />
    );
  }

  // No customer token and not on admin route - show customer login
  if (recoveryOpen) {
    return <CustomerRecovery onClose={() => setRecoveryOpen(false)} />;
  }

  return <CustomerLogin onLogin={(token) => {
    sessionStorage.setItem('customerToken', token);
    setCustomerToken(token);
  }} openRecovery={() => setRecoveryOpen(true)} />;
};

export default App;