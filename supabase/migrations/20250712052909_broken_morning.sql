/*
  # Create vector search function for transcript chunks

  1. New Functions
    - `match_transcript_chunks` - Performs similarity search using cosine distance
      - Takes query embedding, similarity threshold, and match count
      - Returns matching chunks with similarity scores
      - Uses pgvector's cosine distance operator

  2. Security
    - Function is accessible to authenticated and anonymous users
    - Inherits RLS policies from transcript_chunks table
*/

-- Create the vector similarity search function
CREATE OR REPLACE FUNCTION match_transcript_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  quarter text,
  source_file text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    transcript_chunks.id,
    transcript_chunks.content,
    transcript_chunks.quarter,
    transcript_chunks.source_file,
    1 - (transcript_chunks.embedding <=> query_embedding) AS similarity
  FROM transcript_chunks
  WHERE 1 - (transcript_chunks.embedding <=> query_embedding) > match_threshold
  ORDER BY transcript_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;