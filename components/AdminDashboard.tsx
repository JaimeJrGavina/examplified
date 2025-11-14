import React, { useState } from 'react';
import { Plus, Save, Trash2, ArrowLeft, BookOpen, FileText, Layers } from 'lucide-react';
import { Exam, Question, QuestionType } from '../types';

interface AdminDashboardProps {
    onSaveExam: (exam: Exam) => void;
    onBack: () => void;
    onBackToDashboard?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSaveExam, onBack, onBackToDashboard }) => {
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(60);
    const [questions, setQuestions] = useState<Question[]>([
        { id: 'q1', text: '', type: QuestionType.ESSAY, modelAnswer: '' }
    ]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { 
                id: `q${Date.now()}`, 
                text: '', 
                type: QuestionType.ESSAY, 
                modelAnswer: '' 
            }
        ]);
    };

    const addBulkQuestions = (count: number) => {
        const newQuestions = Array(count).fill(null).map((_, i) => ({
            id: `q${Date.now()}_${i}`, 
            text: '', 
            type: QuestionType.ESSAY, 
            modelAnswer: '' 
        }));
        setQuestions(prev => [...prev, ...newQuestions]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length > 1) {
            const newQ = [...questions];
            newQ.splice(index, 1);
            setQuestions(newQ);
        }
    };

    const updateQuestion = (index: number, field: 'text' | 'modelAnswer', value: string) => {
        const newQ = [...questions];
        newQ[index] = { ...newQ[index], [field]: value };
        setQuestions(newQ);
    };

    const [customersList, setCustomersList] = React.useState<Array<any>>([]);
    const [newCustomerEmail, setNewCustomerEmail] = React.useState('');

    const fetchCustomers = async () => {
        const token = sessionStorage.getItem('adminToken');
        if (!token) return;
        try {
            const res = await fetch('/admin/customers', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                const text = await res.text();
                let data = null;
                try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
                setCustomersList(data?.customers || []);
            }
        } catch (e) { /* ignore */ }
    };

    React.useEffect(() => { fetchCustomers(); }, []);

    const handleCreateCustomer = async () => {
        const token = sessionStorage.getItem('adminToken');
        if (!token) { alert('Admin token missing'); return; }
        if (!newCustomerEmail) { alert('Please provide an email'); return; }
        try {
            const res = await fetch('/admin/customers', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ email: newCustomerEmail }) });
            const text = await res.text();
            let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
            if (!res.ok) { alert(data?.error || text || 'Failed to create'); return; }
            setNewCustomerEmail('');
            fetchCustomers();
            alert('Customer created and welcome email queued (outbox).');
        } catch (err: any) { alert(err.message); }
    };

    const handleDeleteCustomer = async (id: string) => {
        if (!confirm('Delete this customer?')) return;
        const token = sessionStorage.getItem('adminToken');
        if (!token) { alert('Admin token missing'); return; }
        try {
            const res = await fetch(`/admin/customers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
            const text = await res.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
            if (!res.ok) { alert(data?.error || text || 'Failed to delete'); return; }
            fetchCustomers();
            alert('Customer deleted');
        } catch (err: any) { alert(err.message); }
    };

    const handleRegenerate = async (id: string) => {
        const token = sessionStorage.getItem('adminToken');
        if (!token) { alert('Admin token missing'); return; }
        try {
            const res = await fetch(`/admin/customers/${id}/regenerate-token`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
            const text = await res.text(); let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
            if (!res.ok) { alert(data?.error || text || 'Failed to regenerate'); return; }
            fetchCustomers();
            alert('Token regenerated and emailed');
        } catch (err: any) { alert(err.message); }
    };

    const handleSave = async () => {
        if (!title || !subject) {
            alert("Please enter a Title and Subject");
            return;
        }

        const token = sessionStorage.getItem('adminToken');
        if (!token) {
            alert("Token not found. Please log in again.");
            return;
        }

        try {
            const res = await fetch('/admin/exams', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    subject,
                    description: description || 'Custom Bar Exam simulation.',
                    durationMinutes: duration,
                    questions: questions,
                }),
            });

            const text = await res.text();
            let data = null;
            try {
                data = text ? JSON.parse(text) : null;
            } catch (e) {
                data = null;
            }

            if (!res.ok) {
                const errMsg = data?.error || text || res.statusText;
                alert(`Failed to save exam: ${errMsg}`);
                return;
            }

            const newExam = data?.exam;
            if (!newExam) {
                alert('Exam saved but server returned no exam data.');
                return;
            }

            // Clear form
            setTitle('');
            setSubject('');
            setDescription('');
            setDuration(60);
            setQuestions([{ id: 'q1', text: '', type: QuestionType.ESSAY, modelAnswer: '' }]);

            alert('Exam saved successfully!');
            onSaveExam(newExam);
        } catch (err: any) {
            alert(`Error saving exam: ${err.message}`);
        }
    };


    return (
        <div className="flex-1 bg-gray-50 flex flex-col min-h-0">
            <nav className="bg-[#2d3e50] h-16 flex items-center justify-between px-8 text-white shadow-md shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-semibold tracking-tight">Instructor Portal (Backend)</span>
                </div>
                <div className="flex items-center gap-3">
                    {onBackToDashboard && (
                        <button 
                            onClick={onBackToDashboard}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            View Exams
                        </button>
                    )}
                    <button 
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-md"
                    >
                        <Save className="w-4 h-4" />
                        Publish Exam
                    </button>
                </div>
            </nav>

            <main className="flex-1 w-full overflow-y-auto custom-scroll p-8 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Exam Configuration
                            </h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Exam Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., 2024 Bar Exam: Civil Law"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Subject Area</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="e.g., Civil Law"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea 
                                    className="w-full bg-white border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-20 resize-none transition-all"
                                    placeholder="Brief instructions for the examinee..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Duration (Minutes)</label>
                                <input 
                                    type="number" 
                                    className="w-32 bg-white border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    value={duration}
                                    onChange={(e) => setDuration(parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Customer management */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                                Customer Access Management
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <input value={newCustomerEmail} onChange={e => setNewCustomerEmail(e.target.value)} placeholder="student.email@example.com" className="col-span-2 border rounded p-3" />
                                <button onClick={handleCreateCustomer} className="bg-green-600 text-white px-4 py-2 rounded">Create Customer</button>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold mb-2">Existing Customers</h3>
                                <div className="space-y-2">
                                    {customersList.map(c => (
                                        <div key={c.id} className="p-3 border rounded flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-medium">{c.email}</div>
                                                <div className="text-xs text-gray-500">Token: <span className="font-mono">{c.token}</span></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleRegenerate(c.id)} className="text-sm px-3 py-1 bg-yellow-100 rounded">Regenerate</button>
                                                <button onClick={() => handleDeleteCustomer(c.id)} className="text-sm px-3 py-1 bg-red-100 rounded">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-800">Questions ({questions.length})</h3>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => addBulkQuestions(5)}
                                    className="text-sm text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1 px-3 py-1.5 rounded hover:bg-blue-50 transition-colors"
                                >
                                    <Layers className="w-4 h-4" />
                                    Add 5 Rows
                                </button>
                                <button 
                                    onClick={addQuestion}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-md flex items-center gap-2 shadow-sm transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Problem
                                </button>
                            </div>
                        </div>

                        {questions.map((q, index) => (
                            <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative group transition-shadow hover:shadow-md">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => removeQuestion(index)}
                                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete Question"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded mb-3">
                                        Problem {index + 1}
                                    </span>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Fact Pattern / Question</label>
                                    <textarea 
                                        className="w-full bg-white border border-gray-300 rounded-md p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none h-32 font-serif text-lg text-gray-800"
                                        placeholder="Enter the detailed fact pattern here..."
                                        value={q.text}
                                        onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                                    />
                                </div>

                                <div className="bg-green-50/50 p-5 rounded-lg border border-green-100">
                                    <label className="block text-sm font-bold text-green-800 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Model Answer (Solutions)
                                    </label>
                                    <p className="text-xs text-green-600 mb-2">This will be shown to the student after they submit the exam.</p>
                                    <textarea 
                                        className="w-full border border-green-200 bg-white rounded-md p-4 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none h-32 font-serif text-gray-700"
                                        placeholder="Enter the correct answer, key points, or rubric here."
                                        value={q.modelAnswer || ''}
                                        onChange={(e) => updateQuestion(index, 'modelAnswer', e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex gap-4">
                            <button 
                                onClick={addQuestion}
                                className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-medium flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Another Problem
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;