-- Migration: add tour_type_ids and tour_type_names arrays to tours_businesses
-- Run this after deploying the multi-tour-type feature to keep schema aligned

ALTER TABLE tours_businesses
    ADD COLUMN tour_type_ids JSON DEFAULT NULL AFTER tour_type_name,
    ADD COLUMN tour_type_names JSON DEFAULT NULL AFTER tour_type_ids;

