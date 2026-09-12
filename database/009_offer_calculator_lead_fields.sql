-- Spec §14 requires the stored lead to carry postcode, city, condition and the source
-- journey. Condition and location previously only reached the pricing engine and were
-- never persisted, and the source was inferred by string-matching the project notes.
alter table offer_calculator_sessions
  add column if not exists condition text,
  add column if not exists postal_code text,
  add column if not exists city text,
  add column if not exists source text;

create index if not exists offer_calculator_sessions_source_idx
  on offer_calculator_sessions(source);
