import { Quiz } from '../services/supabase';
import { QuizCard } from './QuizCard';

interface QuizDisplayProps {
  quiz: Quiz;
}

export function QuizDisplay({ quiz }: QuizDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Generated on {new Date(quiz.date_generated).toLocaleDateString()}
        </p>

        {quiz.summary && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
            <p className="text-gray-700 leading-relaxed">{quiz.summary}</p>
          </div>
        )}

        {quiz.key_entities && Object.keys(quiz.key_entities).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {quiz.key_entities.people && quiz.key_entities.people.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">People</h4>
                <ul className="text-sm text-purple-800">
                  {quiz.key_entities.people.map((person, i) => (
                    <li key={i}>• {person}</li>
                  ))}
                </ul>
              </div>
            )}
            {quiz.key_entities.organizations && quiz.key_entities.organizations.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Organizations</h4>
                <ul className="text-sm text-blue-800">
                  {quiz.key_entities.organizations.map((org, i) => (
                    <li key={i}>• {org}</li>
                  ))}
                </ul>
              </div>
            )}
            {quiz.key_entities.locations && quiz.key_entities.locations.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Locations</h4>
                <ul className="text-sm text-green-800">
                  {quiz.key_entities.locations.map((location, i) => (
                    <li key={i}>• {location}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {quiz.sections && quiz.sections.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Article Sections</h3>
            <div className="flex flex-wrap gap-2">
              {quiz.sections.map((section, i) => (
                <span key={i} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                  {section}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Quiz Questions</h3>
        {quiz.quiz_data && quiz.quiz_data.length > 0 ? (
          <div className="space-y-4">
            {quiz.quiz_data.map((question, index) => (
              <QuizCard key={index} question={question} index={index + 1} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No questions available</p>
        )}
      </div>

      {quiz.related_topics && quiz.related_topics.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {quiz.related_topics.map((topic, i) => (
              <a
                key={i}
                href={`https://en.wikipedia.org/wiki/${topic.replace(/\s+/g, '_')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                {topic} →
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
