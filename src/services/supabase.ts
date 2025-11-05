import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Quiz {
  id: string;
  url: string;
  title: string;
  summary: string;
  scraped_content: string;
  quiz_data: QuizQuestion[];
  key_entities: KeyEntities;
  sections: string[];
  related_topics: string[];
  date_generated: string;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export interface KeyEntities {
  people: string[];
  organizations: string[];
  locations: string[];
}

export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('date_generated', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getQuiz(id: string): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Quiz not found');
  return data;
}
