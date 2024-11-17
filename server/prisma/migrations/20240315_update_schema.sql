-- First, create a temporary admin user if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'admin@example.com') THEN
        INSERT INTO "User" (email, password, "createdAt", "updatedAt")
        VALUES ('admin@example.com', 'temporary', NOW(), NOW());
    END IF;
END $$;

-- Get the admin user's ID
WITH admin_user AS (
    SELECT id FROM "User" WHERE email = 'admin@example.com' LIMIT 1
)

-- Step 1: Make userId nullable temporarily in Category table
ALTER TABLE "Category" ADD COLUMN "userId" INTEGER;

-- Step 2: Update existing categories to have the admin userId
UPDATE "Category" 
SET "userId" = (SELECT id FROM "User" WHERE email = 'admin@example.com')
WHERE "userId" IS NULL;

-- Step 3: Make userId non-nullable and add foreign key constraint
ALTER TABLE "Category" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

-- Step 4: Create temporary column for Income frequency
ALTER TABLE "Income" ADD COLUMN "new_frequency" TEXT;

-- Step 5: Copy data to new column with appropriate conversion
UPDATE "Income" SET "new_frequency" = 
    CASE frequency
        WHEN 'WEEKLY' THEN 'WEEKLY'
        WHEN 'BIWEEKLY' THEN 'BIWEEKLY'
        WHEN 'MONTHLY' THEN 'MONTHLY'
        WHEN 'QUARTERLY' THEN 'QUARTERLY'
        WHEN 'ANNUAL' THEN 'ANNUAL'
        ELSE 'MONTHLY' -- Default value
    END;

-- Step 6: Drop old frequency column
ALTER TABLE "Income" DROP COLUMN "frequency";

-- Step 7: Rename new column to frequency
ALTER TABLE "Income" RENAME COLUMN "new_frequency" TO "frequency";

-- Step 8: Make frequency column non-nullable
ALTER TABLE "Income" ALTER COLUMN "frequency" SET NOT NULL; 