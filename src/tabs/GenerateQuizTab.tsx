import { useState } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import { generateQuiz } from '../services/api';
import { Quiz } from '../services/supabase';
import { QuizDisplay } from '../components/QuizDisplay';

export function GenerateQuizTab() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const handleGenerateQuiz = async () => {
    if (!url.trim()) {
      setError('Please enter a Wikipedia URL');
      return;
    }

    if (!url.includes('en.wikipedia.org')) {
      setError('Please enter a valid English Wikipedia URL');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await generateQuiz(url);
      setQuiz(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Quiz</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wikipedia Article URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://en.wikipedia.org/wiki/Alan_Turing"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGenerateQuiz}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading && <Loader className="animate-spin" size={20} />}
            {loading ? 'Generating Quiz...' : 'Generate Quiz'}
          </button>
        </div>
      </div>

      {quiz && (
        <div className="animate-in fade-in duration-300">
          <QuizDisplay quiz={quiz} />
        </div>
      )}
    </div>
  );
}
