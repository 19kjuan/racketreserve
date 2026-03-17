class TennisReservationSystem {
    constructor() {
        this.data = null;
        this.selectedDate = new Date().toISOString().split('T')[0];
        this.selectedSlot = null;
        this.db = null;
        this.init();
    }

    async init() {
        // Wait for SupabaseDB to be available
        while (typeof SupabaseDB === 'undefined') {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Initialize Supabase database
        this.db = new SupabaseDB();
        
        // Initialize database if needed
        await this.db.initializeDatabase();
        
        // Load initial data
        await this.loadData();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Set default date
        this.setDefaultDate();
        
        // Load schedule
        await this.loadSchedule();
    }

    setupEventListeners() {
        // Date selector for main page
        const dateInput = document.getElementById('selectedDate');
        if (dateInput) {
            dateInput.addEventListener('change', async () => {
                this.selectedDate = dateInput.value;
                await this.loadSchedule();
            });
        }

        // Date selector for admin page
        const adminDateInput = document.getElementById('adminDate');
        if (adminDateInput) {
            adminDateInput.addEventListener('change', async () => {
                this.selectedDate = adminDateInput.value;
            });
        }

        // Booking form
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReservation();
            });
        }
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('selectedDate');
        const adminDateInput = document.getElementById('adminDate');
        
        if (dateInput) dateInput.value = today;
        if (adminDateInput) adminDateInput.value = today;
    }

    async loadData() {
        try {
            const reservations = await this.db.getAllReservations();

            this.data = {
                reservations: reservations || [],
                settings: {
                    morningSlots: ['06', '07', '08'],
                    afternoonSlots: ['17', '18', '19', '20'],
                    morningCourt: 'Cancha 3',
                    afternoonCourt: 'Cancha 6'
                }
            };

        } catch (error) {
            console.error('Error loading data:', error);

            this.data = {
                reservations: [],
                settings: {
                    morningSlots: ['06', '07', '08'],
                    afternoonSlots: ['17', '18', '19', '20'],
                    morningCourt: 'Cancha 3',
                    afternoonCourt: 'Cancha 6'
                }
            };
        }
    }

    async getScheduleForDate(date, forceRefresh = false) {
        try {
            const result = await this.db.getReservationsByDate(date);
            return result;
        } catch (error) {
            console.error('Error getting schedule:', error);
            // Only use fallback if not forcing refresh
            if (!forceRefresh) {
                return this.generateDaySchedule(date);
            } else {
                // If forcing refresh, return empty schedule to show all as available
                return this.generateDaySchedule(date);
            }
        }
    }

    generateDaySchedule(date) {
        const schedule = {};
        
        // Default settings if not available
        const defaultSettings = {
            morningSlots: ['06', '07', '08'],
            afternoonSlots: ['17', '18', '19', '20']
        };
        
        const settings = this.data?.settings || defaultSettings;
        
        // Morning slots (Cancha 3)
        settings.morningSlots.forEach(time => {
            schedule[`morning_${time}`] = {
                time: time,
                court: 'Cancha 3',
                status: 'available',
                customer: null,
                phone: null,
                email: null,
                bookingDate: null
            };
        });
        
        // Afternoon slots (Cancha 6)
        settings.afternoonSlots.forEach(time => {
            schedule[`afternoon_${time}`] = {
                time: time,
                court: 'Cancha 6',
                status: 'available',
                customer: null,
                phone: null,
                email: null,
                bookingDate: null
            };
        });
        
        return schedule;
    }

    async loadSchedule(forceRefresh = false) {
        console.log('🔄 Loading schedule, forceRefresh:', forceRefresh);
        console.log('Current data:', this.data);
        
        const schedule = await this.getScheduleForDate(this.selectedDate, forceRefresh);
        console.log('Schedule received:', schedule);
        
        // Load main page slots
        this.loadMainPageSlots(schedule);
        
        // Load admin page slots if on admin page
        if (window.location.pathname.includes('admin.html')) {
            this.loadAdminPageSlots(schedule);
            this.updateStats(schedule);
            this.loadReservationsList(schedule);
        }
    }

    loadMainPageSlots(schedule) {
        const morningContainer = document.getElementById('morningSlots');
        const afternoonContainer = document.getElementById('afternoonSlots');
        
        if (!morningContainer || !afternoonContainer) return;
        
        morningContainer.innerHTML = '';
        afternoonContainer.innerHTML = '';
        
        // Default settings if not available
        const defaultSettings = {
            morningSlots: ['06', '07', '08'],
            afternoonSlots: ['17', '18', '19', '20']
        };
        
        const settings = this.data?.settings ?? defaultSettings;
        const morningSlots = settings.morningSlots ?? defaultSettings.morningSlots;
        const afternoonSlots = settings.afternoonSlots ?? defaultSettings.afternoonSlots;
        
        // Debug logs
        console.log("settings:", settings);
        console.log("morningSlots:", morningSlots);
        console.log("afternoonSlots:", afternoonSlots);
        
        // Morning slots
        morningSlots.forEach(time => {
            const slotKey = `morning_${time}`;
            const slot = schedule[slotKey];
            if (slot) {
                morningContainer.appendChild(this.createSlotElement(slotKey, slot));
            }
        });
        
        // Afternoon slots
        afternoonSlots.forEach(time => {
            const slotKey = `afternoon_${time}`;
            const slot = schedule[slotKey];
            if (slot) {
                afternoonContainer.appendChild(this.createSlotElement(slotKey, slot));
            }
        });
    }

    loadAdminPageSlots(schedule) {
        const morningContainer = document.getElementById('morningSlotsAdmin');
        const afternoonContainer = document.getElementById('afternoonSlotsAdmin');
        
        if (!morningContainer || !afternoonContainer) return;
        
        morningContainer.innerHTML = '';
        afternoonContainer.innerHTML = '';
        
        // Morning slots
        this.data.settings.morningSlots.forEach(time => {
            const slotKey = `morning_${time}`;
            const slot = schedule[slotKey];
            if (slot) {
                morningContainer.appendChild(this.createAdminSlotElement(slotKey, slot));
            }
        });
        
        // Afternoon slots
        this.data.settings.afternoonSlots.forEach(time => {
            const slotKey = `afternoon_${time}`;
            const slot = schedule[slotKey];
            if (slot) {
                afternoonContainer.appendChild(this.createAdminSlotElement(slotKey, slot));
            }
        });
    }

    createSlotElement(slotKey, slot) {
        const div = document.createElement('div');
        
        if (slot.status === 'booked') {
            div.className = 'slot booked';
            const customerName = slot.customer || 'Reservado';
            div.innerHTML = `
                <div>
                    <div class="slot-time">${slot.time}</div>
                    <div class="slot-court">${slot.court}</div>
                </div>
                <div class="slot-status status-booked">Reservado</div>
                <div class="slot-customer">${customerName}</div>
            `;
            div.onclick = null; // No clickable when booked
        } else {
            div.className = 'slot available';
            div.innerHTML = `
                <div>
                    <div class="slot-time">${slot.time}</div>
                    <div class="slot-court">${slot.court}</div>
                </div>
                <div class="slot-status status-available">Disponible</div>
            `;
            div.onclick = () => this.selectSlot(slotKey, slot);
        }
        
        return div;
    }

    createAdminSlotElement(slotKey, slot) {
        const div = document.createElement('div');
        div.className = `slot ${slot.status}`;
        
        let statusText = '';
        let statusClass = '';
        let actions = '';
        
        switch (slot.status) {
            case 'available':
                statusText = 'Disponible';
                statusClass = 'status-available';
                break;
            case 'booked':
                statusText = 'Reservado';
                statusClass = 'status-booked';
                actions = `
                    <div class="slot-actions">
                        <button class="btn-small btn-cancel" onclick="app.cancelSlot('${slotKey}')">Cancelar</button>
                        <button class="btn-small btn-reset" onclick="app.resetSlot('${slotKey}')">Liberar</button>
                    </div>
                `;
                break;
            case 'cancelled':
                statusText = 'Cancelado';
                statusClass = 'status-cancelled';
                actions = `
                    <div class="slot-actions">
                        <button class="btn-small btn-reset" onclick="app.resetSlot('${slotKey}')">Liberar</button>
                    </div>
                `;
                break;
        }
        
        let customerInfo = '';
        if (slot.customer) {
            customerInfo = `
                <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                    ${slot.customer} - ${slot.phone}
                </div>
            `;
        }
        
        div.innerHTML = `
            <div>
                <div class="slot-time">${slot.time}</div>
                <div class="slot-court">${slot.court}</div>
                ${customerInfo}
            </div>
            <div>
                <div class="slot-status ${statusClass}">${statusText}</div>
                ${actions}
            </div>
        `;
        
        return div;
    }

    selectSlot(slotKey, slot) {
        this.selectedSlot = { key: slotKey, ...slot };
        
        document.getElementById('slotDate').value = this.selectedDate;
        document.getElementById('slotTime').value = slot.time;
        document.getElementById('slotCourt').value = slot.court;
        
        document.getElementById('reservationForm').style.display = 'block';
        document.getElementById('customerName').focus();
        
        // Scroll to form
        document.getElementById('reservationForm').scrollIntoView({ behavior: 'smooth' });
    }

    async submitReservation() {
        if (!this.selectedSlot) {
            this.showNotification('Por favor selecciona un horario', 'error');
            return;
        }
        
        const name = document.getElementById('customerName').value.trim();
        const phone = document.getElementById('customerPhone').value.trim();
        const email = document.getElementById('customerEmail').value.trim();
        
        if (!name || !phone || !email) {
            this.showNotification('Por favor completa todos los campos', 'error');
            return;
        }
        
        // Create reservation object
        const reservation = {
            date: this.selectedDate,
            slot_time: this.selectedSlot.time,
            time_period: this.selectedSlot.key.split('_')[0],
            slot_key: this.selectedSlot.key,
            court: this.selectedSlot.court,
            status: 'booked',
            customer: name,
            phone: phone,
            email: email,
            booking_date: new Date().toISOString()
        };
        
        try {
            // Save to Supabase
            const result = await this.db.createReservation(reservation);
            
            if (result.success) {
                this.showNotification('¡Reserva confirmada exitosamente!', 'success');
                
                // Reset form
                document.getElementById('bookingForm').reset();
                document.getElementById('reservationForm').style.display = 'none';
                this.selectedSlot = null;
                
                // Force immediate data reload from Supabase
                console.log('🔄 Force reloading data from Supabase...');
                await this.loadData();
                
                // Then reload schedule with fresh data
                await this.loadSchedule(true);
                
                console.log('✅ Schedule reloaded with fresh data');
            } else {
                this.showNotification('Error al guardar reserva: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error submitting reservation:', error);
            this.showNotification('Error al procesar la reserva', 'error');
        }
    }

    async cancelSlot(slotKey) {
        try {
            const schedule = await this.getScheduleForDate(this.selectedDate);
            const slot = schedule[slotKey];
            
            if (slot && slot.id) {
                const result = await this.db.updateReservation(slot.id, { status: 'cancelled' });
                
                if (result.success) {
                    this.showNotification('Reserva cancelada', 'info');
                    await this.loadSchedule();
                } else {
                    this.showNotification('Error al cancelar: ' + result.error, 'error');
                }
            }
        } catch (error) {
            console.error('Error canceling slot:', error);
            this.showNotification('Error al cancelar reserva', 'error');
        }
    }

    async resetSlot(slotKey) {
        try {
            const schedule = await this.getScheduleForDate(this.selectedDate);
            const slot = schedule[slotKey];
            
            if (slot && slot.id) {
                const result = await this.db.updateReservation(slot.id, { 
                    status: 'available',
                    customer: null,
                    phone: null,
                    email: null,
                    booking_date: null
                });
                
                if (result.success) {
                    this.showNotification('Horario liberado', 'info');
                    await this.loadSchedule();
                } else {
                    this.showNotification('Error al liberar: ' + result.error, 'error');
                }
            }
        } catch (error) {
            console.error('Error resetting slot:', error);
            this.showNotification('Error al liberar horario', 'error');
        }
    }

    async updateStats(schedule) {
        let total = 0, available = 0, booked = 0, cancelled = 0;
        
        Object.values(schedule).forEach(slot => {
            total++;
            switch (slot.status) {
                case 'available': available++; break;
                case 'booked': booked++; break;
                case 'cancelled': cancelled++; break;
            }
        });
        
        document.getElementById('totalReservations').textContent = total;
        document.getElementById('availableSlots').textContent = available;
        document.getElementById('bookedSlots').textContent = booked;
        document.getElementById('cancelledSlots').textContent = cancelled;
    }

    async loadReservationsList(schedule) {
        const container = document.getElementById('reservationsList');
        if (!container) return;
        
        container.innerHTML = '';
        
        const reservations = Object.entries(schedule)
            .filter(([key, slot]) => slot.status === 'booked')
            .sort(([a], [b]) => a.localeCompare(b));
        
        if (reservations.length === 0) {
            container.innerHTML = '<p>No hay reservas para esta fecha</p>';
            return;
        }
        
        reservations.forEach(([key, slot]) => {
            const div = document.createElement('div');
            div.className = 'reservation-item';
            div.innerHTML = `
                <h4>${slot.time} - ${slot.court}</h4>
                <p><strong>Cliente:</strong> ${slot.customer}</p>
                <p><strong>Teléfono:</strong> ${slot.phone}</p>
                <p><strong>Email:</strong> ${slot.email}</p>
            `;
            container.appendChild(div);
        });
    }

    async resetDailySchedule() {
        if (confirm('¿Estás seguro de que quieres reiniciar todos los horarios del día?')) {
            try {
                const schedule = await this.getScheduleForDate(this.selectedDate);
                
                // Reset all slots to available
                for (const [key, slot] of Object.entries(schedule)) {
                    if (slot.id) {
                        await this.db.updateReservation(slot.id, {
                            status: 'available',
                            customer: null,
                            phone: null,
                            email: null,
                            booking_date: null
                        });
                    }
                }
                
                this.showNotification('Horarios del día reiniciados', 'info');
                await this.loadSchedule();
            } catch (error) {
                console.error('Error resetting schedule:', error);
                this.showNotification('Error al reiniciar horarios', 'error');
            }
        }
    }

    async exportData() {
        try {
            const result = await this.db.getAllReservations();
            const dataStr = JSON.stringify(result, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tennis_reservations_${this.selectedDate}.json`;
            link.click();
            URL.revokeObjectURL(url);
            this.showNotification('Datos exportados exitosamente', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showNotification('Error al exportar datos', 'error');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification') || document.getElementById('adminNotification');
        if (!notification) return;
        
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Auto-reset functionality (runs daily at midnight)
    async checkAndResetDaily() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const lastReset = localStorage.getItem('lastDailyReset');
        
        if (lastReset !== today) {
            // Reset today's schedule to available slots
            try {
                const schedule = await this.getScheduleForDate(today);
                
                for (const [key, slot] of Object.entries(schedule)) {
                    if (slot.id && slot.status !== 'available') {
                        await this.db.updateReservation(slot.id, {
                            status: 'available',
                            customer: null,
                            phone: null,
                            email: null,
                            booking_date: null
                        });
                    }
                }
                
                localStorage.setItem('lastDailyReset', today);
                console.log('Daily schedule reset completed');
            } catch (error) {
                console.error('Error in daily reset:', error);
            }
        }
    }
}

// Global functions for onclick handlers
function cancelReservation() {
    document.getElementById('reservationForm').style.display = 'none';
    app.selectedSlot = null;
}

function loadAdminSchedule() {
    app.loadSchedule();
}

function resetDailySchedule() {
    app.resetDailySchedule();
}

function exportData() {
    app.exportData();
}

// Initialize the app
let app;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth system first
    if (typeof auth !== 'undefined') {
        // Update user info in admin panel
        if (window.location.pathname.includes('admin.html')) {
            const currentUser = auth.getCurrentUser();
            if (currentUser) {
                document.getElementById('userName').textContent = currentUser.name;
                document.getElementById('userEmail').textContent = currentUser.email;
                
                // Generate avatar initials
                const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
                document.getElementById('userAvatar').textContent = initials;
            }
        }
    }
    
    // Initialize tennis reservation system
    app = new TennisReservationSystem();
    app.checkAndResetDaily();
});
