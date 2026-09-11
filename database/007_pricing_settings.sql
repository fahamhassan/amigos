create table if not exists pricing_settings (
  key text primary key,
  value text not null,
  description text,
  category text not null default 'general',
  updated_at timestamptz not null default now()
);

insert into pricing_settings (key, value, description, category) values
  ('2_5_room_apartment_base_price', '2400', 'Base price (CHF) for 2½-room apartment', 'property_base'),
  ('3_5_room_apartment_base_price', '3200', 'Base price (CHF) for 3½-room apartment', 'property_base'),
  ('4_5_room_apartment_base_price', '4100', 'Base price (CHF) for 4½-room apartment', 'property_base'),
  ('5_5_room_apartment_base_price', '5200', 'Base price (CHF) for 5½-room apartment', 'property_base'),
  ('house_base_price', '6500', 'Base price (CHF) for single-family house', 'property_base'),
  ('commercial_base_price', '4800', 'Base price (CHF) for commercial space', 'property_base'),
  ('walls_modifier', '0.70', 'Price multiplier when only walls are selected', 'scope_modifier'),
  ('ceilings_modifier', '0.50', 'Price multiplier when only ceilings are selected', 'scope_modifier'),
  ('walls_and_ceilings_modifier', '1.00', 'Price multiplier for walls and ceilings combined', 'scope_modifier'),
  ('good_condition_modifier', '1.00', 'Price multiplier for surfaces in good condition', 'condition_modifier'),
  ('minor_repairs_modifier', '1.15', 'Price multiplier for minor repairs/patching needed', 'condition_modifier'),
  ('renovation_modifier', '1.35', 'Price multiplier for comprehensive renovation', 'condition_modifier'),
  ('travel_cost_per_km', '2.50', 'Travel cost rate per kilometer (CHF)', 'travel_costs'),
  ('base_travel_flat_fee', '45.00', 'Base travel flat fee (CHF)', 'travel_costs')
on conflict (key) do nothing;
