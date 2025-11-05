import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

interface KeyEntities {
  people: string[];
  organizations: string[];
  locations: string[];
}

interface QuizOutput {
  title: string;
  summary: string;
  sections: string[];
  key_entities: KeyEntities;
  quiz_data: QuizQuestion[];
  related_topics: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    const scraped = await scrapeWikipedia(url);
    if (!scraped || !scraped.content) {
      return new Response(
        JSON.stringify({ error: 'Failed to scrape Wikipedia page. Please verify the URL is correct.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const quizData = await generateQuizWithGemini(scraped.content, scraped.title, geminiKey);

    const { data, error: dbError } = await supabase
      .from('quizzes')
      .insert({
        url,
        title: quizData.title,
        summary: quizData.summary,
        scraped_content: scraped.content,
        quiz_data: quizData.quiz_data,
        key_entities: quizData.key_entities,
        sections: quizData.sections,
        related_topics: quizData.related_topics,
      })
      .select()
      .maybeSingle();

    if (dbError) {
      return new Response(
        JSON.stringify({ error: 'Failed to save quiz' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function scrapeWikipedia(
  url: string
): Promise<{ title: string; content: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    let title = 'Article';
    const titleMatches = [
      html.match(/<h1[^>]*class="firstHeading"[^>]*>([^<]+)<\/h1>/),
      html.match(/<h1[^>]*>\s*<span[^>]*class="mw-page-title-main"[^>]*>([^<]+)<\/span>\s*<\/h1>/),
      html.match(/<title>([^-]+)-[^<]*<\/title>/),
    ];

    for (const match of titleMatches) {
      if (match) {
        title = match[1].trim();
        break;
      }
    }

    let content = '';
    const contentMatches = [
      html.match(/<div[^>]*id="mw-content-text"[^>]*class="mw-body-content"[^>]*>([\s\S]*?)<div[^>]*id="mw-navigation"/),
      html.match(/<div[^>]*id="bodyContent"[^>]*>([\s\S]*?)<div[^>]*id="footer"/),
      html.match(/<main[^>]*id="content"[^>]*>([\s\S]*?)<\/main>/),
      html.match(/<div[^>]*role="main"[^>]*>([\s\S]*?)<\/div>/),
    ];

    for (const match of contentMatches) {
      if (match) {
        content = match[1];
        break;
      }
    }

    if (!content) {
      const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
      if (bodyMatch) {
        content = bodyMatch[1];
      }
    }

    content = content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
      .replace(/<div[^>]*class="[^"]*navbox[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*class="[^"]*mw-editsection[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
      .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, '')
      .replace(/\{\{[^}]*\}\}/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\&nbsp;/g, ' ')
      .replace(/\&amp;/g, '&')
      .replace(/\&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();

    if (content.length < 200) {
      return null;
    }

    const maxLength = 4000;
    if (content.length > maxLength) {
      const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
      let result = '';
      for (const sentence of sentences) {
        if ((result + sentence).length > maxLength) break;
        result += sentence;
      }
      content = result.trim() || content.substring(0, maxLength);
    }

    return { title, content };
  } catch (error) {
    console.error('Scrape error:', error);
    return null;
  }
}

async function generateQuizWithGemini(
  content: string,
  pageTitle: string,
  geminiKey: string
): Promise<QuizOutput> {
  const prompt = `You are an expert quiz generator. Create a quiz from this Wikipedia article.

Article Title: ${pageTitle}

Content:
${content}

Generate EXACTLY this JSON structure (no markdown, no extra text):
{
  "title": "${pageTitle}",
  "summary": "2-3 sentence summary of the article",
  "sections": ["Section 1", "Section 2"],
  "key_entities": {
    "people": ["Name1", "Name2"],
    "organizations": ["Org1", "Org2"],
    "locations": ["Location1", "Location2"]
  },
  "quiz_data": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "difficulty": "easy",
      "explanation": "Explanation text"
    }
  ],
  "related_topics": ["Topic1", "Topic2"]
}

Rules:
- Generate 5-8 questions
- Vary difficulty: some easy, some medium, some hard
- All facts must come from the provided content
- Only respond with valid JSON`;

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': geminiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();

  if (!result.candidates || !result.candidates[0]) {
    throw new Error('No response from Gemini');
  }

  const text = result.candidates[0].content.parts[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Could not parse quiz JSON from AI response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    title: parsed.title || pageTitle,
    summary: parsed.summary || '',
    sections: parsed.sections || [],
    key_entities: parsed.key_entities || { people: [], organizations: [], locations: [] },
    quiz_data: parsed.quiz_data || [],
    related_topics: parsed.related_topics || [],
  };
}
