import { useState } from 'react';
import { BookOpen, History } from 'lucide-react';
import { GenerateQuizTab } from './tabs/GenerateQuizTab';
import { HistoryTab } from './tabs/HistoryTab';

export default function App() {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen size={32} className="text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Wiki Quiz Generator</h1>
          </div>
          <p className="text-gray-600">Generate interactive quizzes from Wikipedia articles using AI</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'generate'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <BookOpen size={20} />
            Generate Quiz
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <History size={20} />
            History
          </button>
        </div>

        {activeTab === 'generate' && <GenerateQuizTab />}
        {activeTab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}
