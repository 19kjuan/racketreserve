// Supabase Configuration
const SUPABASE_URL = 'https://smpwhygbfrbcefmqgbky.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtcHdoeWdiZnJiY2VmbXFnYmt5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NjYzNjUsImV4cCI6MjA4OTM0MjM2NX0.jnWhSebpmsqyT4OHQ6O2a2gttQL92w1ZEn-yErOzcCs';

// Use window.mySupabaseClient to avoid conflict with SDK global variable
if (!window.mySupabaseClient) {
    window.mySupabaseClient = null;
}

// Initialize Supabase client
function initializeSupabase() {
    if (window.mySupabaseClient) {
        console.log('✅ Supabase already initialized');
        return true;
    }
    
    try {
        // Check if Supabase SDK is available
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase SDK not loaded');
            return false;
        }
        
        // Create client using correct v2 syntax
        const { createClient } = window.supabase;
        window.mySupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Verification - this is key test
        console.log('🔍 Supabase client verification:');
        console.log('supabase object:', window.mySupabaseClient);
        console.log('typeof supabase:', typeof window.mySupabaseClient);
        console.log('has from method:', typeof window.mySupabaseClient.from);
        console.log('has auth method:', typeof window.mySupabaseClient.auth);
        console.log('has rpc method:', typeof window.mySupabaseClient.rpc);
        
        // Test client
        if (typeof window.mySupabaseClient.from !== 'function') {
            console.error('❌ CRITICAL: supabase.from is NOT a function!');
            console.error('❌ Client creation failed - using wrong syntax');
            return false;
        }
        
        console.log('✅ Supabase client created successfully with all methods');
        return true;
        
    } catch (error) {
        console.error('❌ Error creating Supabase client:', error);
        return false;
    }
}

// Supabase Database Manager
class SupabaseDB {
    constructor() {
        this.isSupabaseAvailable = initializeSupabase();
        this.tableName = 'tennis_reservations';
    }

    async initializeDatabase() {
        if (!this.isSupabaseAvailable) {
            return { success: false, error: 'Supabase not available' };
        }

        try {
            // Table should already exist from SQL setup
            console.log('Database table should already exist from SQL setup');
            return { success: true, data: null };
        } catch (error) {
            console.error('Database initialization error:', error);
            return { success: false, error };
        }
    }

    async getAllReservations() {
        console.log('🔍 getAllReservations - Debug:');
        console.log('this.isSupabaseAvailable:', this.isSupabaseAvailable);
        console.log('window.mySupabaseClient exists:', !!window.mySupabaseClient);
        console.log('window.mySupabaseClient type:', typeof window.mySupabaseClient);
        console.log('window.mySupabaseClient.from type:', typeof window.mySupabaseClient?.from);
        
        if (!this.isSupabaseAvailable || !window.mySupabaseClient) {
            console.log('Using localStorage fallback for getAllReservations');
            return this.getFromLocalStorage();
        }

        try {
            console.log('Fetching from Supabase...');
            const client = window.mySupabaseClient;
            console.log('Client being used:', client);
            console.log('Client.from type:', typeof client.from);
            
            const { data, error } = await client
                .from(this.tableName)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            console.log('Supabase data received:', data);
            return this.formatData(data);
        } catch (error) {
            console.error('Error fetching reservations:', error);
            return this.getFromLocalStorage();
        }
    }

    async getReservationsByDate(date) {
        if (!this.isSupabaseAvailable || !window.mySupabaseClient) {
            console.log('Using localStorage fallback for getReservationsByDate');
            return this.getFromLocalStorage(date);
        }

        try {
            console.log('Fetching from Supabase for date:', date);
            const { data, error } = await window.mySupabaseClient
                .from(this.tableName)
                .select('*')
                .eq('date', date)
                .order('slot_time', { ascending: true });

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            console.log('Supabase data for date received:', data);
            return this.formatDataForDate(data, date);
        } catch (error) {
            console.error('Error fetching reservations by date:', error);
            return this.getFromLocalStorage(date);
        }
    }

    async createReservation(reservation) {
        if (!this.isSupabaseAvailable) {
            return this.saveToLocalStorage(reservation);
        }

        try {
            const reservationWithTimestamp = {
                ...reservation,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await window.mySupabaseClient
                .from(this.tableName)
                .insert([reservationWithTimestamp])
                .select()
                .single();

            if (error) throw error;
            
            // Also save to localStorage as backup
            this.saveToLocalStorage(reservation);
            
            return { success: true, data };
        } catch (error) {
            console.error('Error creating reservation:', error);
            return { success: false, error: error.message };
        }
    }

    async updateReservation(id, updates) {
        if (!this.isSupabaseAvailable) {
            return this.updateInLocalStorage(id, updates);
        }

        try {
            const { data, error } = await window.mySupabaseClient
                .from(this.tableName)
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Error updating reservation:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteReservation(id) {
        if (!this.isSupabaseAvailable) {
            return this.deleteFromLocalStorage(id);
        }

        try {
            const { error } = await window.mySupabaseClient
                .from(this.tableName)
                .delete()
                .eq('id', id);

            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting reservation:', error);
            return { success: false, error: error.message };
        }
    }

    // Fallback localStorage methods
    getFromLocalStorage(date = null) {
        const stored = localStorage.getItem('tennisReservations');
        if (!stored) return { reservations: {}, settings: {} };
        
        const data = JSON.parse(stored);
        
        if (date) {
            return this.formatDataForDate(data.reservations || {}, date);
        }
        
        return this.formatData(data.reservations || {});
    }

    saveToLocalStorage(reservation) {
        const current = this.getFromLocalStorage();
        
        if (!current.reservations[reservation.date]) {
            current.reservations[reservation.date] = {};
        }
        
        current.reservations[reservation.date][reservation.slotKey] = reservation;
        
        localStorage.setItem('tennisReservations', JSON.stringify(current));
        return { success: true, data: reservation };
    }

    updateInLocalStorage(id, updates) {
        // Implementation for localStorage update
        return { success: true };
    }

    deleteFromLocalStorage(id) {
        // Implementation for localStorage delete
        return { success: true };
    }

    formatData(data) {
        const formatted = { reservations: {}, settings: {} };
        
        data.forEach(reservation => {
            if (!formatted.reservations[reservation.date]) {
                formatted.reservations[reservation.date] = {};
            }
            formatted.reservations[reservation.date][reservation.slot_key] = {
                time: reservation.time,
                court: reservation.court,
                status: reservation.status,
                customer: reservation.customer,
                phone: reservation.phone,
                email: reservation.email,
                bookingDate: reservation.booking_date,
                id: reservation.id
            };
        });
        
        return formatted;
    }

    formatDataForDate(data, date) {
        const daySchedule = {};
        
        // Default empty schedule
        const defaultSchedule = {
            morning_06: { time: '06:00', court: 'Cancha 3', status: 'available', customer: null, phone: null, email: null, bookingDate: null },
            morning_07: { time: '07:00', court: 'Cancha 3', status: 'available', customer: null, phone: null, email: null, bookingDate: null },
            morning_08: { time: '08:00', court: 'Cancha 3', status: 'available', customer: null, phone: null, email: null, bookingDate: null },
            afternoon_17: { time: '17:00', court: 'Cancha 6', status: 'available', customer: null, phone: null, email: null, bookingDate: null },
            afternoon_18: { time: '18:00', court: 'Cancha 6', status: 'available', customer: null, phone: null, email: null, bookingDate: null },
            afternoon_19: { time: '19:00', court: 'Cancha 6', status: 'available', customer: null, phone: null, email: null, bookingDate: null },
            afternoon_20: { time: '20:00', court: 'Cancha 6', status: 'available', customer: null, phone: null, email: null, bookingDate: null }
        };
        
        // Override with actual reservations
        data.forEach(reservation => {
            const slotKey = `${reservation.period}_${reservation.time.replace(':', '')}`;
            if (defaultSchedule[slotKey]) {
                defaultSchedule[slotKey] = {
                    ...defaultSchedule[slotKey],
                    status: reservation.status,
                    customer: reservation.customer,
                    phone: reservation.phone,
                    email: reservation.email,
                    bookingDate: reservation.booking_date,
                    id: reservation.id
                };
            }
        });
        
        return defaultSchedule;
    }
}

// Make SupabaseDB available globally
window.SupabaseDB = SupabaseDB;
window.supabaseClient = () => supabase;
