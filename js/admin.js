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

    // ========================================
    // Navigation
    // ========================================
    const NAV_ITEMS = [
        { section: 'dashboard', label: 'Dashboard', icon: '📊' },
        { section: 'registrations', label: 'Registration Requests', icon: '📋', badge: 'pending' },
        { section: 'students', label: 'Students', icon: '🎓' },
        { section: 'enrollments', label: 'Enrollments', icon: '📚' },
        { divider: true },
        { section: 'instructors', label: 'Instructors', icon: '👨‍🏫' },
        { section: 'classes', label: 'Classes / Schedules', icon: '📅' },
        { section: 'fees', label: 'Fees & Payments', icon: '💰' },
        { section: 'attendance', label: 'Attendance', icon: '✅' },
        { section: 'progress', label: 'Progress', icon: '📈' },
        { divider: true },
        { section: 'exams', label: 'Exams / Certifications', icon: '🏅' },
        { section: 'assignments', label: 'Assignments / Quizzes', icon: '📝' },
        { section: 'resources', label: 'Resources', icon: '📁' },
        { section: 'reports', label: 'Reports', icon: '📉' },
        { divider: true },
        { section: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    function renderSidebar() {
        const pendingBadge = NAV_ITEMS.find(n => n.section === 'registrations');
        
        return `
            <aside class="admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}" id="adminSidebar">
                <div class="admin-sidebar__section">
                    <div class="admin-sidebar__label">Main</div>
                    ${NAV_ITEMS.slice(0, 4).map(item => {
                        if (item.divider) return '';
                        return `
                            <a href="#" class="admin-sidebar__link ${currentSection === item.section ? 'admin-sidebar__link--active' : ''}" 
                               data-section="${item.section}">
                                <span class="admin-sidebar__icon">${item.icon}</span>
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
                                <span class="admin-sidebar__icon">${item.icon}</span>
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
                                <span class="admin-sidebar__icon">${item.icon}</span>
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
                                <span class="admin-sidebar__icon">${item.icon}</span>
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
        currentSection = section;
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
                        <div class="admin-stat__icon">🎓</div>
                        <div class="admin-stat__value">${stats.total_students}</div>
                        <div class="admin-stat__label">Total Students</div>
                    </div>
                    <div class="admin-stat admin-stat--warning">
                        <div class="admin-stat__icon">📋</div>
                        <div class="admin-stat__value">${stats.pending_registrations}</div>
                        <div class="admin-stat__label">Pending Registrations</div>
                    </div>
                    <div class="admin-stat admin-stat--success">
                        <div class="admin-stat__icon">📚</div>
                        <div class="admin-stat__value">${stats.active_enrollments}</div>
                        <div class="admin-stat__label">Active Enrollments</div>
                    </div>
                    <div class="admin-stat">
                        <div class="admin-stat__icon">💰</div>
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
                                            <td><span class="badge badge--${r.status.replace('_', '-')}">${formatStatus(r.status)}</span></td>
                                            <td>${formatDate(r.submitted_at)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon">📋</div>
                                <div class="admin-empty__title">No registrations yet</div>
                                <div class="admin-empty__text">Registration requests will appear here</div>
                            </div>
                        `}
                    </div>
                </div>
            `;

            // Bind "View All" link
            container.querySelector('[data-section="registrations"]')?.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('registrations');
            });

            // Update pending badge
            const badge = document.getElementById('pendingBadge');
            if (badge) badge.textContent = stats.pending_registrations;

        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon">⚠️</div>
                    <div class="admin-empty__title">Unable to load dashboard</div>
                    <div class="admin-empty__text">Please check your connection and try again</div>
                </div>
            `;
        }
    }

    // ========================================
    // Registration Requests
    // ========================================
    let regFilter = 'all';

    async function renderRegistrations() {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading registrations...</div>';

        try {
            const statusParam = regFilter === 'all' ? '' : `?status=${regFilter}`;
            const requests = await apiCall(`/registration-requests${statusParam}`);

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Registration Requests</h1>
                        <p class="admin-header__subtitle">Review and manage incoming registrations</p>
                    </div>
                </div>

                <div class="admin-filters">
                    <button class="admin-filter ${regFilter === 'all' ? 'admin-filter--active' : ''}" data-filter="all">All</button>
                    <button class="admin-filter ${regFilter === 'pending_review' ? 'admin-filter--active' : ''}" data-filter="pending_review">Pending Review</button>
                    <button class="admin-filter ${regFilter === 'approved' ? 'admin-filter--active' : ''}" data-filter="approved">Approved</button>
                    <button class="admin-filter ${regFilter === 'rejected' ? 'admin-filter--active' : ''}" data-filter="rejected">Rejected</button>
                    <button class="admin-filter ${regFilter === 'needs_information' ? 'admin-filter--active' : ''}" data-filter="needs_information">Needs Info</button>
                </div>

                <div class="admin-card">
                    <div class="admin-card__body" style="padding: 0;">
                        ${requests.length > 0 ? `
                            <table class="admin-table">
                                <thead>
                                    <tr>
                                        <th>Request ID</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Mobile</th>
                                        <th>Programmes</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${requests.map(r => `
                                        <tr>
                                            <td><strong>${r.request_id}</strong></td>
                                            <td>${r.full_name}</td>
                                            <td>${r.email}</td>
                                            <td>${r.mobile}</td>
                                            <td>${(r.selected_programmes || []).map(p => p.name).join(', ')}</td>
                                            <td><span class="badge badge--${r.status.replace('_', '-')}">${formatStatus(r.status)}</span></td>
                                            <td>${formatDate(r.submitted_at)}</td>
                                            <td>
                                                <button class="btn btn--secondary" onclick="Admin.viewRegistration('${r.id}')">View</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon">📋</div>
                                <div class="admin-empty__title">No registration requests</div>
                                <div class="admin-empty__text">Requests will appear here when students register</div>
                            </div>
                        `}
                    </div>
                </div>
            `;

            // Bind filter buttons
            container.querySelectorAll('.admin-filter').forEach(btn => {
                btn.addEventListener('click', () => {
                    regFilter = btn.dataset.filter;
                    renderRegistrations();
                });
            });

        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon">⚠️</div>
                    <div class="admin-empty__title">Unable to load registrations</div>
                    <div class="admin-empty__text">${error.message}</div>
                </div>
            `;
        }
    }

    async function viewRegistration(id) {
        const container = document.getElementById('adminContent');
        container.innerHTML = '<div class="admin-loading"><div class="admin-loading__spinner"></div>Loading details...</div>';

        try {
            const req = await apiCall(`/registration-requests/${id}`);

            container.innerHTML = `
                <div class="admin-header">
                    <div>
                        <h1 class="admin-header__title">Registration Request</h1>
                        <p class="admin-header__subtitle">${req.request_id}</p>
                    </div>
                    <button class="btn btn--secondary" onclick="Admin.navigateTo('registrations')">← Back to List</button>
                </div>

                <div class="admin-detail">
                    <div class="admin-detail__header">
                        <div>
                            <h2 class="admin-detail__title">${req.full_name}</h2>
                            <div class="admin-detail__meta">
                                <span class="admin-detail__meta-item">📧 ${req.email}</span>
                                <span class="admin-detail__meta-item">📱 ${req.mobile}</span>
                                <span class="admin-detail__meta-item">📅 Submitted ${formatDate(req.submitted_at)}</span>
                            </div>
                        </div>
                        <span class="badge badge--${req.status.replace('_', '-')}">${formatStatus(req.status)}</span>
                    </div>

                    <div class="admin-detail__section">
                        <h3 class="admin-detail__section-title">Student Details</h3>
                        <div class="admin-detail__grid">
                            <div class="admin-detail__field">
                                <span class="admin-detail__field-label">Date of Birth</span>
                                <span class="admin-detail__field-value">${formatDate(req.date_of_birth)}</span>
                            </div>
                            <div class="admin-detail__field">
                                <span class="admin-detail__field-label">Age</span>
                                <span class="admin-detail__field-value">${calculateAge(req.date_of_birth)} years</span>
                            </div>
                            <div class="admin-detail__field">
                                <span class="admin-detail__field-label">Minor Status</span>
                                <span class="admin-detail__field-value">${req.is_minor ? 'Yes (Under 18)' : 'No (18+)'}</span>
                            </div>
                            ${req.address ? `
                                <div class="admin-detail__field">
                                    <span class="admin-detail__field-label">Address</span>
                                    <span class="admin-detail__field-value">${req.address}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    ${req.is_minor && req.guardian_name ? `
                        <div class="admin-detail__section">
                            <h3 class="admin-detail__section-title">Guardian Information</h3>
                            <div class="admin-detail__grid">
                                <div class="admin-detail__field">
                                    <span class="admin-detail__field-label">Name</span>
                                    <span class="admin-detail__field-value">${req.guardian_name}</span>
                                </div>
                                <div class="admin-detail__field">
                                    <span class="admin-detail__field-label">Relationship</span>
                                    <span class="admin-detail__field-value">${req.guardian_relationship}</span>
                                </div>
                                ${req.guardian_email ? `
                                    <div class="admin-detail__field">
                                        <span class="admin-detail__field-label">Email</span>
                                        <span class="admin-detail__field-value">${req.guardian_email}</span>
                                    </div>
                                ` : ''}
                                <div class="admin-detail__field">
                                    <span class="admin-detail__field-label">Mobile</span>
                                    <span class="admin-detail__field-value">${req.guardian_mobile}</span>
                                </div>
                            </div>
                        </div>
                    ` : ''}

                    <div class="admin-detail__section">
                        <h3 class="admin-detail__section-title">Selected Programmes</h3>
                        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                            ${(req.selected_programmes || []).map(p => `
                                <span class="badge badge--approved">${p.name}</span>
                            `).join('')}
                        </div>
                    </div>

                    ${req.status === 'pending_review' ? `
                        <div class="admin-detail__section">
                            <h3 class="admin-detail__section-title">Review Actions</h3>
                            <div class="admin-actions">
                                <button class="btn btn--primary" onclick="Admin.updateRegistrationStatus('${req.id}', 'approved')">✓ Approve</button>
                                <button class="btn btn--secondary" onclick="Admin.updateRegistrationStatus('${req.id}', 'needs_information')" style="border-color: var(--color-warning); color: var(--color-warning);">ℹ Request Information</button>
                                <button class="btn btn--secondary" onclick="Admin.updateRegistrationStatus('${req.id}', 'rejected')" style="border-color: var(--color-error); color: var(--color-error);">✕ Reject</button>
                            </div>
                        </div>
                    ` : `
                        <div class="admin-detail__section">
                            <h3 class="admin-detail__section-title">Review Notes</h3>
                            <p style="color: var(--color-text-secondary);">${req.review_notes || 'No notes'}</p>
                            ${req.reviewed_at ? `<p style="color: var(--color-text-muted); font-size: 0.85rem; margin-top: 8px;">Reviewed on ${formatDate(req.reviewed_at)}</p>` : ''}
                        </div>
                    `}
                </div>
            `;

        } catch (error) {
            container.innerHTML = `
                <div class="admin-empty">
                    <div class="admin-empty__icon">⚠️</div>
                    <div class="admin-empty__title">Unable to load registration</div>
                    <div class="admin-empty__text">${error.message}</div>
                </div>
            `;
        }
    }

    async function updateRegistrationStatus(id, newStatus) {
        const notes = prompt(`Add notes for this ${newStatus} decision (optional):`);
        
        try {
            await apiCall(`/registration-requests/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus, notes: notes || '' }),
            });
            
            viewRegistration(id);
        } catch (error) {
            alert('Failed to update status: ' + error.message);
        }
    }

    // ========================================
    // Students
    // ========================================
    async function renderStudents() {
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
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(s => `
                                        <tr>
                                            <td><strong>${s.cma_registration_id}</strong></td>
                                            <td>${s.full_name}</td>
                                            <td>${s.phone || '-'}</td>
                                            <td><span class="badge badge--${s.status}">${s.status}</span></td>
                                            <td>${s.enrollment_count}</td>
                                            <td>${formatDate(s.created_at)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="admin-empty">
                                <div class="admin-empty__icon">🎓</div>
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
                    <div class="admin-empty__icon">⚠️</div>
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
                                <div class="admin-empty__icon">📚</div>
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
                    <div class="admin-empty__icon">⚠️</div>
                    <div class="admin-empty__title">Unable to load enrollments</div>
                    <div class="admin-empty__text">${error.message}</div>
                </div>
            `;
        }
    }

    // ========================================
    // Placeholder Pages
    // ========================================
    function renderPlaceholder(title, icon) {
        const container = document.getElementById('adminContent');
        container.innerHTML = `
            <div class="admin-header">
                <div>
                    <h1 class="admin-header__title">${title}</h1>
                    <p class="admin-header__subtitle">This module is under development</p>
                </div>
            </div>
            <div class="admin-empty">
                <div class="admin-empty__icon">${icon}</div>
                <div class="admin-empty__title">${title}</div>
                <div class="admin-empty__text">Coming soon</div>
            </div>
        `;
    }

    // ========================================
    // Utility Functions
    // ========================================
    function formatStatus(status) {
        const map = {
            'pending_review': 'Pending Review',
            'approved': 'Approved',
            'rejected': 'Rejected',
            'needs_information': 'Needs Info',
            'active': 'Active',
            'inactive': 'Inactive',
            'paid': 'Paid',
            'pending': 'Pending',
        };
        return map[status] || status;
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
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

    // ========================================
    // Render
    // ========================================
    function render() {
        const layout = document.getElementById('adminLayout');
        if (!layout) return;

        layout.innerHTML = `
            ${renderSidebar()}
            <main class="admin-main" id="adminContent"></main>
            <button class="admin-sidebar__toggle" id="adminSidebarToggle">☰</button>
        `;

        bindSidebarEvents();

        switch (currentSection) {
            case 'dashboard': renderDashboard(); break;
            case 'registrations': renderRegistrations(); break;
            case 'students': renderStudents(); break;
            case 'enrollments': renderEnrollments(); break;
            case 'instructors': renderPlaceholder('Instructors', '👨‍🏫'); break;
            case 'classes': renderPlaceholder('Classes / Schedules', '📅'); break;
            case 'fees': renderPlaceholder('Fees & Payments', '💰'); break;
            case 'attendance': renderPlaceholder('Attendance', '✅'); break;
            case 'progress': renderPlaceholder('Progress', '📈'); break;
            case 'exams': renderPlaceholder('Exams / Certifications', '🏅'); break;
            case 'assignments': renderPlaceholder('Assignments / Quizzes', '📝'); break;
            case 'resources': renderPlaceholder('Resources', '📁'); break;
            case 'reports': renderPlaceholder('Reports', '📉'); break;
            case 'settings': renderPlaceholder('Settings', '⚙️'); break;
            default: renderDashboard();
        }
    }

    // ========================================
    // Public API
    // ========================================
    return {
        init() {
            render();
        },
        navigateTo(section) {
            navigateTo(section);
        },
        viewRegistration(id) {
            viewRegistration(id);
        },
        updateRegistrationStatus(id, status) {
            updateRegistrationStatus(id, status);
        },
    };
})();
