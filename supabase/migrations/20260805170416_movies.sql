-- Create a table to store documents
create table movies (
  id bigserial primary key,
  content text, -- corresponds to the "text chunk"
  embedding extensions.vector(1536) -- 1536 works for OpenAI embeddings
);