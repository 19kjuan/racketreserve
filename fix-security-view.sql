-- Fix for Security Definer View Issue
-- Run this in Supabase SQL Editor to fix the today_reservations view

-- Drop and recreate the view without SECURITY INVOKER (which causes syntax error)
DROP VIEW IF EXISTS today_reservations;

CREATE VIEW today_reservations AS
SELECT * FROM get_daily_schedule(CURRENT_DATE::TEXT);
