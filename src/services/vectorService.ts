export interface VectorInput {
  data: Array<{ embedding: number[] }>;
  query: string;
}

export interface VectorOutput {
  ok: boolean;
  vector: string;
  query: string;
}

export function convertToPostgresVector(input: VectorInput): VectorOutput {
  const embedding = input.data[0].embedding;
  
  // Format embedding as PostgreSQL vector string
  // Round to 6 decimal places to match your example
  const vectorString = '[' + embedding.map(n => n.toFixed(6)).join(',') + ']';
  
  return {
    ok: true,
    vector: vectorString,
    query: input.query
  };
}