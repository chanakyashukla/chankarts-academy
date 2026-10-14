/* ============================================
   ChankArts Music Academy - Admin Dashboard
   ============================================ */

const Admin = (function() {
    'use strict';

    const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000'
        : '') + '/api/v1/admin';
    let currentSection = 'dashboard';
    let sidebarOpen = false;

    // ========================================
    // SVG Icon System (lightweight, stroke-based)
    // ========================================
    const SVG_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true"';

    const ICONS = {
        dashboard: `<svg ${SVG_ATTRS}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>`,
        registrations: `<svg ${SVG_ATTRS}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>`,
        students: `<svg ${SVG_ATTRS}><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/><circle cx="19" cy="6" r="1.5"/><path d="M19 7.5V11"/></svg>`,
        enrollments: `<svg ${SVG_ATTRS}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
        instructors: `<svg ${SVG_ATTRS}><circle cx="12" cy="7" r="3"/><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.5 21 6l-5 2.5"/></svg>`,
        classes: `<svg ${SVG_ATTRS}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>`,
        fees: `<svg ${SVG_ATTRS}><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>`,
        attendance: `<svg ${SVG_ATTRS}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12.5l2.5 2.5L16 9.5"/></svg>`,
        progress: `<svg ${SVG_ATTRS}><path d="M3 17l6-6 4 4 7-7"/><path d="M14 8h6v6"/></svg>`,
        exams: `<svg ${SVG_ATTRS}><circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5L17 21l-1.5-7.5"/></svg>`,
        assignments: `<svg ${SVG_ATTRS}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/></svg>`,
        resources: `<svg ${SVG_ATTRS}><path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
        reports: `<svg ${SVG_ATTRS}><path d="M3 21h18"/><rect x="5" y="11" width="3.5" height="7" rx="0.8"/><rect x="10.25" y="7" width="3.5" height="11" rx="0.8"/><rect x="15.5" y="13" width="3.5" height="5" rx="0.8"/></svg>`,
        settings: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h0a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h0a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v0a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>`,
        // Stat / status icons
        pending: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
        approved: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>`,
        rejected: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="8.5"/><path d="M9.5 9.5l5 5M14.5 9.5l-5 5"/></svg>`,
        info: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/></svg>`,
        mail: `<svg ${SVG_ATTRS}><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>`,
        clock: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>`,
        wallet: `<svg ${SVG_ATTRS}><path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2"/><rect x="3" y="7" width="18" height="12" rx="2"/><circle cx="16" cy="13" r="1.2"/></svg>`,
        users: `<svg ${SVG_ATTRS}><circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 15.5A4.5 4.5 0 0 1 21 19"/></svg>`,
        book: `<svg ${SVG_ATTRS}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
        // Empty states
        inbox: `<svg ${SVG_ATTRS}><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.5 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.5A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.5z"/></svg>`,
        warn: `<svg ${SVG_ATTRS}><path d="M12 3.5 22 20H2z"/><path d="M12 10v4"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>`,
        search: `<svg ${SVG_ATTRS}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
        plus: `<svg ${SVG_ATTRS}><path d="M12 5v14M5 12h14"/></svg>`,
        menu: `<svg ${SVG_ATTRS}><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
    };

    function icon(name) {
        return ICONS[name] || ICONS.inbox;
    }

    // ========================================
    // Registration State
    // ========================================
    let regState = {
        requests: [],
        filtered: [],
        loading: false,
        error: null,
        search: '',
        statusFilter: 'all',
        programmeFilter: 'all',
        currentView: 'list', // 'list' | 'detail'
        selectedRequest: null,
        detailLoading: false,
        detailError: null,
        actionLoading: false,
    };

    // ========================================
    // API Helper
    // ========================================
    async function apiCall(endpoint, options = {}) {
        const token = localStorage.getItem('academy_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                localStorage.removeItem('academy_token');
                localStorage.removeItem('academy_user');
                window.location.href = '/academy/login';
                return null;
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || 'Request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // General API helper for non-/admin paths (e.g. /learning, /sessions)
    async function apiV1Call(path, options = {}) {
        const base = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:8000'
            : '') + '/api/v1';
        const token = localStorage.getItem('academy_token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers,
        };

        try {
            const response = await fetch(`${base}${path}`, { ...options, headers });
            if (response.status === 401) {
                localStorage.removeItem('academy_token');
                localStorage.removeItem('academy_user');
                window.location.href = '/academy/login';
                return null;
            }
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.detail || 'Request failed');
            }
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ========================================
    // Navigation
    // ========================================
    const NAV_ITEMS = [
        { section: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { section: 'registrations', label: 'Registration Requests', icon: 'registrations', badge: 'pending' },
        { section: 'students', label: 'Students', icon: 'students' },
        { section: 'enrollments', label: 'Enrollments', icon: 'enrollments' },
        { divider: true },
        { section: 'instructors', label: 'Instructors', icon: 'instructors' },
        { section: 'classes', label: 'Classes / Schedules', icon: 'classes' },
        { section: 'fees', label: 'Fees & Payments', icon: 'fees' },
        { section: 'attendance', label: 'Attendance', icon: 'attendance' },
        { section: 'progress', label: 'Progress', icon: 'progress' },
        { divider: true },
        { section: 'exams', label: 'Exams / Certifications', icon: 'exams' },
        { section: 'assignments', label: 'Assignments / Quizzes', icon: 'assignments' },
        { section: 'resources', label: 'Resources', icon: 'resources' },
        { section: 'reports', label: 'Reports', icon: 'reports' },
        { divider: true },
        { section: 'settings', label: 'Settings', icon: 'settings' },
    ];

    function renderSidebar() {
        return `
            <aside class="admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}" id="adminSidebar">
                <div class="admin-sidebar__section">
                    <div class="admin-sidebar__label">Main</div>
                    ${NAV_ITEMS.slice(0, 4).map(item => {
                        if (item.divider) return '';
                        return `
                            <a href="#" class="admin-sidebar__link ${currentSection === item.section ? 'admin-sidebar__link--active' : ''}" 
                               data-section="${item.section}">
                                <span class="admin-sidebar__icon">${icon(item.icon)}</span>
                                <span>${item.label}</span>
                                ${item.badge ? `<span class="admin-sidebar__badge" id="pendingBadge">-</span>` : ''}
                            </a>
                        `;
                    }).join('')}
                </div>
                <div class="admin-sidebar__section">
                    <div class="admin-sidebar__label">Management</div>
                    ${NAV_ITEMS.slice(4, 9).map(item => {
                        if (item.divider) return '';
                        return `
                            <a href="#" class="admin-sidebar__link ${currentSection === item.section ? 'admin-sidebar__link--active' : ''}" 
                               data-section="${item.section}">
                                <span class="admin-sidebar__icon">${icon(item.icon)}</span>
                                <span>${item.label}</span>
                            </a>
                        `;
                    }).join('')}
                </div>
                <div class="admin-sidebar__section">
                    <div class="admin-sidebar__label">Academic</div>
                    ${NAV_ITEMS.slice(9, 14).map(item => {
                        if (item.divider) return '';
                        return `
                            <a href="#" class="admin-sidebar__link ${currentSection === item.section ? 'admin-sidebar__link--active' : ''}" 
                               data-section="${item.section}">
                                <span class="admin-sidebar__icon">${icon(item.icon)}</span>
                                <span>${item.label}</span>
                            </a>
                        `;
                    }).join('')}
                </div>
                <div class="admin-sidebar__section">
                    <div class="admin-sidebar__label">System</div>
                    ${NAV_ITEMS.slice(14).map(item => {
                        if (item.divider) return '';
                        return `
                            <a href="#" class="admin-sidebar__link ${currentSection === item.section ? 'admin-sidebar__link--active' : ''}" 
                               data-section="${item.section}">
                                <span class="admin-sidebar__icon">${icon(item.icon)}</span>
                                <span>${item.label}</span>
                            </a>
                        `;
                    }).join('')}
                </div>
            </aside>
        `;
    }

    function bindSidebarEvents() {
        document.querySelectorAll('.admin-sidebar__link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                navigateTo(section);
            });
        });

        const toggle = document.getElementById('adminSidebarToggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                sidebarOpen = !sidebarOpen;
                document.getElementById('adminSidebar').classList.toggle('admin-sidebar--open', sidebarOpen);
            });
        }
    }

    function navigateTo(section) {
        closeModalDirect();
        currentSection = section;
        if (section === 'registrations') {
            regState.currentView = 'list';
            regState.selectedRequest = null;
        }
        render();
    }

    // ========================================
    // Dashboard
    // ========================================
    async function renderDashboard() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading dashboard...</div>';

        try {
            const stats = await apiCall('/dashboard/stats');
            
            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Dashboard</h1>
                        <p class="admin-header__subtitle">Welcome back, Admin</p>
                    </div>
                </div>

                <div class="admin-stats">
                    <div class="admin-stat admin-stat--accent">
                        <div class="admin-stat__icon"> ${icon("students")}</div>
                        <div class="admin-stat__value">${stats.total_students}</div>
                        <div class="admin-stat__label">Total Students</div>
                    </div>
                    <div class="admin-stat admin-stat--warning">
                        <div class="admin-stat__icon"> ${icon("registrations")}</div>
                        <div class="admin-stat__value">${stats.pending_registrations}</div>
                        <div class="admin-stat__label">Pending Registrations</div>
                    </div>
                    <div class="admin-stat admin-stat--success">
                        <div class="admin-stat__icon"> ${icon("enrollments")}</div>
                        <div class="admin-stat__value">${stats.active_enrollments}</div>
                        <div class="admin-stat__label">Active Enrollments</div>
                    </div>
                    <div class="admin-stat">
                        <div class="admin-stat__icon"> ${icon("fees")}</div>
                        <div class="admin-stat__value">${stats.pending_fee_records}</div>
                        <div class="admin-stat__label">Pending Fees</div>
                    </div>
                </div>

                <div class="admin-card">
                    <div class="admin-card__header">
                        <h3 class="admin-card__title">Recent Registrations</h3>
                        <a href="#" class="btn btn--secondary" data-section="registrations">View All</a>
                    </div>
                    <div class="admin-card__body" style="padding: 0;">
                        ${stats.recent_registrations.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Request ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${stats.recent_registrations.map(r => `
                                        <tr>
                                            <td><strong>${r.request_id}</strong></td>
                                            <td>${r.full_name}</td>
                                            <td>${r.email}</td>
                                            <td><span class="badge badge--${getStatusBadgeClass(r.status)}">${formatStatus(r.status)}</span></td>
                                            <td>${formatDate(r.submitted_at)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("registrations")}</div>
                                <div class="admin-empty__title">No registrations yet</div>
                                <div class="admin-empty__text">Registration requests will appear here</div>
                            </div>
                        `}
                    </div>
                </div>
            `;

            container.querySelector('[data-section="registrations"]')?.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('registrations');
            });

            const badge = document.getElementById('pendingBadge');
            if (badge) badge.textContent = stats.pending_registrations;

        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load dashboard</div>
                    <div class="admin-empty__text">Please check your connection and try again</div>
                </div>
            `;
        }
    }

    // ========================================
    // Registration Requests - List
    // ========================================
    async function loadRegistrations() {
        regState.loading = true;
        regState.error = null;
        renderRegistrationsList();

        try {
            const requests = await apiCall('/registration-requests');
            regState.requests = requests || [];
            applyRegFilters();
        } catch (error) {
            regState.error = error.message;
            regState.requests = [];
            regState.filtered = [];
        } finally {
            regState.loading = false;
            renderRegistrationsList();
        }
    }

    function applyRegFilters() {
        let filtered = [...regState.requests];

        // Status filter
        if (regState.statusFilter !== 'all') {
            filtered = filtered.filter(r => r.status === regState.statusFilter);
        }

        // Programme filter
        if (regState.programmeFilter !== 'all') {
            filtered = filtered.filter(r =>
                (r.selected_programmes || []).some(p => p.id === regState.programmeFilter)
            );
        }

        // Search filter
        if (regState.search.trim()) {
            const q = regState.search.toLowerCase();
            filtered = filtered.filter(r =>
                r.full_name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.request_id.toLowerCase().includes(q)
            );
        }

        regState.filtered = filtered;
    }

    function getUniqueProgrammes() {
        const map = new Map();
        regState.requests.forEach(r => {
            (r.selected_programmes || []).forEach(p => {
                if (!map.has(p.id)) map.set(p.id, p.name);
            });
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }

    function getStatusCounts() {
        const counts = {
            pending_email_verification: 0,
            email_verified: 0,
            pending_review: 0,
            needs_information: 0,
            approved: 0,
            rejected: 0,
        };
        regState.requests.forEach(r => {
            if (counts.hasOwnProperty(r.status)) counts[r.status]++;
        });
        return counts;
    }

    function renderRegistrationsList() {
        const container = document.getElementById('adminContent');
        const counts = getStatusCounts();
        const programmes = getUniqueProgrammes();

        if (regState.loading) {
            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Registration Requests</h1>
                        <p class="admin-header__subtitle">Review and manage new ChankArts Music Academy applications.</p>
                    </div>
                </div>
                <div class="admin-loading"><div class="admin-loading__spinner"></div>Loading registration requests...</div>
            `;
            return;
        }

        if (regState.error) {
            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Registration Requests</h1>
                        <p class="admin-header__subtitle">Review and manage new ChankArts Music Academy applications.</p>
                    </div>
                </div>
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load registration requests</div>
                    <div class="admin-empty__text">${escapeHtml(regState.error)}</div>
                    <button class="btn btn--primary" onclick="Admin.loadRegistrations()" style="margin-top: 16px;">Try Again</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="admin-header">
                <div>
                    <h1 class="admin-header__title">Registration Requests</h1>
                    <p class="admin-header__subtitle">Review and manage new ChankArts Music Academy applications.</p>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="admin-stats">
                <div class="admin-stat admin-stat--warning" onclick="Admin.filterByStatus('pending_review')" style="cursor:pointer;">
                    <div class="admin-stat__icon"> ${icon("pending")}</div>
                    <div class="admin-stat__value">${counts.pending_review}</div>
                    <div class="admin-stat__label">Pending Review</div>
                </div>
                <div class="admin-stat admin-stat--accent" onclick="Admin.filterByStatus('email_verified')" style="cursor:pointer;">
                    <div class="admin-stat__icon"> ${icon("mail")}</div>
                    <div class="admin-stat__value">${counts.email_verified}</div>
                    <div class="admin-stat__label">Email Verified</div>
                </div>
                <div class="admin-stat" onclick="Admin.filterByStatus('needs_information')" style="cursor:pointer;">
                    <div class="admin-stat__icon"> ${icon("info")}</div>
                    <div class="admin-stat__value">${counts.needs_information}</div>
                    <div class="admin-stat__label">Needs Information</div>
                </div>
                <div class="admin-stat admin-stat--success" onclick="Admin.filterByStatus('approved')" style="cursor:pointer;">
                    <div class="admin-stat__icon"> ${icon("attendance")}</div>
                    <div class="admin-stat__value">${counts.approved}</div>
                    <div class="admin-stat__label">Approved</div>
                </div>
                <div class="admin-stat" style="border-color: rgba(248,113,113,0.2);" onclick="Admin.filterByStatus('rejected')" style="cursor:pointer;">
                    <div class="admin-stat__icon"> ${icon("rejected")}</div>
                    <div class="admin-stat__value" style="color: var(--color-error);">${counts.rejected}</div>
                    <div class="admin-stat__label">Rejected</div>
                </div>
            </div>

            <!-- Filters -->
            <div class="admin-card" style="margin-bottom: var(--space-xl);">
                <div class="admin-card__body" style="padding: var(--space-lg) var(--space-xl);">
                    <div class="reg-filters">
                        <div class="reg-filters__search">
                            <input type="text" class="auth__input" id="regSearch" placeholder="Search by name, email or request ID" value="${escapeHtml(regState.search)}">
                        </div>
                        <div class="reg-filters__selects">
                            <select class="auth__input auth__select" id="regStatusFilter">
                                <option value="all" ${regState.statusFilter === 'all' ? 'selected' : ''}>All Statuses</option>
                                <option value="pending_email_verification" ${regState.statusFilter === 'pending_email_verification' ? 'selected' : ''}>Pending Email Verification</option>
                                <option value="email_verified" ${regState.statusFilter === 'email_verified' ? 'selected' : ''}>Email Verified</option>
                                <option value="pending_review" ${regState.statusFilter === 'pending_review' ? 'selected' : ''}>Pending Approval</option>
                                <option value="needs_information" ${regState.statusFilter === 'needs_information' ? 'selected' : ''}>Needs Information</option>
                                <option value="approved" ${regState.statusFilter === 'approved' ? 'selected' : ''}>Approved</option>
                                <option value="rejected" ${regState.statusFilter === 'rejected' ? 'selected' : ''}>Rejected</option>
                            </select>
                            <select class="auth__input auth__select" id="regProgrammeFilter">
                                <option value="all">All Programmes</option>
                                ${programmes.map(p => `
                                    <option value="${p.id}" ${regState.programmeFilter === p.id ? 'selected' : ''}>${p.name}</option>
                                `).join('')}
                            </select>
                            ${(regState.search || regState.statusFilter !== 'all' || regState.programmeFilter !== 'all') ? `
                                <button class="btn btn--secondary" onclick="Admin.clearRegFilters()">Clear Filters</button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Results -->
            <div class="admin-card">
                <div class="admin-card__header">
                    <h3 class="admin-card__title">${regState.filtered.length} Request${regState.filtered.length !== 1 ? 's' : ''}</h3>
                </div>
                <div class="admin-card__body" style="padding: 0;">
                    ${regState.filtered.length > 0 ? `
                        <!-- Desktop Table -->
                        <div class="reg-table-desktop">
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Request ID</th>
                                        <th>Student</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Programmes</th>
                                        <th>Submitted</th>
                                        <th>Review Deadline</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${regState.filtered.map(r => renderRegRow(r)).join('')}
                                </tbody>
                            </table>
                        </div>
                        <!-- Mobile Cards -->
                        <div class="reg-table-mobile">
                            ${regState.filtered.map(r => renderRegCard(r)).join('')}
                        </div>
                    ` : `
                        <div class="admin-empty">
                            <div class="admin-empty__icon"> ${icon("registrations")}</div>
                            <div class="admin-empty__title">No Registration Requests</div>
                            <div class="admin-empty__text">New Academy applications will appear here when students register.</div>
                        </div>
                    `}
                </div>
            </div>
        `;

        // Bind filter events
        const searchInput = document.getElementById('regSearch');
        if (searchInput) {
            let debounce;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    regState.search = e.target.value;
                    applyRegFilters();
                    renderRegistrationsList();
                }, 300);
            });
        }

        const statusSelect = document.getElementById('regStatusFilter');
        if (statusSelect) {
            statusSelect.addEventListener('change', (e) => {
                regState.statusFilter = e.target.value;
                applyRegFilters();
                renderRegistrationsList();
            });
        }

        const progSelect = document.getElementById('regProgrammeFilter');
        if (progSelect) {
            progSelect.addEventListener('change', (e) => {
                regState.programmeFilter = e.target.value;
                applyRegFilters();
                renderRegistrationsList();
            });
        }
    }

    function renderRegRow(r) {
        const deadline = r.review_deadline ? new Date(r.review_deadline) : null;
        const now = new Date();
        const isOverdue = deadline && now > deadline && ['pending_review', 'email_verified', 'needs_information', 'pending_email_verification'].includes(r.status);
        const programmes = (r.selected_programmes || []).map(p => p.name).join(', ') || '-';

        return `
            <tr class="${isOverdue ? 'reg-row--overdue' : ''}">
                <td><strong>${r.request_id}</strong></td>
                <td>
                    <div class="reg-student-cell">
                        <span>${r.full_name}</span>
                        ${r.is_minor ? '<span class="badge badge--needs-info" style="font-size:0.65rem;">Minor</span>' : ''}
                    </div>
                </td>
                <td>${r.email}</td>
                <td>${r.mobile}</td>
                <td><span class="reg-programmes-cell">${programmes}</span></td>
                <td>${formatDate(r.submitted_at)}</td>
                <td>
                    ${deadline ? `
                        <span class="${isOverdue ? 'reg-deadline--overdue' : ''}">${formatDate(r.review_deadline)}</span>
                        ${isOverdue ? '<span class="badge badge--rejected" style="font-size:0.6rem; margin-left:4px;">OVERDUE</span>' : ''}
                    ` : '-'}
                </td>
                <td><span class="badge badge--${getStatusBadgeClass(r.status)}">${formatStatus(r.status)}</span></td>
                <td>
                    <button class="btn btn--secondary btn--sm" onclick="Admin.viewRegistration('${r.id}')">View</button>
                </td>
            </tr>
        `;
    }

    function renderRegCard(r) {
        const deadline = r.review_deadline ? new Date(r.review_deadline) : null;
        const now = new Date();
        const isOverdue = deadline && now > deadline && ['pending_review', 'email_verified', 'needs_information', 'pending_email_verification'].includes(r.status);
        const programmes = (r.selected_programmes || []).map(p => p.name);

        return `
            <div class="reg-card ${isOverdue ? 'reg-card--overdue' : ''}" onclick="Admin.viewRegistration('${r.id}')">
                <div class="reg-card__header">
                    <strong>${r.request_id}</strong>
                    <span class="badge badge--${getStatusBadgeClass(r.status)}">${formatStatus(r.status)}</span>
                </div>
                <div class="reg-card__name">${r.full_name} ${r.is_minor ? '<span class="badge badge--needs-info" style="font-size:0.6rem;">Minor</span>' : ''}</div>
                <div class="reg-card__meta">${r.email} · ${r.mobile}</div>
                <div class="reg-card__programmes">
                    ${programmes.map(p => `<span class="badge badge--approved" style="font-size:0.7rem;">${p}</span>`).join('')}
                </div>
                <div class="reg-card__footer">
                    <span>${formatDate(r.submitted_at)}</span>
                    ${isOverdue ? '<span class="badge badge--rejected" style="font-size:0.6rem;">OVERDUE</span>' : ''}
                </div>
            </div>
        `;
    }

    // ========================================
    // Registration Requests - Detail
    // ========================================
    async function viewRegistration(id) {
        regState.currentView = 'detail';
        regState.detailLoading = true;
        regState.detailError = null;
        regState.selectedRequest = null;
        renderRegDetail();

        try {
            const req = await apiCall(`/registration-requests/${id}`);
            regState.selectedRequest = req;
        } catch (error) {
            regState.detailError = error.message;
        } finally {
            regState.detailLoading = false;
            renderRegDetail();
        }
    }

    function renderRegDetail() {
        const container = document.getElementById('adminContent');

        if (regState.detailLoading) {
            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Registration Request</h1>
                        <p class="admin-header__subtitle">Loading details...</p>
                    </div>
                    <button class="btn btn--secondary" onclick="Admin.backToList()">← Back to List</button>
                </div>
                <div class="admin-loading"><div class="admin-loading__spinner"></div>Loading request details...</div>
            `;
            return;
        }

        if (regState.detailError) {
            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Registration Request</h1>
                        <p class="admin-header__subtitle">Error loading request</p>
                    </div>
                    <button class="btn btn--secondary" onclick="Admin.backToList()">← Back to List</button>
                </div>
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load registration</div>
                    <div class="admin-empty__text">${escapeHtml(regState.detailError)}</div>
                </div>
            `;
            return;
        }

        const req = regState.selectedRequest;
        if (!req) return;

        const deadline = req.review_deadline ? new Date(req.review_deadline) : null;
        const now = new Date();
        const isOverdue = deadline && now > deadline && ['pending_review', 'email_verified', 'needs_information', 'pending_email_verification'].includes(req.status);
        const age = calculateAge(req.date_of_birth);
        const programmes = req.selected_programmes || [];

        // Determine which actions are available
        const canApprove = ['pending_review', 'email_verified', 'needs_information'].includes(req.status);
        const canReject = ['pending_review', 'email_verified', 'needs_information'].includes(req.status);
        const canRequestInfo = ['pending_review', 'email_verified'].includes(req.status);

        container.innerHTML = `
            <div class="admin-header">
                <div>
                    <h1 class="admin-header__title">Registration Request</h1>
                    <p class="admin-header__subtitle">${req.request_id}</p>
                </div>
                <button class="btn btn--secondary" onclick="Admin.backToList()">← Back to List</button>
            </div>

            <div class="admin-detail">
                <!-- Header -->
                <div class="admin-detail__header">
                    <div>
                        <h2 class="admin-detail__title">${req.full_name}</h2>
                        <div class="admin-detail__meta">
                            <span class="admin-detail__meta-item">${icon("mail")} ${req.email}</span>
                            <span class="admin-detail__meta-item">${icon("users")} ${req.mobile}</span>
                            <span class="admin-detail__meta-item">${icon("clock")} Submitted ${formatDateTime(req.submitted_at)}</span>
                        </div>
                    </div>
                    <div class="admin-detail__status-group">
                        <span class="badge badge--${getStatusBadgeClass(req.status)}" style="font-size: 0.85rem; padding: 6px 14px;">${formatStatus(req.status)}</span>
                        ${isOverdue ? '<span class="badge badge--rejected" style="font-size: 0.85rem; padding: 6px 14px; margin-left: 8px;">OVERDUE</span>' : ''}
                    </div>
                </div>

                <!-- 72-Hour Review Indicator -->
                ${deadline ? `
                    <div class="reg-deadline-banner ${isOverdue ? 'reg-deadline-banner--overdue' : ''}">
                        <div class="reg-deadline-banner__icon">${isOverdue ? '⚠️' : '⏱️'}</div>
                        <div class="reg-deadline-banner__text">
                            <strong>${isOverdue ? 'Review Overdue' : '72-Hour Review Window'}</strong>
                            <span>${isOverdue
                                ? 'Review deadline has passed.'
                                : `Review deadline: ${formatDateTime(req.review_deadline)}`
                            }</span>
                        </div>
                    </div>
                ` : ''}

                <!-- Application Timeline -->
                <div class="admin-detail__section">
                    <h3 class="admin-detail__section-title">Application Timeline</h3>
                    <div class="reg-timeline">
                        ${renderTimeline(req)}
                    </div>
                </div>

                <!-- Applicant Information -->
                <div class="admin-detail__section">
                    <h3 class="admin-detail__section-title">Applicant Information</h3>
                    <div class="admin-detail__grid">
                        <div class="admin-detail__field">
                            <span class="admin-detail__field-label">Full Name</span>
                            <span class="admin-detail__field-value">${req.full_name}</span>
                        </div>
                        <div class="admin-detail__field">
                            <span class="admin-detail__field-label">Email</span>
                            <span class="admin-detail__field-value">${req.email}</span>
                        </div>
                        <div class="admin-detail__field">
                            <span class="admin-detail__field-label">Mobile</span>
                            <span class="admin-detail__field-value">${req.mobile}</span>
                        </div>
                        <div class="admin-detail__field">
                            <span class="admin-detail__field-label">Date of Birth</span>
                            <span class="admin-detail__field-value">${formatDate(req.date_of_birth)}</span>
                        </div>
                        <div class="admin-detail__field">
                            <span class="admin-detail__field-label">Age</span>
                            <span class="admin-detail__field-value">${age} years ${req.is_minor ? '(Under 18)' : '(18+)'}</span>
                        </div>
                        ${req.address ? `
                            <div class="admin-detail__field" style="grid-column: 1 / -1;">
                                <span class="admin-detail__field-label">Address</span>
                                <span class="admin-detail__field-value">${req.address}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Guardian Information (minors only) -->
                ${req.is_minor && req.guardian_name ? `
                    <div class="admin-detail__section">
                        <h3 class="admin-detail__section-title">Guardian Information</h3>
                        <div class="admin-detail__grid">
                            <div class="admin-detail__field">
                                <span class="admin-detail__field-label">Guardian Name</span>
                                <span class="admin-detail__field-value">${req.guardian_name}</span>
                            </div>
                            <div class="admin-detail__field">
                                <span class="admin-detail__field-label">Relationship</span>
                                <span class="admin-detail__field-value">${req.guardian_relationship || '-'}</span>
                            </div>
                            ${req.guardian_email ? `
                                <div class="admin-detail__field">
                                    <span class="admin-detail__field-label">Guardian Email</span>
                                    <span class="admin-detail__field-value">${req.guardian_email}</span>
                                </div>
                            ` : ''}
                            <div class="admin-detail__field">
                                <span class="admin-detail__field-label">Guardian Mobile</span>
                                <span class="admin-detail__field-value">${req.guardian_mobile || '-'}</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Selected Programmes -->
                <div class="admin-detail__section">
                    <h3 class="admin-detail__section-title">Selected Programmes</h3>
                    <div class="reg-programmes-grid">
                        ${programmes.map(p => `
                            <div class="reg-programme-card">
                                <span class="reg-programme-card__icon">${icon("book")}</span>
                                <span class="reg-programme-card__name">${p.name}</span>
                            </div>
                        `).join('')}
                    </div>
                    <p class="reg-note">ONE student → ONE CMA Registration ID → ${programmes.length} course enrollment${programmes.length !== 1 ? 's' : ''}</p>
                </div>

                <!-- Review Notes (if already reviewed) -->
                ${req.review_notes ? `
                    <div class="admin-detail__section">
                        <h3 class="admin-detail__section-title">Review Notes</h3>
                        <div class="reg-review-notes">
                            <p>${escapeHtml(req.review_notes)}</p>
                            ${req.reviewed_at ? `<span class="reg-review-notes__date">Reviewed on ${formatDateTime(req.reviewed_at)}</span>` : ''}
                        </div>
                    </div>
                ` : ''}

                <!-- Approved State -->
                ${req.status === 'approved' ? `
                    <div class="admin-detail__section">
                        <div class="reg-approved-banner">
                            <div class="reg-approved-banner__icon">${icon("approved")}</div>
                            <div class="reg-approved-banner__text">
                                <strong>Approved</strong>
                                <span>This application has been approved. The student account will be activated and a permanent CMA Registration ID will be assigned.</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Rejected State -->
                ${req.status === 'rejected' ? `
                    <div class="admin-detail__section">
                        <div class="reg-rejected-banner">
                            <div class="reg-rejected-banner__icon">${icon("rejected")}</div>
                            <div class="reg-rejected-banner__text">
                                <strong>Rejected</strong>
                                <span>This application has been rejected.${req.review_notes ? ' Reason: ' + escapeHtml(req.review_notes) : ''}</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Pending Email Verification State -->
                ${req.status === 'pending_email_verification' ? `
                    <div class="admin-detail__section">
                        <div class="reg-pending-banner">
                            <div class="reg-pending-banner__icon">${icon("mail")}</div>
                            <div class="reg-pending-banner__text">
                                <strong>Waiting for Email Verification</strong>
                                <span>The applicant has not yet verified their email address. Admin approval is not available until email is verified.</span>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Admin Actions -->
                ${canApprove || canReject || canRequestInfo ? `
                    <div class="admin-detail__section">
                        <h3 class="admin-detail__section-title">Admin Actions</h3>
                        <div class="admin-actions">
                            ${canApprove ? `
                                <button class="btn btn--primary" onclick="Admin.showApproveModal('${req.id}')">
                                    ✓ Approve Application
                                </button>
                            ` : ''}
                            ${canRequestInfo ? `
                                <button class="btn btn--secondary reg-btn--warning" onclick="Admin.showRequestInfoModal('${req.id}')">
                                    ℹ Request More Information
                                </button>
                            ` : ''}
                            ${canReject ? `
                                <button class="btn btn--secondary reg-btn--danger" onclick="Admin.showRejectModal('${req.id}')">
                                    ✕ Reject Application
                                </button>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function renderTimeline(req) {
        const events = [];

        // Application Submitted
        events.push({
            done: true,
            label: 'Application Submitted',
            date: req.submitted_at,
        });

        // Email Verification
        if (req.status === 'pending_email_verification') {
            events.push({
                done: false,
                current: true,
                label: 'Email Verification',
                date: null,
            });
        } else {
            events.push({
                done: true,
                label: 'Email Verification',
                date: req.submitted_at, // approximate
            });
        }

        // Admin Review
        if (['pending_review', 'email_verified', 'needs_information'].includes(req.status)) {
            events.push({
                done: false,
                current: true,
                label: 'Pending Admin Review',
                date: null,
            });
        } else if (req.status === 'approved') {
            events.push({
                done: true,
                label: 'Admin Review',
                date: req.reviewed_at,
            });
        } else if (req.status === 'rejected') {
            events.push({
                done: true,
                label: 'Application Rejected',
                date: req.reviewed_at,
            });
        } else if (req.status === 'needs_information') {
            events.push({
                done: false,
                current: true,
                label: 'Awaiting Information',
                date: null,
            });
        }

        // Approval (only if approved)
        if (req.status === 'approved') {
            events.push({
                done: true,
                label: 'Approval',
                date: req.reviewed_at,
            });
            events.push({
                done: false,
                label: 'Student Activation',
                date: null,
            });
        } else if (req.status === 'rejected') {
            events.push({
                done: false,
                label: 'Approval',
                date: null,
                skipped: true,
            });
            events.push({
                done: false,
                label: 'Student Activation',
                date: null,
                skipped: true,
            });
        } else {
            events.push({
                done: false,
                label: 'Approval',
                date: null,
            });
            events.push({
                done: false,
                label: 'Student Activation',
                date: null,
            });
        }

        return events.map(e => `
            <div class="reg-timeline__item ${e.done ? 'reg-timeline__item--done' : ''} ${e.current ? 'reg-timeline__item--current' : ''} ${e.skipped ? 'reg-timeline__item--skipped' : ''}">
                <div class="reg-timeline__dot">${e.done ? '✓' : e.current ? '●' : e.skipped ? '✕' : '○'}</div>
                <div class="reg-timeline__content">
                    <span class="reg-timeline__label">${e.label}</span>
                    ${e.date ? `<span class="reg-timeline__date">${formatDateTime(e.date)}</span>` : ''}
                </div>
            </div>
        `).join('');
    }

    // ========================================
    // Modal System
    // ========================================
    function showModal(html) {
        let overlay = document.getElementById('adminModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'adminModalOverlay';
            document.body.appendChild(overlay);
        }
        overlay.innerHTML = `
            <div class="admin-modal-overlay" onclick="Admin.closeModal(event)">
                <div class="admin-modal" onclick="event.stopPropagation()">
                    ${html}
                </div>
            </div>
        `;
        document.body.style.overflow = 'hidden';
    }

    function closeModal(e) {
        if (e && e.target && !e.target.classList.contains('admin-modal-overlay')) return;
        const overlay = document.getElementById('adminModalOverlay');
        if (overlay) overlay.innerHTML = '';
        document.body.style.overflow = '';
    }

    function closeModalDirect() {
        const overlay = document.getElementById('adminModalOverlay');
        if (overlay) overlay.innerHTML = '';
        document.body.style.overflow = '';
    }

    // ========================================
    // Approve Modal
    // ========================================
    function showApproveModal(id) {
        const req = regState.selectedRequest;
        if (!req) return;

        const programmes = (req.selected_programmes || []).map(p => p.name).join(', ');

        showModal(`
            <div class="admin-modal__header admin-modal__header--success">
                <h2 class="admin-modal__title">Approve Registration?</h2>
            </div>
            <div class="admin-modal__body">
                <p>You are about to approve this Academy registration.</p>
                <div class="admin-modal__info">
                    <strong>After approval:</strong>
                    <ul>
                        <li>A permanent CMA Registration ID will be created.</li>
                        <li>The student account will be activated according to the LMS workflow.</li>
                        <li>The selected programmes will become course enrollments.</li>
                    </ul>
                </div>
                <div class="admin-modal__applicant">
                    <div><strong>${req.full_name}</strong></div>
                    <div style="color: var(--color-text-secondary); font-size: 0.9rem;">${req.email}</div>
                    <div style="color: var(--color-text-secondary); font-size: 0.9rem; margin-top: 4px;">Programmes: ${programmes}</div>
                </div>
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" id="modalApproveBtn" onclick="Admin.confirmApprove('${id}')">Approve Application</button>
            </div>
        `);
    }

    async function confirmApprove(id) {
        const btn = document.getElementById('modalApproveBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Approving...';
        }

        try {
            await apiCall(`/registration-requests/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'approved', notes: '' }),
            });
            closeModalDirect();
            showToast('Registration approved successfully.', 'success');
            await viewRegistration(id);
        } catch (error) {
            showToast('Failed to approve: ' + error.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Approve Application';
            }
        }
    }

    // ========================================
    // Reject Modal
    // ========================================
    function showRejectModal(id) {
        const req = regState.selectedRequest;
        if (!req) return;

        showModal(`
            <div class="admin-modal__header admin-modal__header--danger">
                <h2 class="admin-modal__title">Reject Registration?</h2>
            </div>
            <div class="admin-modal__body">
                <p>You are about to reject this Academy registration. This action preserves the application in the system.</p>
                <div class="admin-modal__field">
                    <label class="auth__label">Rejection Reason <span style="color: var(--color-error);">*</span></label>
                    <textarea class="auth__input auth__textarea" id="rejectReason" placeholder="Enter the reason for rejecting this application..." rows="4"></textarea>
                    <span class="auth__error" id="rejectReasonError">Rejection reason is required</span>
                </div>
                <div class="admin-modal__applicant">
                    <div><strong>${req.full_name}</strong> · ${req.request_id}</div>
                </div>
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary reg-btn--danger" id="modalRejectBtn" onclick="Admin.confirmReject('${id}')">Reject Application</button>
            </div>
        `);
    }

    async function confirmReject(id) {
        const reason = document.getElementById('rejectReason')?.value.trim();
        const errorEl = document.getElementById('rejectReasonError');

        if (!reason) {
            if (errorEl) errorEl.classList.add('auth__error--visible');
            return;
        }
        if (errorEl) errorEl.classList.remove('auth__error--visible');

        const btn = document.getElementById('modalRejectBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Rejecting...';
        }

        try {
            await apiCall(`/registration-requests/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'rejected', notes: reason }),
            });
            closeModalDirect();
            showToast('Registration rejected successfully.', 'success');
            await viewRegistration(id);
        } catch (error) {
            showToast('Failed to reject: ' + error.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Reject Application';
            }
        }
    }

    // ========================================
    // Request More Information Modal
    // ========================================
    function showRequestInfoModal(id) {
        const req = regState.selectedRequest;
        if (!req) return;

        showModal(`
            <div class="admin-modal__header admin-modal__header--warning">
                <h2 class="admin-modal__title">Request More Information</h2>
            </div>
            <div class="admin-modal__body">
                <p>Send a request to the applicant for additional information. The status will change to "Needs Information".</p>
                <div class="admin-modal__field">
                    <label class="auth__label">Information Required</label>
                    <textarea class="auth__input auth__textarea" id="infoRequest" placeholder="Describe what information is needed from the applicant..." rows="4"></textarea>
                </div>
                <div class="admin-modal__applicant">
                    <div><strong>${req.full_name}</strong> · ${req.email}</div>
                </div>
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" id="modalInfoBtn" onclick="Admin.confirmRequestInfo('${id}')">Send Request</button>
            </div>
        `);
    }

    async function confirmRequestInfo(id) {
        const notes = document.getElementById('infoRequest')?.value.trim() || '';

        const btn = document.getElementById('modalInfoBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Sending...';
        }

        try {
            await apiCall(`/registration-requests/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: 'needs_information', notes: notes }),
            });
            closeModalDirect();
            showToast('Information request sent successfully.', 'success');
            await viewRegistration(id);
        } catch (error) {
            showToast('Failed to send request: ' + error.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Send Request';
            }
        }
    }

    // ========================================
    // Toast System
    // ========================================
    function showToast(message, type = 'success') {
        let container = document.getElementById('adminToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'adminToastContainer';
            container.className = 'admin-toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `admin-toast admin-toast--${type}`;
        toast.innerHTML = `
            <span class="admin-toast__icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="admin-toast__message">${escapeHtml(message)}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('admin-toast--visible'), 10);
        setTimeout(() => {
            toast.classList.remove('admin-toast--visible');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ========================================
    // Filter Helpers
    // ========================================
    function filterByStatus(status) {
        regState.statusFilter = status;
        regState.currentView = 'list';
        applyRegFilters();
        renderRegistrationsList();
    }

    function clearRegFilters() {
        regState.search = '';
        regState.statusFilter = 'all';
        regState.programmeFilter = 'all';
        applyRegFilters();
        renderRegistrationsList();
    }

    function backToList() {
        regState.currentView = 'list';
        regState.selectedRequest = null;
        loadRegistrations();
    }

    // ========================================
    // Students
    // ========================================
    async function renderStudents() {
        if (studentWs.active) {
            renderStudentWorkspace();
            return;
        }
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading students...</div>';

        try {
            const students = await apiCall('/students');

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Students</h1>
                        <p class="admin-header__subtitle">Manage student profiles and CMA registrations</p>
                    </div>
                </div>

                <div class="admin-card">
                    <div class="admin-card__body" style="padding: 0;">
                        ${students.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>CMA ID</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Enrollments</th>
                                        <th>Registered</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(s => `
                                        <tr style="cursor:pointer;" onclick="Admin.openStudentWorkspace('${s.id}')">
                                            <td><strong>${s.cma_registration_id}</strong></td>
                                            <td>${s.full_name}</td>
                                            <td>${s.phone || '-'}</td>
                                            <td><span class="badge badge--${s.status}">${s.status}</span></td>
                                            <td>${s.enrollment_count}</td>
                                            <td>${formatDate(s.created_at)}</td>
                                            <td><button class="btn btn--secondary btn--sm">Open →</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("students")}</div>
                                <div class="admin-empty__title">No students yet</div>
                                <div class="admin-empty__text">Students will appear here after registration approval</div>
                            </div>
                        `}
                    </div>
                </div>
            `;

        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load students</div>
                    <div class="admin-empty__text">${error.message}</div>
                </div>
            `;
        }
    }

    // ========================================
    // Enrollments
    // ========================================
    async function renderEnrollments() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading enrollments...</div>';

        try {
            const enrollments = await apiCall('/enrollments');

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Enrollments</h1>
                        <p class="admin-header__subtitle">Manage course enrollments</p>
                    </div>
                </div>

                <div class="admin-card">
                    <div class="admin-card__body" style="padding: 0;">
                        ${enrollments.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Programme</th>
                                        <th>Student ID</th>
                                        <th>Fee Plan</th>
                                        <th>Status</th>
                                        <th>Start Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${enrollments.map(e => `
                                        <tr>
                                            <td><strong>${e.programme_name}</strong></td>
                                            <td>${e.student_id.substring(0, 8)}...</td>
                                            <td>${e.fee_plan || '-'}</td>
                                            <td><span class="badge badge--${e.status}">${e.status}</span></td>
                                            <td>${formatDate(e.start_date)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("enrollments")}</div>
                                <div class="admin-empty__title">No enrollments yet</div>
                                <div class="admin-empty__text">Enrollments will appear here</div>
                            </div>
                        `}
                    </div>
                </div>
            `;

        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load enrollments</div>
                    <div class="admin-empty__text">${error.message}</div>
                </div>
            `;
        }
    }

    // ========================================
    // ========================================
    // Instructors
    // ========================================
    async function renderInstructors() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading instructors...</div>';

        try {
            const instructors = await apiCall('/instructors');
            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Instructors</h1>
                        <p class="admin-header__subtitle">Faculty directory and specialisations</p>
                    </div>
                </div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding: 0;">
                        ${instructors.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Specializations</th>
                                        <th>Experience</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${instructors.map(i => `
                                        <tr>
                                            <td><strong>${escapeHtml(i.full_name)}</strong></td>
                                            <td>${escapeHtml(i.phone || '-')}</td>
                                            <td>${escapeHtml(i.specializations || '-')}</td>
                                            <td>${i.experience_years ? escapeHtml(i.experience_years) + ' yrs' : '-'}</td>
                                            <td><span class="badge badge--${i.is_active ? 'active' : 'inactive'}">${i.is_active ? 'Active' : 'Inactive'}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("instructors")}</div>
                                <div class="admin-empty__title">No instructors yet</div>
                                <div class="admin-empty__text">Faculty profiles will appear here</div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load instructors</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    // ========================================
    // Classes / Schedules
    // ========================================
    let classStatusFilter = 'all';

    async function renderClasses() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading classes...</div>';

        try {
            const now = new Date();
            const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const token = localStorage.getItem('academy_token');
            const response = await fetch(
                `${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000' : ''}` +
                `/api/v1/sessions?date_from=${ym}-01&date_to=${ym}-${lastDay}&limit=300`,
                { headers: token ? { Authorization: `Bearer ${token}` } : {} }
            );
            if (!response.ok) throw new Error('Failed to load classes');
            let sessions = await response.json();

            const students = await apiCall('/students');
            const studentMap = {};
            students.forEach(s => { studentMap[s.id] = s.full_name; });

            if (classStatusFilter !== 'all') {
                sessions = sessions.filter(s => s.status === classStatusFilter);
            }
            sessions.sort((a, b) => (a.scheduled_date + a.scheduled_start) < (b.scheduled_date + b.scheduled_start) ? -1 : 1);

            const filters = ['all', 'scheduled', 'completed', 'rescheduling_required', 'cancelled'].map(f => `
                <button class="admin-filter ${classStatusFilter === f ? 'admin-filter--active' : ''}"
                        onclick="Admin.filterClasses('${f}')">
                    ${f === 'all' ? 'All' : formatStatus(f)}
                </button>
            `).join('');

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Classes / Schedules</h1>
                        <p class="admin-header__subtitle">${now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} — ${sessions.length} sessions</p>
                    </div>
                </div>
                <div class="admin-filters">${filters}</div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding: 0;">
                        ${sessions.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Student</th>
                                        <th>Faculty</th>
                                        <th>Duration</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${sessions.map(s => `
                                        <tr>
                                            <td>${formatDate(s.scheduled_date)}</td>
                                            <td>${s.scheduled_start} – ${s.scheduled_end}</td>
                                            <td><strong>${escapeHtml(s.student_name || studentMap[s.student_id] || '—')}</strong></td>
                                            <td>${escapeHtml(s.instructor_name || '—')}</td>
                                            <td>${s.duration_minutes} min${s.is_duration_exception ? ' ⚠' : ''}</td>
                                            <td><span class="badge badge--${getStatusBadgeClass(s.status)}">${formatStatus(s.status)}</span></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("classes")}</div>
                                <div class="admin-empty__title">No classes match this filter</div>
                                <div class="admin-empty__text">Sessions scheduled this month will appear here</div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load classes</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    function filterClasses(status) {
        classStatusFilter = status;
        renderClasses();
    }

    // ========================================
    // Fees & Payments
    // ========================================
    let feeStatusFilter = 'all';

    async function renderFees() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading fees...</div>';

        try {
            let fees = await apiCall('/fees?limit=200');
            if (feeStatusFilter !== 'all') {
                fees = fees.filter(f => f.payment_status === feeStatusFilter);
            }

            const outstanding = fees.reduce((sum, f) => sum + Math.max(f.amount_expected - f.amount_paid, 0), 0);
            const collected = fees.reduce((sum, f) => sum + f.amount_paid, 0);

            const filters = ['all', 'paid', 'partial', 'pending'].map(f => `
                <button class="admin-filter ${feeStatusFilter === f ? 'admin-filter--active' : ''}"
                        onclick="Admin.filterFees('${f}')">
                    ${f === 'all' ? 'All' : formatStatus(f)}
                </button>
            `).join('');

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Fees & Payments</h1>
                        <p class="admin-header__subtitle">Collected: ₹${collected.toLocaleString('en-IN')} · Outstanding: ₹${outstanding.toLocaleString('en-IN')}</p>
                    </div>
                </div>
                <div class="admin-filters">${filters}</div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding: 0;">
                        ${fees.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Period</th>
                                        <th>Plan</th>
                                        <th>Expected</th>
                                        <th>Paid</th>
                                        <th>Status</th>
                                        <th>Method</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${fees.map(f => `
                                        <tr>
                                            <td><strong>${escapeHtml(f.student_name || '—')}</strong><br>
                                                <small>${escapeHtml(f.cma_registration_id || '')}</small></td>
                                            <td>${escapeHtml(f.period)}</td>
                                            <td>${escapeHtml(f.fee_plan || '-')}</td>
                                            <td>₹${Number(f.amount_expected).toLocaleString('en-IN')}</td>
                                            <td>₹${Number(f.amount_paid).toLocaleString('en-IN')}</td>
                                            <td><span class="badge badge--${getStatusBadgeClass(f.payment_status)}">${formatStatus(f.payment_status)}</span></td>
                                            <td>${escapeHtml(f.payment_method || '-')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("fees")}</div>
                                <div class="admin-empty__title">No fee records match</div>
                                <div class="admin-empty__text">Fee records appear here after invoices are issued</div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load fees</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    function filterFees(status) {
        feeStatusFilter = status;
        renderFees();
    }

    // ========================================
    // Attendance (per-student session history)
    // ========================================
    let attendanceStudentId = null;

    async function renderAttendance() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading attendance...</div>';

        try {
            const students = await apiCall('/students');
            if (!attendanceStudentId && students.length > 0) attendanceStudentId = students[0].id;

            const options = students.map(s => `
                <option value="${s.id}" ${s.id === attendanceStudentId ? 'selected' : ''}>
                    ${escapeHtml(s.full_name)} (${escapeHtml(s.cma_registration_id || '')})
                </option>
            `).join('');

            let sessions = [];
            if (attendanceStudentId) {
                sessions = await apiV1Call(`/sessions?student_id=${attendanceStudentId}&limit=300`);
            }
            sessions.sort((a, b) => (a.scheduled_date + a.scheduled_start) < (b.scheduled_date + b.scheduled_start) ? 1 : -1);

            const counts = {
                scheduled: sessions.filter(s => s.status === 'scheduled').length,
                completed: sessions.filter(s => s.status === 'completed').length,
                rescheduling_required: sessions.filter(s => s.status === 'rescheduling_required').length,
                cancelled: sessions.filter(s => s.status === 'cancelled').length,
            };

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Attendance / Session Records</h1>
                        <p class="admin-header__subtitle">Completed, scheduled and rescheduled classes per student</p>
                    </div>
                </div>
                <div class="admin-card">
                    <div class="admin-card__body">
                        <label class="form-label" for="attendanceStudent">Select student</label>
                        <select id="attendanceStudent" class="auth__input" onchange="Admin.selectAttendanceStudent(this.value)">
                            ${options || '<option value="">No students yet</option>'}
                        </select>
                    </div>
                </div>
                ${attendanceStudentId ? `
                    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:16px;">
                        <div class="admin-card"><div class="admin-card__body"><div style="font-size:12px;color:#706B60">Scheduled</div><div style="font-size:22px;font-weight:700">${counts.scheduled}</div></div></div>
                        <div class="admin-card"><div class="admin-card__body"><div style="font-size:12px;color:#706B60">Completed</div><div style="font-size:22px;font-weight:700;color:#176B3A">${counts.completed}</div></div></div>
                        <div class="admin-card"><div class="admin-card__body"><div style="font-size:12px;color:#706B60">Reschedule pending</div><div style="font-size:22px;font-weight:700;color:#E84141">${counts.rescheduling_required}</div></div></div>
                        <div class="admin-card"><div class="admin-card__body"><div style="font-size:12px;color:#706B60">Cancelled</div><div style="font-size:22px;font-weight:700;color:#706B60">${counts.cancelled}</div></div></div>
                    </div>
                    <div class="admin-card">
                        <div class="admin-card__body" style="padding:0;">
                            ${sessions.length > 0 ? `
                                <table class="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Faculty</th>
                                            <th>Status</th>
                                            <th>Topics covered</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${sessions.map(s => `
                                            <tr>
                                                <td>${formatDate(s.scheduled_date)}</td>
                                                <td>${s.scheduled_start} – ${s.scheduled_end}</td>
                                                <td>${escapeHtml(s.instructor_name || '—')}</td>
                                                <td><span class="badge badge--${getStatusBadgeClass(s.status)}">${formatStatus(s.status)}</span></td>
                                                <td>${escapeHtml(s.topics_covered || '—')}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            ` : `
                                <div class="admin-empty">
                                    <div class="admin-empty__icon"> ${icon("attendance")}</div>
                                    <div class="admin-empty__title">No sessions recorded</div>
                                    <div class="admin-empty__text">Completed and scheduled classes appear here</div>
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load attendance</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    function selectAttendanceStudent(id) {
        attendanceStudentId = id;
        renderAttendance();
    }

    // ========================================
    // Progress (syllabus + reports overview)
    // ========================================
    async function renderProgress() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading progress...</div>';

        try {
            const data = await apiCall('/progress');
            const rows = data.students || [];

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Student Progress</h1>
                        <p class="admin-header__subtitle">Syllabus completion, latest reports and pending assignments</p>
                    </div>
                </div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding:0;">
                        ${rows.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Syllabus Progress</th>
                                        <th>Latest Report</th>
                                        <th>Pending Assignments</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rows.map(r => `
                                        <tr>
                                            <td><strong>${escapeHtml(r.student_name)}</strong><br>
                                                <small>${escapeHtml(r.cma_registration_id || '')}</small></td>
                                            <td>
                                                ${r.syllabus_total > 0 ? `
                                                    <div style="display:flex;align-items:center;gap:8px;">
                                                        <div style="flex:1;height:6px;background:#E7DFD0;border-radius:3px;overflow:hidden;">
                                                            <div style="height:100%;width:${r.syllabus_percent}%;background:#B58A35;"></div>
                                                        </div>
                                                        <span>${r.syllabus_completed}/${r.syllabus_total} (${r.syllabus_percent}%)</span>
                                                    </div>
                                                ` : '<span style="color:#706B60">No syllabus items yet</span>'}
                                            </td>
                                            <td>${r.latest_report ? `
                                                <strong>${escapeHtml(r.latest_report.report_month)}</strong><br>
                                                <span class="badge badge--${getStatusBadgeClass(r.latest_report.status)}">${formatStatus(r.latest_report.status)}</span>
                                            ` : '<span style="color:#706B60">None yet</span>'}</td>
                                            <td>${r.pending_assignments}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("progress")}</div>
                                <div class="admin-empty__title">No students yet</div>
                                <div class="admin-empty__text">Progress data appears once students are enrolled</div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load progress</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    // ========================================
    // Exams / Milestones
    // ========================================
    async function renderExams() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading exams...</div>';

        try {
            const [exams, milestones, students] = await Promise.all([
                apiV1Call('/learning/exams'),
                apiV1Call('/learning/milestones'),
                apiCall('/students'),
            ]);
            const studentMap = {};
            (students || []).forEach(s => { studentMap[s.id] = s.full_name; });

            const examRows = (exams || []).map(e => `
                <tr>
                    <td><strong>${escapeHtml(e.board)} Grade ${escapeHtml(e.grade || '—')}</strong><br>
                        <small>${escapeHtml(e.instrument)}</small></td>
                    <td>${escapeHtml(studentMap[e.student_id] || '—')}</td>
                    <td>${e.submission_deadline ? formatDate(e.submission_deadline) : '—'}</td>
                    <td><span class="badge badge--${getStatusBadgeClass(e.readiness === 'exam_ready' ? 'completed' : (e.readiness || 'pending'))}">${formatStatus(e.readiness || 'not_assessed')}</span></td>
                    <td>${(e.items || []).length}</td>
                    <td>
                        <button class="btn btn--secondary" onclick="Admin.editExam('${e.id}')">Update</button>
                    </td>
                </tr>
            `).join('');

            const milestoneRows = (milestones || []).map(m => `
                <tr>
                    <td><strong>${escapeHtml(m.title)}</strong><br><small>${escapeHtml(m.milestone_type)}</small></td>
                    <td>${escapeHtml(studentMap[m.student_id] || '—')}</td>
                    <td>${m.due_date ? formatDate(m.due_date) : '—'}</td>
                    <td>${m.achieved_at ? formatDate(m.achieved_at) : '—'}</td>
                    <td><span class="badge badge--${getStatusBadgeClass(m.status === 'achieved' ? 'completed' : m.status || 'pending')}">${formatStatus(m.status || 'upcoming')}</span></td>
                </tr>
            `).join('');

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Exams / Certifications</h1>
                        <p class="admin-header__subtitle">Board exams, graded assessments and milestones</p>
                    </div>
                    <button class="btn btn--primary" onclick="Admin.showExamModal()">+ New Exam</button>
                </div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding:0;">
                        <h3 style="margin:0 0 12px;padding:16px 16px 0;">Exams</h3>
                        ${(exams || []).length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr><th>Exam</th><th>Student</th><th>Deadline</th><th>Readiness</th><th>Items</th><th></th></tr>
                                </thead>
                                <tbody>${examRows}</tbody>
                            </table>
                        ` : '<div class="admin-empty" style="padding:16px;"><div class="admin-empty__icon"> ${icon("exams")}</div><div class="admin-empty__title">No exams configured</div><div class="admin-empty__text">Create the first exam to get started</div></div>'}
                    </div>
                </div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding:0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 16px 0;">
                            <h3 style="margin:0;">Milestones</h3>
                            <button class="btn btn--secondary" onclick="Admin.showMilestoneModal()">+ New Milestone</button>
                        </div>
                        ${(milestones || []).length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr><th>Milestone</th><th>Student</th><th>Due</th><th>Achieved</th><th>Status</th></tr>
                                </thead>
                                <tbody>${milestoneRows}</tbody>
                            </table>
                        ` : '<div class="admin-empty" style="padding:16px;"><div class="admin-empty__icon"> ${icon("exams")}</div><div class="admin-empty__title">No milestones yet</div></div>'}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load exams</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    async function editExam(id) {
        const exams = await apiV1Call('/learning/exams');
        const exam = (exams || []).find(x => x.id === id);
        if (!exam) return;
        showModal(`
            <div class="admin-modal__header">
                <h2 class="admin-modal__title">Update Exam — ${escapeHtml(exam.board)} Grade ${escapeHtml(exam.grade || '—')}</h2>
            </div>
            <div class="admin-modal__body">
                <label class="form-label">Application status</label>
                <select id="examAppStatus" class="auth__input">
                    ${['not_started', 'preparing', 'applied', 'confirmed'].map(s => `<option value="${s}" ${exam.application_status === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`).join('')}
                </select>
                <label class="form-label" style="margin-top:12px;">Readiness</label>
                <select id="examReadiness" class="auth__input">
                    ${['not_assessed', 'developing', 'ready', 'exam_ready'].map(s => `<option value="${s}" ${exam.readiness === s ? 'selected' : ''}>${s.replace('_', ' ')}</option>`).join('')}
                </select>
                <label class="form-label" style="margin-top:12px;">Result</label>
                <input id="examResult" class="auth__input" value="${escapeHtml(exam.result || '')}" placeholder="pending, pass, merit, distinction…" />
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" onclick="Admin.confirmExamUpdate('${id}')">Save</button>
            </div>
        `);
    }

    async function confirmExamUpdate(id) {
        const payload = {
            application_status: document.getElementById('examAppStatus').value,
            readiness: document.getElementById('examReadiness').value,
            result: document.getElementById('examResult').value.trim() || null,
        };
        try {
            await apiV1Call(`/learning/exams/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
            closeModalDirect();
            renderExams();
        } catch (e) { alert(e.message); }
    }

    async function showExamModal() {
        const enrollments = await apiV1Call('/portal/enrollments');
        if (!enrollments || !enrollments.length) { alert('No enrollments found — create an enrollment first.'); return; }
        const options = enrollments.map(e => `<option value="${e.id}">${escapeHtml(e.student_name)} — ${escapeHtml(e.programme_name)}</option>`).join('');
        showModal(`
            <div class="admin-modal__header">
                <h2 class="admin-modal__title">Add Exam</h2>
            </div>
            <div class="admin-modal__body">
                <label class="form-label">Enrollment</label>
                <select id="examEnrollment" class="auth__input">${options}</select>
                <label class="form-label" style="margin-top:12px;">Board</label>
                <input id="examBoard" class="auth__input" value="academy" />
                <label class="form-label" style="margin-top:12px;">Instrument</label>
                <input id="examInstrument" class="auth__input" placeholder="e.g. Piano" />
                <label class="form-label" style="margin-top:12px;">Grade</label>
                <input id="examGrade" class="auth__input" placeholder="e.g. 2" />
                <label class="form-label" style="margin-top:12px;">Submission deadline</label>
                <input id="examDeadline" type="date" class="auth__input" />
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" onclick="Admin.confirmExam()">Add Exam</button>
            </div>
        `);
    }

    async function confirmExam() {
        const enrollmentId = document.getElementById('examEnrollment').value;
        const enrollments = await apiV1Call('/portal/enrollments');
        const enrollment = (enrollments || []).find(e => e.id === enrollmentId);
        const payload = {
            student_id: enrollment ? enrollment.student_id : null,
            enrollment_id: enrollmentId,
            board: document.getElementById('examBoard').value.trim() || 'academy',
            instrument: document.getElementById('examInstrument').value.trim(),
            grade: document.getElementById('examGrade').value.trim() || null,
            submission_deadline: document.getElementById('examDeadline').value || null,
        };
        if (!payload.instrument) { alert('Instrument is required'); return; }
        try {
            await apiV1Call('/learning/exams', { method: 'POST', body: JSON.stringify(payload) });
            closeModalDirect();
            renderExams();
        } catch (e) { alert(e.message); }
    }

    async function showMilestoneModal() {
        const enrollments = await apiV1Call('/portal/enrollments');
        if (!enrollments || !enrollments.length) { alert('No enrollments found — create an enrollment first.'); return; }
        const options = enrollments.map(e => `<option value="${e.id}">${escapeHtml(e.student_name)} — ${escapeHtml(e.programme_name)}</option>`).join('');
        showModal(`
            <div class="admin-modal__header">
                <h2 class="admin-modal__title">Add Milestone</h2>
            </div>
            <div class="admin-modal__body">
                <label class="form-label">Enrollment</label>
                <select id="msEnrollment" class="auth__input">${options}</select>
                <label class="form-label" style="margin-top:12px;">Title</label>
                <input id="msTitle" class="auth__input" placeholder="e.g. First recital performance" />
                <label class="form-label" style="margin-top:12px;">Description</label>
                <textarea id="msDescription" class="auth__input auth__textarea" rows="2"></textarea>
                <label class="form-label" style="margin-top:12px;">Due date</label>
                <input id="msDue" type="date" class="auth__input" />
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" onclick="Admin.confirmMilestone()">Add Milestone</button>
            </div>
        `);
    }

    async function confirmMilestone() {
        const enrollmentId = document.getElementById('msEnrollment').value;
        const enrollments = await apiV1Call('/portal/enrollments');
        const enrollment = (enrollments || []).find(e => e.id === enrollmentId);
        const title = document.getElementById('msTitle').value.trim();
        if (!title) { alert('Title is required'); return; }
        try {
            await apiV1Call('/learning/milestones', {
                method: 'POST',
                body: JSON.stringify({
                    student_id: enrollment ? enrollment.student_id : null,
                    enrollment_id: enrollmentId,
                    title,
                    description: document.getElementById('msDescription').value.trim() || null,
                    due_date: document.getElementById('msDue').value || null,
                }),
            });
            closeModalDirect();
            renderExams();
        } catch (e) { alert(e.message); }
    }

    // ========================================
    // Assignments
    // ========================================
    async function renderAssignments() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading assignments...</div>';

        try {
            const [data, students] = await Promise.all([
                apiV1Call('/learning/assignments?limit=200'),
                apiCall('/students'),
            ]);
            const assignments = Array.isArray(data) ? data : (data.assignments || []);
            const studentMap = {};
            (students || []).forEach(s => { studentMap[s.id] = s.full_name; });

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Assignments / Quizzes</h1>
                        <p class="admin-header__subtitle">All assignments issued to students</p>
                    </div>
                    <button class="btn btn--primary" onclick="Admin.showAssignmentModal()">+ New Assignment</button>
                </div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding:0;">
                        ${assignments.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr><th>Title</th><th>Student</th><th>Assigned</th><th>Due</th><th>Status</th><th>Submission</th></tr>
                                </thead>
                                <tbody>
                                    ${assignments.map(a => `
                                        <tr>
                                            <td>${escapeHtml(a.title)}</td>
                                            <td>${escapeHtml(studentMap[a.student_id] || '—')}</td>
                                            <td>${formatDate(a.assigned_date)}</td>
                                            <td>${a.due_date ? formatDate(a.due_date) : '—'}</td>
                                            <td><span class="badge badge--${getStatusBadgeClass(a.status)}">${formatStatus(a.status)}</span></td>
                                            <td>${a.submission && a.submission.submitted_at ? formatDate(a.submission.submitted_at) : '—'}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("assignments")}</div>
                                <div class="admin-empty__title">No assignments yet</div>
                                <div class="admin-empty__text">Create the first assignment to get started</div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load assignments</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    async function showAssignmentModal() {
        const enrollments = await apiV1Call('/portal/enrollments');
        if (!enrollments || !enrollments.length) { alert('No enrollments found — create an enrollment first.'); return; }
        const options = enrollments.map(e => `<option value="${e.id}">${escapeHtml(e.student_name)} — ${escapeHtml(e.programme_name)}</option>`).join('');
        showModal(`
            <div class="admin-modal__header">
                <h2 class="admin-modal__title">Create Assignment</h2>
            </div>
            <div class="admin-modal__body">
                <label class="form-label">Enrollment</label>
                <select id="assignEnrollment" class="auth__input">${options}</select>
                <label class="form-label" style="margin-top:12px;">Title</label>
                <input id="assignTitle" class="auth__input" placeholder="e.g. Scales practice – C & G major" />
                <label class="form-label" style="margin-top:12px;">Instructions</label>
                <textarea id="assignInstructions" class="auth__input auth__textarea" rows="3"></textarea>
                <label class="form-label" style="margin-top:12px;">Due date (optional)</label>
                <input id="assignDue" type="date" class="auth__input" />
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" onclick="Admin.confirmAssignment()">Create Assignment</button>
            </div>
        `);
    }

    async function confirmAssignment() {
        const enrollmentId = document.getElementById('assignEnrollment').value;
        const title = document.getElementById('assignTitle').value.trim();
        const instructions = document.getElementById('assignInstructions').value.trim();
        const dueDate = document.getElementById('assignDue').value;
        if (!title) { alert('Title is required'); return; }
        try {
            await apiV1Call('/learning/assignments', {
                method: 'POST',
                body: JSON.stringify({
                    enrollment_id: enrollmentId,
                    title,
                    instructions: instructions || null,
                    due_date: dueDate || null,
                }),
            });
            closeModalDirect();
            renderAssignments();
        } catch (e) { alert(e.message); }
    }

    // ========================================
    // Resources (global recommendation catalogue)
    // ========================================
    const RESOURCE_TYPES = [
        { id: 'book', label: 'Books' },
        { id: 'instrument', label: 'Instruments' },
        { id: 'accessory', label: 'Accessories' },
        { id: 'stand_notebook', label: 'Stand/Notebook' },
        { id: 'metronome_tuner', label: 'Metronome/Tuner' },
        { id: 'online_link', label: 'Online Links' },
    ];

    async function renderResources() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading resources...</div>';

        try {
            const items = await apiV1Call('/learning/recommendations');

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Resource Recommendations</h1>
                        <p class="admin-header__subtitle">Global catalogue shared with all students (books, instruments, accessories, links)</p>
                    </div>
                    <button class="btn btn--primary" onclick="Admin.showResourceModal()">+ New Recommendation</button>
                </div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding:0;">
                        ${items.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr><th>Name</th><th>Type</th><th>Author / Brand</th><th>Link</th><th>Faculty Note</th></tr>
                                </thead>
                                <tbody>
                                    ${items.map(r => `
                                        <tr>
                                            <td><strong>${escapeHtml(r.name)}</strong>${r.suitability ? `<br><small>${escapeHtml(r.suitability)}</small>` : ''}</td>
                                            <td><span class="badge badge--accent">${escapeHtml(r.resource_type)}</span></td>
                                            <td>${escapeHtml(r.author_or_brand || '—')}</td>
                                            <td>${r.external_url ? `<a href="${escapeHtml(r.external_url)}" target="_blank" rel="noopener">Open</a>` : '—'}</td>
                                            <td>${escapeHtml(r.faculty_note || '—')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("resources")}</div>
                                <div class="admin-empty__title">No recommendations yet</div>
                                <div class="admin-empty__text">Add books, instruments, accessories and links to the shared catalogue</div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load resources</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    async function showResourceModal() {
        showModal(`
            <div class="admin-modal__header">
                <h2 class="admin-modal__title">New Resource Recommendation</h2>
            </div>
            <div class="admin-modal__body">
                <label class="form-label">Resource type</label>
                <select id="resType" class="auth__input">
                    ${RESOURCE_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
                </select>
                <label class="form-label" style="margin-top:12px;">Name</label>
                <input id="resName" class="auth__input" placeholder="e.g. Hanon Exercise No.1" />
                <label class="form-label" style="margin-top:12px;">Author / Brand</label>
                <input id="resAuthor" class="auth__input" />
                <label class="form-label" style="margin-top:12px;">Description</label>
                <textarea id="resDescription" class="auth__input auth__textarea" rows="2"></textarea>
                <label class="form-label" style="margin-top:12px;">Suitability</label>
                <input id="resSuitability" class="auth__input" placeholder="e.g. Beginner to Intermediate" />
                <label class="form-label" style="margin-top:12px;">External URL (optional)</label>
                <input id="resUrl" class="auth__input" placeholder="https://" />
                <label class="form-label" style="margin-top:12px;">Faculty note</label>
                <textarea id="resNote" class="auth__input auth__textarea" rows="2"></textarea>
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" onclick="Admin.confirmResource()">Add Recommendation</button>
            </div>
        `);
    }

    async function confirmResource() {
        const name = document.getElementById('resName').value.trim();
        const resourceType = document.getElementById('resType').value;
        if (!name) { alert('Name is required'); return; }
        try {
            await apiV1Call('/learning/recommendations', {
                method: 'POST',
                body: JSON.stringify({
                    resource_type: resourceType,
                    name,
                    author_or_brand: document.getElementById('resAuthor').value.trim() || null,
                    description: document.getElementById('resDescription').value.trim() || null,
                    suitability: document.getElementById('resSuitability').value.trim() || null,
                    external_url: document.getElementById('resUrl').value.trim() || null,
                    faculty_note: document.getElementById('resNote').value.trim() || null,
                }),
            });
            closeModalDirect();
            renderResources();
        } catch (e) { alert(e.message); }
    }

    // ========================================
    // Reports
    // ========================================
    async function renderReports() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading reports...</div>';

        try {
            const [data, students] = await Promise.all([
                apiV1Call('/learning/reports'),
                apiCall('/students'),
            ]);
            const reports = Array.isArray(data) ? data : (data.reports || []);
            const studentMap = {};
            (students || []).forEach(s => { studentMap[s.id] = s.full_name; });

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Monthly Reports</h1>
                        <p class="admin-header__subtitle">Draft and published reports (staff notes visible only to staff)</p>
                    </div>
                    <button class="btn btn--primary" onclick="Admin.showReportModal()">+ New Report</button>
                </div>
                <div class="admin-card">
                    <div class="admin-card__body" style="padding:0;">
                        ${reports.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr><th>Month</th><th>Student</th><th>Summary</th><th>Status</th><th>Revision</th><th>Actions</th></tr>
                                </thead>
                                <tbody>
                                    ${reports.map(r => `
                                        <tr>
                                            <td>${escapeHtml(r.report_month)}</td>
                                            <td>${escapeHtml(studentMap[r.student_id] || '—')}</td>
                                            <td>${escapeHtml((r.progress_summary || '').slice(0, 80) || '—')}</td>
                                            <td><span class="badge badge--${getStatusBadgeClass(r.status)}">${formatStatus(r.status)}</span></td>
                                            <td>${r.revision}</td>
                                            <td>
                                                ${r.status === 'draft' ? `
                                                    <button class="btn btn--primary" onclick="Admin.publishReport('${r.id}')">Publish</button>
                                                ` : (r.published_at ? formatDate(r.published_at) : '—')}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon"> ${icon("reports")}</div>
                                <div class="admin-empty__title">No reports yet</div>
                                <div class="admin-empty__text">Monthly reports created by faculty appear here</div>
                            </div>
                        `}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load reports</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    async function publishReport(id) {
        try {
            await apiV1Call(`/learning/reports/${id}/publish`, { method: 'POST', body: '{}' });
            renderReports();
        } catch (e) { alert(e.message); }
    }

    async function showReportModal() {
        const enrollments = await apiV1Call('/portal/enrollments');
        if (!enrollments || !enrollments.length) { alert('No enrollments found — create an enrollment first.'); return; }
        const options = enrollments.map(e => `<option value="${e.id}">${escapeHtml(e.student_name)} — ${escapeHtml(e.programme_name)}</option>`).join('');
        const now = new Date();
        const month = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
        showModal(`
            <div class="admin-modal__header">
                <h2 class="admin-modal__title">Create Monthly Report</h2>
            </div>
            <div class="admin-modal__body">
                <label class="form-label">Enrollment</label>
                <select id="repEnrollment" class="auth__input">${options}</select>
                <label class="form-label" style="margin-top:12px;">Report month (YYYY-MM)</label>
                <input id="repMonth" class="auth__input" value="${month}" placeholder="YYYY-MM" />
                <label class="form-label" style="margin-top:12px;">Progress summary</label>
                <textarea id="repSummary" class="auth__input auth__textarea" rows="3"></textarea>
                <label class="form-label" style="margin-top:12px;">Topics covered</label>
                <textarea id="repTopics" class="auth__input auth__textarea" rows="2"></textarea>
                <label class="form-label" style="margin-top:12px;">Private staff notes (never shown to family)</label>
                <textarea id="repStaffNotes" class="auth__input auth__textarea" rows="2"></textarea>
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" onclick="Admin.confirmReport()">Save Draft</button>
            </div>
        `);
    }

    async function confirmReport() {
        const enrollmentId = document.getElementById('repEnrollment').value;
        const enrollments = await apiV1Call('/portal/enrollments');
        const enrollment = (enrollments || []).find(e => e.id === enrollmentId);
        const reportMonth = document.getElementById('repMonth').value.trim();
        if (!reportMonth) { alert('Report month is required'); return; }
        try {
            await apiV1Call('/learning/reports', {
                method: 'POST',
                body: JSON.stringify({
                    student_id: enrollment ? enrollment.student_id : null,
                    enrollment_id: enrollmentId,
                    report_month: reportMonth,
                    progress_summary: document.getElementById('repSummary').value.trim() || null,
                    topics_covered: document.getElementById('repTopics').value.trim() || null,
                    staff_notes: document.getElementById('repStaffNotes').value.trim() || null,
                }),
            });
            closeModalDirect();
            renderReports();
        } catch (e) { alert(e.message); }
    }

    // ========================================
    // Settings (operational config + audit)
    // ========================================
    async function renderSettings() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading settings...</div>';

        try {
            const settingsData = await apiCall('/settings');
            const auditEvents = await apiCall('/audit?limit=30');

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Settings</h1>
                        <p class="admin-header__subtitle">Operational configuration and audit trail</p>
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;">
                    <div class="admin-card">
                        <div class="admin-card__body">
                            <h3 style="margin:0 0 12px;">Configuration</h3>
                            <table style="width:100%;font-size:14px;">
                                <tr><td style="padding:6px 0;color:#706B60">Timezone</td><td>${escapeHtml(settingsData.timezone)}</td></tr>
                                <tr><td style="padding:6px 0;color:#706B60">Currency</td><td>${escapeHtml(settingsData.currency)}</td></tr>
                                <tr><td style="padding:6px 0;color:#706B60">Rate limiting</td><td>${settingsData.rate_limit_enabled ? 'Enabled' : 'Disabled (dev)'}</td></tr>
                                <tr><td style="padding:6px 0;color:#706B60">Email mode</td><td>${settingsData.email_test_mode ? 'Test (Web3Forms sandbox)' : 'Live'}</td></tr>
                                <tr><td style="padding:6px 0;color:#706B60">Web3Forms configured</td><td>${settingsData.web3forms_configured ? 'Yes' : 'No'}</td></tr>
                                <tr><td style="padding:6px 0;color:#706B60">Razorpay</td><td>${settingsData.razorpay.enabled ? 'Enabled (' + escapeHtml(settingsData.razorpay.mode) + ')' : 'Disabled – manual reconciliation only'}</td></tr>
                                <tr><td style="padding:6px 0;color:#706B60">Max upload size</td><td>${settingsData.max_upload_mb} MB</td></tr>
                            </table>
                        </div>
                    </div>
                    <div class="admin-card">
                        <div class="admin-card__body">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                                <h3 style="margin:0;">Fee Packages</h3>
                                <button class="btn btn--secondary" onclick="Admin.showPackageModal()">+ Add Package</button>
                            </div>
                            <table class="admin-table">
                                <thead><tr><th>Code</th><th>Name</th><th>Classes</th><th>Fee</th><th></th></tr></thead>
                                <tbody>
                                    ${settingsData.fee_packages.map(p => `
                                        <tr>
                                            <td><code>${escapeHtml(p.code)}</code></td>
                                            <td>${escapeHtml(p.name)}${p.is_legacy ? ' <span class="badge badge--needs-info">legacy</span>' : ''}</td>
                                            <td>${p.sessions_included}</td>
                                            <td>₹${(p.fee_paise / 100).toLocaleString('en-IN')}</td>
                                            <td><button class="btn btn--secondary" onclick="Admin.showPackageModal('${escapeHtml(p.code)}')">Edit</button></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="admin-card" style="margin-top:16px;">
                    <div class="admin-card__body">
                        <h3 style="margin:0 0 12px;">Recent Audit Trail</h3>
                        ${auditEvents.length > 0 ? `
                            <table class="admin-table">
                                <thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Summary</th><th>Actor</th></tr></thead>
                                <tbody>
                                    ${auditEvents.map(a => `
                                        <tr>
                                            <td>${formatDateTime(a.created_at)}</td>
                                            <td><code>${escapeHtml(a.action)}</code></td>
                                            <td>${escapeHtml(a.entity_type)}${a.entity_id ? ' · ' + escapeHtml(a.entity_id) : ''}</td>
                                            <td>${escapeHtml(a.summary || '')}</td>
                                            <td>${escapeHtml(a.actor_email || a.actor_role || 'system')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<div class="admin-empty"><div class="admin-empty__title">No audit events recorded yet</div></div>'}
                    </div>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load settings</div>
                    <div class="admin-empty__text">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    async function showPackageModal(code) {
        let pkg = null;
        if (code) {
            const settingsData = await apiCall('/settings');
            pkg = (settingsData.fee_packages || []).find(p => p.code === code) || null;
        }
        showModal(`
            <div class="admin-modal__header">
                <h2 class="admin-modal__title">${code ? 'Edit' : 'Add'} Fee Package</h2>
            </div>
            <div class="admin-modal__body">
                <label class="form-label">Code</label>
                <input id="pkgCode" class="auth__input" value="${code ? escapeHtml(code) : ''}" ${code ? 'readonly' : ''} placeholder="e.g. standard_4" />
                <label class="form-label" style="margin-top:12px;">Name</label>
                <input id="pkgName" class="auth__input" value="${pkg ? escapeHtml(pkg.name) : ''}" />
                <label class="form-label" style="margin-top:12px;">Sessions included</label>
                <input id="pkgSessions" type="number" class="auth__input" value="${pkg ? pkg.sessions_included : 4}" min="1" />
                <label class="form-label" style="margin-top:12px;">Fee (paise)</label>
                <input id="pkgFee" type="number" class="auth__input" value="${pkg ? pkg.fee_paise : 450000}" min="1" />
                <label class="form-label" style="margin-top:12px;">Session duration (minutes)</label>
                <input id="pkgDuration" type="number" class="auth__input" value="${pkg ? pkg.session_duration_minutes : 60}" min="15" />
                <label style="display:flex;gap:8px;align-items:center;margin-top:12px;">
                    <input id="pkgLegacy" type="checkbox" ${pkg && pkg.is_legacy ? 'checked' : ''} />
                    <span>Legacy (individually agreed rate)</span>
                </label>
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" onclick="Admin.confirmPackage()">Save Package</button>
            </div>
        `);
    }

    async function confirmPackage() {
        const code = document.getElementById('pkgCode').value.trim();
        const name = document.getElementById('pkgName').value.trim();
        const sessionsIncluded = parseInt(document.getElementById('pkgSessions').value, 10);
        const feePaise = parseInt(document.getElementById('pkgFee').value, 10);
        const duration = parseInt(document.getElementById('pkgDuration').value, 10);
        const isLegacy = document.getElementById('pkgLegacy').checked;
        if (!code || !name) { alert('Code and name are required'); return; }
        try {
            await apiV1Call('/billing/packages', {
                method: 'POST',
                body: JSON.stringify({
                    code, name,
                    sessions_included: sessionsIncluded,
                    fee_paise: feePaise,
                    session_duration_minutes: duration,
                    is_legacy: isLegacy,
                }),
            });
            closeModalDirect();
            renderSettings();
        } catch (e) { alert(e.message); }
    }

    // ========================================
    // Student Profile Workspace
    // ========================================
    let studentWs = {
        active: false,
        studentId: null,
        student: null,
        activeTab: 'overview',
        loading: false,
        error: null,
        data: {},
        remarkEditingId: null,
    };

    const WS_TABS = [
        { id: 'overview', label: 'Overview' },
        { id: 'profile', label: 'Profile & Enrollments' },
        { id: 'classes', label: 'Classes & Rescheduling' },
        { id: 'homework', label: 'Homework & Materials' },
        { id: 'remarks', label: 'Remarks' },
        { id: 'progress', label: 'Progress & Syllabus' },
        { id: 'reports', label: 'Monthly Reports' },
        { id: 'exams', label: 'Exams & Milestones' },
        { id: 'fees', label: 'Fees & Invoices' },
        { id: 'audit', label: 'Audit History' },
    ];

    async function openStudentWorkspace(studentId) {
        studentWs.active = true;
        studentWs.studentId = studentId;
        studentWs.student = null;
        studentWs.activeTab = 'overview';
        studentWs.data = {};
        studentWs.loading = true;
        studentWs.error = null;
        render();
        try {
            studentWs.student = await apiCall(`/students/${studentId}`);
        } catch (e) {
            studentWs.error = e.message;
        }
        studentWs.loading = false;
        render();
    }

    function closeStudentWorkspace() {
        studentWs.active = false;
        studentWs.studentId = null;
        studentWs.student = null;
        studentWs.data = {};
        render();
    }

    async function setWsTab(tab) {
        studentWs.activeTab = tab;
        studentWs.remarkEditingId = null;
        render();
        if (!studentWs.data[tab]) {
            await loadWsTab(tab);
        }
    }

    async function loadWsTab(tab) {
        const sid = studentWs.studentId;
        try {
            switch (tab) {
                case 'classes':
                    studentWs.data.classes = await apiV1Call(`/sessions?student_id=${sid}`);
                    break;
                case 'homework': {
                    const [assignments, materials] = await Promise.all([
                        apiV1Call(`/learning/assignments?student_id=${sid}`),
                        apiV1Call(`/learning/materials?student_id=${sid}`),
                    ]);
                    studentWs.data.homework = { assignments: assignments || [], materials: materials || [] };
                    break;
                }
                case 'remarks':
                    studentWs.data.remarks = await apiV1Call(`/remarks?student_id=${sid}&include_staff_only=true`);
                    break;
                case 'progress':
                    studentWs.data.progress = await apiV1Call(`/learning/syllabus-progress?student_id=${sid}`);
                    break;
                case 'reports':
                    studentWs.data.reports = await apiV1Call(`/learning/reports?student_id=${sid}`);
                    break;
                case 'exams': {
                    const [exams, milestones] = await Promise.all([
                        apiV1Call(`/learning/exams?student_id=${sid}`),
                        apiV1Call(`/learning/milestones?student_id=${sid}`),
                    ]);
                    studentWs.data.exams = { exams: exams || [], milestones: milestones || [] };
                    break;
                }
                case 'fees': {
                    const [invoices, ledger] = await Promise.all([
                        apiV1Call(`/billing/invoices?student_id=${sid}`),
                        apiV1Call(`/billing/ledger?student_id=${sid}`),
                    ]);
                    studentWs.data.fees = { invoices: invoices || [], ledger: ledger || { entries: [], outstanding_paise: 0 } };
                    break;
                }
                case 'audit':
                    studentWs.data.audit = await apiCall(`/audit?limit=100`);
                    break;
            }
        } catch (e) {
            console.error('WS tab load error', tab, e);
        }
        render();
    }

    function renderStudentWorkspace() {
        const container = document.getElementById('adminContent');
        const s = studentWs.student;
        if (studentWs.loading) {
            container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading student profile...</div>';
            return;
        }
        if (studentWs.error || !s) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon"> ${icon("warn")}</div>
                    <div class="admin-empty__title">Unable to load student</div>
                    <div class="admin-empty__text">${studentWs.error || 'Not found'}</div>
                    <button class="btn btn--secondary" onclick="Admin.closeStudentWorkspace()">Back to Students</button>
                </div>`;
            return;
        }

        const tabsHtml = WS_TABS.map(t => `
            <button class="ws-tab ${studentWs.activeTab === t.id ? 'ws-tab--active' : ''}"
                    onclick="Admin.setWsTab('${t.id}')">${t.label}</button>
        `).join('');

        container.innerHTML = `
            <div class="admin-header">
                <div>
                    <button class="btn btn--secondary btn--sm" onclick="Admin.closeStudentWorkspace()" style="margin-bottom:8px;">← Back to Students</button>
                    <h1 class="admin-header__title">${escapeHtml(s.full_name)}</h1>
                    <p class="admin-header__subtitle">${s.cma_registration_id} · ${formatStatus(s.status)} · Age ${calculateAge(s.date_of_birth)}</p>
                </div>
            </div>
            <div class="ws-tabs">${tabsHtml}</div>
            <div class="admin-card"><div class="admin-card__body" id="wsTabContent">
                <div class="admin-loading"><div class="admin-loading__spinner"></div>Loading...</div>
            </div></div>
        `;

        renderWsTabContent();
    }

    function renderWsTabContent() {
        const el = document.getElementById('wsTabContent');
        if (!el) return;
        const tab = studentWs.activeTab;
        const s = studentWs.student;
        const data = studentWs.data[tab];

        if (tab === 'overview') {
            const enrollments = (s.enrollments || []);
            const guardians = (s.guardians || []);
            el.innerHTML = `
                <div class="ws-grid">
                    <div class="ws-stat"><div class="ws-stat__label">Full Name</div><div class="ws-stat__value">${escapeHtml(s.full_name)}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">CMA ID</div><div class="ws-stat__value">${s.cma_registration_id}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Status</div><div class="ws-stat__value"><span class="badge badge--${s.status}">${formatStatus(s.status)}</span></div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Skill Level</div><div class="ws-stat__value">${s.skill_level || '-'}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Phone</div><div class="ws-stat__value">${s.phone || '-'}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Date of Birth</div><div class="ws-stat__value">${formatDate(s.date_of_birth)}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Enrollments</div><div class="ws-stat__value">${enrollments.length}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Guardians</div><div class="ws-stat__value">${guardians.length}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Registered</div><div class="ws-stat__value">${formatDate(s.created_at)}</div></div>
                </div>
            `;
            return;
        }

        if (tab === 'profile') {
            const enrollments = (s.enrollments || []);
            const guardians = (s.guardians || []);
            el.innerHTML = `
                <h3 style="margin-bottom:12px;">Personal Information</h3>
                <div class="ws-grid" style="margin-bottom:24px;">
                    <div class="ws-stat"><div class="ws-stat__label">First Name</div><div class="ws-stat__value">${escapeHtml(s.first_name)}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Last Name</div><div class="ws-stat__value">${escapeHtml(s.last_name)}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Phone</div><div class="ws-stat__value">${s.phone || '-'}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Address</div><div class="ws-stat__value">${escapeHtml(s.address) || '-'}</div></div>
                    <div class="ws-stat"><div class="ws-stat__label">Profile Complete</div><div class="ws-stat__value">${s.profile_complete ? 'Yes' : 'No'}</div></div>
                </div>
                <h3 style="margin-bottom:12px;">Enrollments</h3>
                ${enrollments.length ? `<table class="admin-table"><thead><tr><th>Programme</th><th>Fee Plan</th><th>Status</th><th>Start</th></tr></thead><tbody>
                    ${enrollments.map(e => `<tr><td>${escapeHtml(e.programme_name)}</td><td>${e.fee_plan || '-'}</td><td><span class="badge badge--${e.status}">${e.status}</span></td><td>${formatDate(e.start_date)}</td></tr>`).join('')}
                </tbody></table>` : '<p class="admin-empty__text">No enrollments</p>'}
                <h3 style="margin:24px 0 12px;">Guardians</h3>
                ${guardians.length ? `<table class="admin-table"><thead><tr><th>Name</th><th>Relationship</th><th>Phone</th><th>Email</th></tr></thead><tbody>
                    ${guardians.map(g => `<tr><td>${escapeHtml(g.first_name)} ${escapeHtml(g.last_name)}</td><td>${escapeHtml(g.relationship)}</td><td>${g.phone || '-'}</td><td>${g.email || '-'}</td></tr>`).join('')}
                </tbody></table>` : '<p class="admin-empty__text">No guardians on file</p>'}
            `;
            return;
        }

        if (!data && tab !== 'overview' && tab !== 'profile') {
            el.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading tab data...</div>';
            loadWsTab(tab);
            return;
        }

        switch (tab) {
            case 'classes': renderWsClasses(el, data || []); break;
            case 'homework': renderWsHomework(el, data); break;
            case 'remarks': renderWsRemarks(el, data || []); break;
            case 'progress': renderWsProgress(el, data || []); break;
            case 'reports': renderWsReports(el, data || []); break;
            case 'exams': renderWsExams(el, data); break;
            case 'fees': renderWsFees(el, data); break;
            case 'audit': renderWsAudit(el, data || []); break;
        }
    }

    function renderWsClasses(el, sessions) {
        if (!sessions.length) { el.innerHTML = '<div class="admin-empty__text">No sessions for this student</div>'; return; }
        el.innerHTML = `
            <table class="admin-table"><thead><tr><th>Date</th><th>Time</th><th>Status</th><th>Topics</th><th>Remarks</th></tr></thead>
            <tbody>${sessions.map(s => `
                <tr>
                    <td>${formatDate(s.scheduled_date)}</td>
                    <td>${s.scheduled_start}–${s.scheduled_end}</td>
                    <td><span class="badge badge--${getStatusBadgeClass(s.status)}">${formatStatus(s.status)}</span></td>
                    <td>${escapeHtml(s.topics_covered) || '-'}</td>
                    <td>${escapeHtml(s.faculty_remarks) || '-'}</td>
                </tr>`).join('')}
            </tbody></table>`;
    }

    function renderWsHomework(el, data) {
        const assignments = data.assignments || [];
        const materials = data.materials || [];
        el.innerHTML = `
            <h3 style="margin-bottom:12px;">Assignments</h3>
            ${assignments.length ? `<table class="admin-table"><thead><tr><th>Title</th><th>Due</th><th>Priority</th><th>Status</th><th>Submission</th></tr></thead><tbody>
                ${assignments.map(a => `<tr>
                    <td>${escapeHtml(a.title)}</td>
                    <td>${formatDate(a.due_date)}</td>
                    <td>${a.priority || '-'}</td>
                    <td><span class="badge badge--${a.status}">${a.status}</span></td>
                    <td>${a.submission ? formatDate(a.submission.submitted_at) : '—'}</td>
                </tr>`).join('')}
            </tbody></table>` : '<p class="admin-empty__text">No assignments</p>'}
            <h3 style="margin:24px 0 12px;">Study Materials</h3>
            ${materials.length ? `<table class="admin-table"><thead><tr><th>Title</th><th>Category</th><th>Type</th></tr></thead><tbody>
                ${materials.map(m => `<tr><td>${escapeHtml(m.title)}</td><td>${m.category || '-'}</td><td>${m.material_type || '-'}</td></tr>`).join('')}
            </tbody></table>` : '<p class="admin-empty__text">No materials assigned</p>'}
        `;
    }

    function renderWsRemarks(el, remarks) {
        el.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3>Remarks (${remarks.length})</h3>
                <button class="btn btn--primary btn--sm" onclick="Admin.showRemarkModal()">+ Add Remark</button>
            </div>
            ${remarks.length ? remarks.map(r => `
                <div class="ws-remark ${r.visibility === 'staff_only' ? 'ws-remark--staff' : ''}">
                    <div class="ws-remark__meta">
                        <span class="badge badge--${r.visibility === 'staff_only' ? 'rejected' : r.visibility === 'parent_visible' ? 'accent' : 'approved'}">${formatStatus(r.visibility)}</span>
                        <span style="color:#706B60;font-size:12px;">${r.author_role} · ${formatDateTime(r.created_at)}${r.updated_at && r.updated_at !== r.created_at ? ' · edited ' + formatDateTime(r.updated_at) : ''}</span>
                    </div>
                    <div class="ws-remark__body">${escapeHtml(r.body)}</div>
                    <div class="ws-remark__actions">
                        <button class="btn btn--secondary btn--sm" onclick="Admin.showRemarkModal('${r.id}')">Edit</button>
                        <button class="btn btn--secondary btn--sm" onclick="Admin.showRemarkHistory('${r.id}')">History</button>
                    </div>
                </div>
            `).join('') : '<p class="admin-empty__text">No remarks yet</p>'}
        `;
    }

    async function showRemarkModal(remarkId) {
        const sid = studentWs.studentId;
        let existing = null;
        if (remarkId) {
            const list = studentWs.data.remarks || [];
            existing = list.find(r => r.id === remarkId);
        }
        studentWs.remarkEditingId = remarkId || null;
        showModal(`
            <div class="admin-modal__header">
                <h2 class="admin-modal__title">${existing ? 'Edit Remark' : 'Add Remark'}</h2>
            </div>
            <div class="admin-modal__body">
                <label class="form-label">Visibility</label>
                <select id="rmkVisibility" class="auth__input">
                    <option value="student_visible" ${existing && existing.visibility === 'student_visible' ? 'selected' : (!existing ? 'selected' : '')}>Student visible</option>
                    <option value="parent_visible" ${existing && existing.visibility === 'parent_visible' ? 'selected' : ''}>Parent visible</option>
                    <option value="staff_only" ${existing && existing.visibility === 'staff_only' ? 'selected' : ''}>Staff only (never shown to family)</option>
                </select>
                <label class="form-label" style="margin-top:12px;">Remark</label>
                <textarea id="rmkBody" class="auth__input auth__textarea" rows="4" maxlength="5000" placeholder="Enter remark...">${existing ? escapeHtml(existing.body) : ''}</textarea>
                <div id="rmkError" style="color:#E84141;font-size:13px;margin-top:8px;"></div>
            </div>
            <div class="admin-modal__footer">
                <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Cancel</button>
                <button class="btn btn--primary" onclick="Admin.confirmRemark()">${existing ? 'Save Changes' : 'Create Remark'}</button>
            </div>
        `);
    }

    async function confirmRemark() {
        const sid = studentWs.studentId;
        const visibility = document.getElementById('rmkVisibility').value;
        const body = document.getElementById('rmkBody').value.trim();
        const errEl = document.getElementById('rmkError');
        if (!body) { errEl.textContent = 'Remark body is required'; return; }
        if (body.length > 5000) { errEl.textContent = 'Remark too long (max 5000 characters)'; return; }
        try {
            if (studentWs.remarkEditingId) {
                await apiV1Call(`/remarks/${studentWs.remarkEditingId}`, {
                    method: 'PATCH',
                    body: JSON.stringify({ visibility, body }),
                });
            } else {
                await apiV1Call('/remarks', {
                    method: 'POST',
                    body: JSON.stringify({ student_id: sid, visibility, body }),
                });
            }
            closeModalDirect();
            studentWs.data.remarks = await apiV1Call(`/remarks?student_id=${sid}&include_staff_only=true`);
            renderWsTabContent();
        } catch (e) {
            errEl.textContent = e.message;
        }
    }

    async function showRemarkHistory(remarkId) {
        try {
            const history = await apiV1Call(`/remarks/${remarkId}/history`);
            showModal(`
                <div class="admin-modal__header">
                    <h2 class="admin-modal__title">Remark Audit History</h2>
                </div>
                <div class="admin-modal__body">
                    ${(history || []).length ? history.map(h => `
                        <div style="border-left:3px solid #B58A35;padding-left:12px;margin-bottom:16px;">
                            <div style="font-weight:600;">${h.action}</div>
                            <div style="font-size:12px;color:#706B60;">${h.actor_role} · ${formatDateTime(h.created_at)}</div>
                            ${h.summary ? `<div style="font-size:13px;margin-top:4px;">${escapeHtml(h.summary)}</div>` : ''}
                            ${h.after_data && h.after_data.body ? `<div style="font-size:13px;margin-top:4px;color:#706B60;">“${escapeHtml(h.after_data.body).substring(0, 120)}${h.after_data.body.length > 120 ? '…' : ''}”</div>` : ''}
                        </div>
                    `).join('') : '<p class="admin-empty__text">No history entries</p>'}
                </div>
                <div class="admin-modal__footer">
                    <button class="btn btn--secondary" onclick="Admin.closeModalDirect()">Close</button>
                </div>
            `);
        } catch (e) { alert(e.message); }
    }

    function renderWsProgress(el, items) {
        if (!items.length) { el.innerHTML = '<div class="admin-empty__text">No syllabus progress recorded</div>'; return; }
        el.innerHTML = `
            <table class="admin-table"><thead><tr><th>Syllabus</th><th>Item</th><th>Status</th><th>Faculty Notes</th><th>Updated</th></tr></thead>
            <tbody>${items.map(p => `
                <tr>
                    <td>${escapeHtml(p.syllabus_title || '-')}</td>
                    <td>${escapeHtml(p.item_title || p.item_id)}</td>
                    <td><span class="badge badge--${getStatusBadgeClass(p.status)}">${formatStatus(p.status)}</span></td>
                    <td>${escapeHtml(p.faculty_notes) || '-'}</td>
                    <td>${formatDateTime(p.updated_at)}</td>
                </tr>`).join('')}
            </tbody></table>`;
    }

    function renderWsReports(el, reports) {
        if (!reports.length) { el.innerHTML = '<div class="admin-empty__text">No reports</div>'; return; }
        el.innerHTML = `
            <table class="admin-table"><thead><tr><th>Month</th><th>Rev</th><th>Status</th><th>Progress Summary</th><th>Published</th></tr></thead>
            <tbody>${reports.map(r => `
                <tr>
                    <td>${r.report_month}</td>
                    <td>${r.revision}</td>
                    <td><span class="badge badge--${r.status === 'published' ? 'approved' : 'pending'}">${r.status}</span></td>
                    <td>${escapeHtml(r.progress_summary) || '-'}</td>
                    <td>${r.published_at ? formatDateTime(r.published_at) : '—'}</td>
                </tr>`).join('')}
            </tbody></table>`;
    }

    function renderWsExams(el, data) {
        const exams = data.exams || [];
        const milestones = data.milestones || [];
        el.innerHTML = `
            <h3 style="margin-bottom:12px;">Exams</h3>
            ${exams.length ? `<table class="admin-table"><thead><tr><th>Board</th><th>Instrument</th><th>Grade</th><th>Application</th><th>Readiness</th><th>Result</th></tr></thead><tbody>
                ${exams.map(x => `<tr>
                    <td>${escapeHtml(x.board)}</td><td>${escapeHtml(x.instrument)}</td><td>${x.grade || '-'}</td>
                    <td><span class="badge badge--${x.application_status}">${x.application_status}</span></td>
                    <td>${x.readiness || '-'}</td><td>${x.result || '-'}</td>
                </tr>`).join('')}
            </tbody></table>` : '<p class="admin-empty__text">No exams</p>'}
            <h3 style="margin:24px 0 12px;">Milestones</h3>
            ${milestones.length ? `<table class="admin-table"><thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Due</th><th>Achieved</th></tr></thead><tbody>
                ${milestones.map(m => `<tr>
                    <td>${escapeHtml(m.title)}</td><td>${m.milestone_type || '-'}</td>
                    <td><span class="badge badge--${m.status === 'achieved' ? 'approved' : 'pending'}">${m.status}</span></td>
                    <td>${formatDate(m.due_date)}</td><td>${m.achieved_at ? formatDateTime(m.achieved_at) : '—'}</td>
                </tr>`).join('')}
            </tbody></table>` : '<p class="admin-empty__text">No milestones</p>'}
        `;
    }

    function renderWsFees(el, data) {
        const invoices = data.invoices || [];
        const outstanding = data.ledger ? data.ledger.outstanding_paise : 0;
        el.innerHTML = `
            <div class="ws-grid" style="margin-bottom:16px;">
                <div class="ws-stat"><div class="ws-stat__label">Outstanding</div><div class="ws-stat__value">₹${(outstanding / 100).toFixed(0)}</div></div>
                <div class="ws-stat"><div class="ws-stat__label">Invoices</div><div class="ws-stat__value">${invoices.length}</div></div>
            </div>
            ${invoices.length ? `<table class="admin-table"><thead><tr><th>Invoice #</th><th>Month</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead><tbody>
                ${invoices.map(i => `<tr>
                    <td>${i.invoice_number}</td><td>${i.billing_month}</td>
                    <td>₹${(i.amount_paise / 100).toFixed(0)}</td><td>₹${(i.amount_paid_paise / 100).toFixed(0)}</td>
                    <td><span class="badge badge--${i.status === 'paid' ? 'approved' : i.status === 'partially_paid' ? 'needs-info' : 'pending'}">${i.status}</span></td>
                </tr>`).join('')}
            </tbody></table>` : '<p class="admin-empty__text">No invoices</p>'}
        `;
    }

    function renderWsAudit(el, events) {
        if (!events.length) { el.innerHTML = '<div class="admin-empty__text">No audit events</div>'; return; }
        el.innerHTML = `
            <table class="admin-table"><thead><tr><th>When</th><th>Action</th><th>Entity</th><th>Actor</th><th>Summary</th></tr></thead>
            <tbody>${events.slice(0, 100).map(e => `
                <tr>
                    <td>${formatDateTime(e.created_at)}</td>
                    <td>${e.action}</td>
                    <td>${e.entity_type}</td>
                    <td>${e.actor_email || e.actor_role || '-'}</td>
                    <td>${escapeHtml(e.summary) || '-'}</td>
                </tr>`).join('')}
            </tbody></table>`;
    }

    // ========================================
    // Utility Functions
    // ========================================
    function formatStatus(status) {
        const map = {
            'pending_email_verification': 'Pending Email Verification',
            'email_verified': 'Email Verified',
            'pending_review': 'Pending Approval',
            'needs_information': 'Needs Information',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'active': 'Active',
            'inactive': 'Inactive',
            'paid': 'Paid',
            'pending': 'Pending',
            'partial': 'Partially Paid',
            'scheduled': 'Scheduled',
            'completed': 'Completed',
            'rescheduling_required': 'Reschedule Pending',
            'cancelled': 'Cancelled',
            'waiting_payment': 'Waiting for Payment',
            'upcoming': 'Upcoming',
            'achieved': 'Achieved',
            'not_assessed': 'Not Assessed',
            'developing': 'Developing',
            'ready': 'Ready',
            'exam_ready': 'Exam Ready',
            'not_started': 'Not Started',
            'preparing': 'Preparing',
            'applied': 'Applied',
            'confirmed': 'Confirmed',
            'book': 'Book',
            'instrument': 'Instrument',
            'accessory': 'Accessory',
            'stand_notebook': 'Stand / Notebook',
            'metronome_tuner': 'Metronome / Tuner',
            'online_link': 'Online Link',
        };
        return map[status] || status;
    }

    function getStatusBadgeClass(status) {
        const map = {
            'pending_email_verification': 'pending',
            'email_verified': 'accent',
            'pending_review': 'pending',
            'needs_information': 'needs-info',
            'approved': 'approved',
            'rejected': 'rejected',
            'active': 'active',
            'inactive': 'inactive',
            'paid': 'paid',
            'completed': 'approved',
            'scheduled': 'accent',
            'rescheduling_required': 'rejected',
            'cancelled': 'inactive',
            'partial': 'needs-info',
            'pending': 'pending',
            'upcoming': 'pending',
            'achieved': 'approved',
            'not_assessed': 'pending',
            'developing': 'needs-info',
            'ready': 'accent',
            'exam_ready': 'approved',
            'not_started': 'pending',
            'preparing': 'needs-info',
            'applied': 'accent',
            'confirmed': 'approved',
        };
        return map[status] || 'pending';
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function calculateAge(dob) {
        if (!dob) return '-';
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ========================================
    // Render
    // ========================================
    function render() {
        const layout = document.getElementById('adminLayout');
        if (!layout) return;

        layout.innerHTML = `
            ${renderSidebar()}
            <main class="admin-main" id="adminContent"></main>
            <button class="admin-sidebar__toggle" id="adminSidebarToggle" aria-label="Toggle navigation">${icon("menu")}</button>
        `;

        bindSidebarEvents();

        switch (currentSection) {
            case 'dashboard': renderDashboard(); break;
            case 'registrations':
                if (regState.currentView === 'detail' && regState.selectedRequest) {
                    renderRegDetail();
                } else {
                    loadRegistrations();
                }
                break;
            case 'students': renderStudents(); break;
            case 'enrollments': renderEnrollments(); break;
            case 'instructors': renderInstructors(); break;
            case 'classes': renderClasses(); break;
            case 'fees': renderFees(); break;
            case 'attendance': renderAttendance(); break;
            case 'progress': renderProgress(); break;
            case 'exams': renderExams(); break;
            case 'assignments': renderAssignments(); break;
            case 'resources': renderResources(); break;
            case 'reports': renderReports(); break;
            case 'settings': renderSettings(); break;
            default: renderDashboard();
        }
    }

    // ========================================
    // Public API
    // ========================================
    return {
        init() {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') closeModalDirect();
            });
            render();
        },
        navigateTo(section) {
            navigateTo(section);
        },
        viewRegistration(id) {
            viewRegistration(id);
        },
        loadRegistrations() {
            loadRegistrations();
        },
        backToList() {
            backToList();
        },
        filterByStatus(status) {
            filterByStatus(status);
        },
        clearRegFilters() {
            clearRegFilters();
        },
        showApproveModal(id) {
            showApproveModal(id);
        },
        confirmApprove(id) {
            confirmApprove(id);
        },
        showRejectModal(id) {
            showRejectModal(id);
        },
        confirmReject(id) {
            confirmReject(id);
        },
        showRequestInfoModal(id) {
            showRequestInfoModal(id);
        },
        filterClasses(status) {
            filterClasses(status);
        },
        filterFees(status) {
            filterFees(status);
        },
        selectAttendanceStudent(id) {
            selectAttendanceStudent(id);
        },
        showExamModal() {
            showExamModal();
        },
        confirmExam() {
            confirmExam();
        },
        editExam(id) {
            editExam(id);
        },
        confirmExamUpdate(id) {
            confirmExamUpdate(id);
        },
        showMilestoneModal() {
            showMilestoneModal();
        },
        confirmMilestone() {
            confirmMilestone();
        },
        showAssignmentModal() {
            showAssignmentModal();
        },
        confirmAssignment() {
            confirmAssignment();
        },
        showResourceModal() {
            showResourceModal();
        },
        confirmResource() {
            confirmResource();
        },
        showReportModal() {
            showReportModal();
        },
        confirmReport() {
            confirmReport();
        },
        publishReport(id) {
            publishReport(id);
        },
        showPackageModal(code) {
            showPackageModal(code);
        },
        confirmPackage() {
            confirmPackage();
        },
        confirmRequestInfo(id) {
            confirmRequestInfo(id);
        },
        openStudentWorkspace(id) {
            openStudentWorkspace(id);
        },
        closeStudentWorkspace() {
            closeStudentWorkspace();
        },
        setWsTab(tab) {
            setWsTab(tab);
        },
        showRemarkModal(id) {
            showRemarkModal(id);
        },
        confirmRemark() {
            confirmRemark();
        },
        showRemarkHistory(id) {
            showRemarkHistory(id);
        },
        closeModal(e) {
            closeModal(e);
        },
        closeModalDirect() {
            closeModalDirect();
        },
    };
})();
