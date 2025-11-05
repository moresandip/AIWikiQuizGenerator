import { useState, useEffect } from 'react';
import { Loader, AlertCircle, ChevronDown } from 'lucide-react';
import { getQuizzes, getQuiz, type Quiz } from '../services/supabase';
import { Modal } from '../components/Modal';
import { QuizDisplay } from '../components/QuizDisplay';

export function HistoryTab() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (quiz: Quiz) => {
    try {
      const fullQuiz = await getQuiz(quiz.id);
      setSelectedQuiz(fullQuiz);
      setModalOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600 mb-4" size={32} />
        <p className="text-gray-600">Loading quiz history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz History</h2>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {quizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No quizzes generated yet.</p>
            <p className="text-gray-500">Go to the Generate Quiz tab to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Title</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">URL</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{quiz.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={quiz.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate inline-block max-w-xs"
                      >
                        {quiz.url}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(quiz.date_generated).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetails(quiz)}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-sm font-medium transition"
                      >
                        Details
                        <ChevronDown size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedQuiz?.title || 'Quiz Details'}
      >
        {selectedQuiz && <QuizDisplay quiz={selectedQuiz} />}
      </Modal>
    </div>
  );
}
