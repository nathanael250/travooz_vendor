-- Cleanup script to remove duplicate schedules
-- This keeps only the most recent schedule for each package and deletes the rest

-- For each package, keep only the schedule with the highest schedule_id (most recent)
-- and delete all others

DELETE s1 FROM tours_package_schedules s1
INNER JOIN tours_package_schedules s2 
WHERE s1.package_id = s2.package_id 
AND s1.schedule_id < s2.schedule_id;

-- Verify cleanup
SELECT package_id, COUNT(*) as schedule_count 
FROM tours_package_schedules 
GROUP BY package_id;

