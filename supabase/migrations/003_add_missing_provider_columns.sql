-- Add missing columns to providers table
-- This migration adds the 'description' and 'is_active' columns that are expected by the application

ALTER TABLE providers 
ADD COLUMN description TEXT,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update existing providers to be active by default
UPDATE providers SET is_active = true WHERE is_active IS NULL;

-- Add comment to document the changes
COMMENT ON COLUMN providers.description IS 'Optional description of the provider';
COMMENT ON COLUMN providers.is_active IS 'Whether the provider is currently active';