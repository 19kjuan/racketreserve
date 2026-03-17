-- Supabase SQL Setup for Tennis Reservation System
-- Run this in Supabase SQL Editor

-- Create tennis_reservations table
CREATE TABLE IF NOT EXISTS tennis_reservations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    time_period TEXT NOT NULL, -- 'morning' or 'afternoon'
    slot_key TEXT NOT NULL, -- e.g., 'morning_06', 'afternoon_17'
    court TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available', -- 'available', 'booked', 'cancelled'
    customer TEXT,
    phone TEXT,
    email TEXT,
    booking_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tennis_reservations_date ON tennis_reservations(date);
CREATE INDEX IF NOT EXISTS idx_tennis_reservations_status ON tennis_reservations(status);
CREATE INDEX IF NOT EXISTS idx_tennis_reservations_slot_key ON tennis_reservations(slot_key);

-- Create a function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_tennis_reservations_updated_at
    BEFORE UPDATE ON tennis_reservations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE tennis_reservations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (you can modify this for more security)
CREATE POLICY "Public access to tennis_reservations" ON tennis_reservations
    FOR ALL USING (true)
    WITH CHECK (true);

-- Create a function to get daily schedule
CREATE OR REPLACE FUNCTION get_daily_schedule(input_date TEXT)
RETURNS TABLE (
    id UUID,
    slot_time TEXT,
    time_period TEXT,
    slot_key TEXT,
    court TEXT,
    status TEXT,
    customer TEXT,
    phone TEXT,
    email TEXT,
    booking_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tr.id,
        tr.slot_time,
        tr.time_period,
        tr.slot_key,
        tr.court,
        tr.status,
        tr.customer,
        tr.phone,
        tr.email,
        tr.booking_date
    FROM tennis_reservations tr
    WHERE tr.date = input_date
    ORDER BY tr.slot_time;
END;
$$ LANGUAGE plpgsql;

-- Create a view for today's reservations
CREATE OR REPLACE VIEW today_reservations AS
SELECT * FROM get_daily_schedule(CURRENT_DATE::TEXT);

-- Create a function to get statistics
CREATE OR REPLACE FUNCTION get_reservation_stats(input_date TEXT DEFAULT NULL)
RETURNS TABLE (
    total_reservations BIGINT,
    available_slots BIGINT,
    booked_slots BIGINT,
    cancelled_slots BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_reservations,
        COUNT(*) FILTER (WHERE status = 'available') as available_slots,
        COUNT(*) FILTER (WHERE status = 'booked') as booked_slots,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_slots
    FROM tennis_reservations 
    WHERE input_date IS NULL OR date = input_date;
END;
$$ LANGUAGE plpgsql;
