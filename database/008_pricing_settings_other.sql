-- The Quick Quote property step offers an "Other (on request)" option, which has no
-- base price in the original spec list. Seed it as an editable setting rather than
-- hard-coding a fallback in the pricing engine.
insert into pricing_settings (key, value, description, category) values
  ('other_base_price', '3200', 'Base price (CHF) for other / on-request property types', 'property_base')
on conflict (key) do nothing;
