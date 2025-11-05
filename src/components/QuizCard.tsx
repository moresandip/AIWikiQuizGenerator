import { QuizQuestion } from '../services/supabase';

interface QuizCardProps {
  question: QuizQuestion;
  index: number;
}

export function QuizCard({ question, index }: QuizCardProps) {
  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex-1">
          {index}. {question.question}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ml-4 flex-shrink-0 ${difficultyColors[question.difficulty]}`}>
          {question.difficulty}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {question.options.map((option, i) => (
          <div
            key={i}
            className={`p-3 rounded-md border ${
              option === question.answer
                ? 'bg-green-50 border-green-300'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <span className="font-medium text-gray-700">
              {String.fromCharCode(65 + i)}.
            </span>{' '}
            <span className="text-gray-700">{option}</span>
            {option === question.answer && (
              <span className="ml-2 text-green-600 font-medium">✓ Correct</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">Explanation:</span> {question.explanation}
        </p>
      </div>
    </div>
  );
}
