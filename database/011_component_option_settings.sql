-- Component-specific option multipliers (spec §4 doors, §6 railings). Editable in the
-- admin backend like every other pricing variable.
insert into pricing_settings (key, value, description, category) values
  ('door_type_standard_multiplier', '1', 'Door type: standard', 'component_options'),
  ('door_type_double_multiplier', '1.6', 'Door type: double', 'component_options'),
  ('door_type_entrance_multiplier', '1.4', 'Door type: entrance', 'component_options'),
  ('door_type_other_multiplier', '1.1', 'Door type: other', 'component_options'),
  ('door_material_wood_multiplier', '1', 'Door material: wood', 'component_options'),
  ('door_material_metal_multiplier', '1.15', 'Door material: metal', 'component_options'),
  ('door_material_unsure_multiplier', '1.05', 'Door material: not sure', 'component_options'),
  ('door_sides_one_side_multiplier', '0.6', 'Door painting: one side', 'component_options'),
  ('door_sides_both_sides_multiplier', '1', 'Door painting: both sides', 'component_options'),
  ('door_frame_multiplier', '1.2', 'Surcharge when the door frame is included', 'component_options'),
  ('door_condition_good_multiplier', '1', 'Door condition: good', 'component_options'),
  ('door_condition_minor_multiplier', '1.15', 'Door condition: minor preparation', 'component_options'),
  ('door_condition_renovation_multiplier', '1.35', 'Door condition: renovation required', 'component_options'),
  ('railing_type_balcony_multiplier', '1', 'Railing type: balcony', 'component_options'),
  ('railing_type_stair_multiplier', '1.1', 'Railing type: stair', 'component_options'),
  ('railing_material_metal_multiplier', '1', 'Railing material: metal', 'component_options'),
  ('railing_material_wood_multiplier', '0.95', 'Railing material: wood', 'component_options'),
  ('railing_condition_good_multiplier', '1', 'Railing condition: good', 'component_options'),
  ('railing_condition_minor_multiplier', '1.15', 'Railing condition: minor preparation', 'component_options'),
  ('railing_condition_renovation_multiplier', '1.35', 'Railing condition: renovation required', 'component_options'),
  ('service_factor_railing_cleaning', '0.3', 'Service weighting: clean railings', 'component_options'),
  ('service_factor_railing_sanding', '0.45', 'Service weighting: sand railings', 'component_options'),
  ('service_factor_railing_priming', '0.38', 'Service weighting: prime railings', 'component_options')
on conflict (key) do nothing;
