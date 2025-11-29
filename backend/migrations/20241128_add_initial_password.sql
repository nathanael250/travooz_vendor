-- Add initial_password column to tours_businesses for admin review reference
ALTER TABLE tours_businesses
    ADD COLUMN initial_password VARCHAR(255) DEFAULT NULL AFTER currency;

