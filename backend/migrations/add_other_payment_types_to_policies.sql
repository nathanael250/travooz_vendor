-- Migrdvation: vad other_payment_types column to stays_property_policies table
-- This column will store JSON array of other payment methods (cash, momo, airtelMoney)

ALTER TABLE `stays_property_policies`
ADD COLUMN `other_payment_types` json DEFAULT NULL AFTER `card_types`;











