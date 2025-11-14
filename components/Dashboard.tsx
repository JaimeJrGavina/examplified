import React, { useState } from 'react';
import { Book, Trash2, Edit2 } from 'lucide-react';
import { Exam, Question, QuestionType } from '../types';

interface DashboardProps {
  exams: Exam[];
  onStartExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onOpenAdmin: () => void; // This prop is no longer used by any UI element
  isAdmin?: boolean;
  onEditExam?: (exam: Exam) => void;
}

interface EditModalProps {
  exam: Exam;
  onSave: (exam: Exam) => void;
  onClose: () => void;
}

const EditExamModal: React.FC<EditModalProps> = ({ exam, onSave, onClose }) => {
  const [title, setTitle] = useState(exam.title);
  const [subject, setSubject] = useState(exam.subject);
  const [description, setDescription] = useState(exam.description);
  const [duration, setDuration] = useState(exam.durationMinutes);
  const [questions, setQuestions] = useState<Question[]>(exam.questions || []);

  const updateQuestion = (index: number, field: 'text' | 'modelAnswer', value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

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

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = [...questions];
      newQuestions.splice(index, 1);
      setQuestions(newQuestions);
    }
  };

  const handleSave = async () => {
    const updatedExam: Exam = {
      ...exam,
      title,
      subject,
      description,
      durationMinutes: duration,
      questions
    };

    const token = sessionStorage.getItem('adminToken');
    if (!token) {
      alert('Admin token missing');
      return;
    }

    try {
      const res = await fetch(`/admin/exams/${exam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedExam)
      });

      if (!res.ok) {
        const text = await res.text();
        let errorMsg = text;
        try {
          const data = JSON.parse(text);
          errorMsg = data.error || text;
        } catch (e) { /* ignore */ }
        alert(`Failed to save exam: ${errorMsg}`);
        return;
      }

      alert('Exam updated successfully');
      onSave(updatedExam);
      onClose();
    } catch (err: any) {
      alert(`Error saving exam: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Edit Exam</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 p-2 rounded"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Exam Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Exam Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
              <button
                onClick={addQuestion}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
              >
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-semibold text-gray-600">Question {idx + 1}</span>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(idx)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Question Text
                      </label>
                      <textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter the question or fact pattern..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Model Answer
                      </label>
                      <textarea
                        value={q.modelAnswer || ''}
                        onChange={(e) => updateQuestion(idx, 'modelAnswer', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter the correct answer or model answer..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 border-t pt-6">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ exams, onStartExam, onDeleteExam, isAdmin = false, onEditExam }) => {
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Available Exams</h1>
        {isAdmin && (
          <span className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg">
            Admin Mode
          </span>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Exam List */}
        {exams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 text-white rounded-full p-3 mr-4">
                  <Book className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{exam.title}</h2>
                  <p className="text-sm text-gray-500">{exam.subject}</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{exam.description || 'No description available.'}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-semibold text-gray-500">{exam.durationMinutes} minutes</span>
                <button
                  onClick={() => onStartExam(exam)}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                >
                  Start Exam
                </button>
              </div>

              {/* Admin Controls - Only visible to admins */}
              {isAdmin && (
                <div className="flex gap-2 border-t pt-4">
                  <button
                    onClick={() => setEditingExam(exam)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteExam(exam.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingExam && (
        <EditExamModal
          exam={editingExam}
          onSave={(updatedExam) => {
            if (onEditExam) {
              onEditExam(updatedExam);
            }
            setEditingExam(null);
          }}
          onClose={() => setEditingExam(null)}
        />
      )}
    </div>
  );
};

export default Dashboard;