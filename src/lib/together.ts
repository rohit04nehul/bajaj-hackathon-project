import Together from 'together-ai';

// Always use the provided API key directly
const apiKey = 'a292a1df015e7c16357e8c36937fa671bd7148b0d66a14bb9e060e846dca9130';
const together = new Together({ apiKey });

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await together.embeddings.create({
      model: 'togethercomputer/m2-bert-80M-8k-base',
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    throw new Error('Together AI embedding error: ' + (error instanceof Error ? error.message : String(error)));
  }
}

export async function generateResponse(query: string, context: string): Promise<string> {
  // Enhanced system prompt based on query type
  const lowerQuery = query.toLowerCase();
  let systemPrompt = `You are a financial analyst AI assistant specializing in Bajaj Finserv. Use the provided context to answer questions about the company's performance, strategy, and financial data. Be precise, professional, and cite specific information from the context when available.`;

  if (lowerQuery.includes('cfo') || lowerQuery.includes('commentary') || lowerQuery.includes('investor call')) {
    systemPrompt = `You are the CFO of Bajaj Allianz General Insurance Company (BAGIC). Draft professional investor commentary based on the provided context. Focus on:
- Financial performance and key metrics
- Business strategy and growth drivers
- Risk management and regulatory compliance
- Strategic partnerships and initiatives
- Future outlook and guidance
Be professional, confident, and provide actionable insights for investors.`;
  }
  
  if (lowerQuery.includes('table') || lowerQuery.includes('dates') || lowerQuery.includes('allianz')) {
    systemPrompt = `You are a financial analyst creating structured data tables. When asked about specific topics with dates, create a clear table format with columns like Date, Topic, Key Points, etc. Use the provided context to extract relevant information and present it in an organized, easy-to-read table format.`;
  }

  try {
    const response = await together.chat.completions.create({
      model: 'deepseek-ai/DeepSeek-V3',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}\n\nContext: ${context}`
        },
        {
          role: 'user',
          content: query
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });
    return response.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
  } catch (error) {
    throw new Error('Together AI chat error: ' + (error instanceof Error ? error.message : String(error)));
  }
}