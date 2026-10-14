/* ============================================
   ChankArts Music Academy — Learning Portal
   Student / Parent / Faculty experience
   ============================================ */

const Portal = (function () {
    'use strict';

    const BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:8000'
        : '') + '/api/v1';

    const state = {
        section: 'dashboard',
        me: null,
        role: null,
        dashboard: null,
        enrollments: [],
        activeStudentId: null,
        sessions: [],
        assignments: [],
        materials: [],
        reports: [],
        syllabi: [],
        progress: null,
        exams: [],
        milestones: [],
        invoices: [],
        payments: [],
        packages: [],
        paymentConfig: null,
        resources: [],
        notifications: [],
        children: [],
        loading: false,
        error: null,
        calMonth: null,      // Date for the first of the visible month
        classView: 'month',
        billingTab: 'pay',
        assignmentTab: 'current',
        materialFilter: 'all',
        resourceTab: 'books',
        notifOpen: false,
        sidebarOpen: false,
    };

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------
    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function token() {
        return localStorage.getItem('academy_token');
    }

    function storedUser() {
        try { return JSON.parse(localStorage.getItem('academy_user') || '{}'); } catch (e) { return {}; }
    }

    async function api(path, options = {}) {
        const headers = Object.assign(
            { 'Content-Type': 'application/json' },
            token() ? { Authorization: 'Bearer ' + token() } : {},
            options.headers || {}
        );
        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }
        const response = await fetch(BASE + path, Object.assign({}, options, { headers }));
        if (response.status === 401) {
            localStorage.removeItem('academy_token');
            localStorage.removeItem('academy_user');
            window.location.href = window.AppPath('/academy/login');
            throw new Error('Session expired');
        }
        if (!response.ok) {
            let detail = 'Request failed';
            try {
                const body = await response.json();
                detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail || detail);
            } catch (e) { /* ignore */ }
            const err = new Error(detail);
            err.status = response.status;
            throw err;
        }
        if (response.status === 204) return null;
        return response.json();
    }

    function fmtPaise(paise) {
        if (paise == null) return '—';
        const rupees = paise / 100;
        return '₹' + rupees.toLocaleString('en-IN', { maximumFractionDigits: rupees % 1 ? 2 : 0 });
    }

    function parseDate(value) {
        if (!value) return null;
        const parts = String(value).slice(0, 10).split('-');
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }

    const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    function fmtDay(value) {
        const d = parseDate(value);
        if (!d) return '—';
        return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3);
    }

    function fmtLong(value) {
        const d = typeof value === 'string' ? parseDate(value) : value;
        if (!d) return '—';
        return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
    }

    function monthLabel(ym) {
        if (!ym) return '';
        const bits = ym.split('-');
        return MON[Number(bits[1]) - 1] + ' ' + bits[0];
    }

    function initials(name) {
        if (!name) return 'CA';
        return name.trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase();
    }

    function badge(status) {
        const label = {
            scheduled: 'Scheduled', completed: 'Completed', rescheduling_required: 'Reschedule Pending',
            cancelled: 'Cancelled', paid: 'Paid', pending: 'Pending', partially_paid: 'Partially Paid',
            void: 'Void', assigned: 'Assigned', submitted: 'Submitted', reviewed: 'Reviewed',
            revision_requested: 'Revision Requested', draft: 'Draft', approved: 'Approved',
            rejected: 'Rejected', needs_information: 'Needs Info', overdue: 'Overdue',
            failed: 'Failed', in_progress: 'In Progress', not_started: 'Not Started',
        }[status] || status;
        return '<span class="badge badge--' + esc(status) + '"><span class="badge__dot"></span>' + esc(label) + '</span>';
    }

    function toast(message, kind) {
        const old = document.querySelector('.toast-p');
        if (old) old.remove();
        const el = document.createElement('div');
        el.className = 'toast-p' + (kind === 'error' ? ' toast-p--error' : '');
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 3600);
    }

    function emptyState(icon, text) {
        return '<div class="empty-p"><div class="empty-p__icon">' + icon + '</div>' + esc(text) + '</div>';
    }

    function loadingState(text) {
        return '<div class="loading-p"><span class="spinner"></span>' + esc(text || 'Loading…') + '</div>';
    }

    async function downloadFile(storedName, filename) {
        try {
            const response = await fetch(BASE + '/learning/files/' + encodeURIComponent(storedName), {
                headers: { Authorization: 'Bearer ' + token() },
            });
            if (!response.ok) throw new Error('Download failed');
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || storedName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    // ------------------------------------------------------------------
    // Navigation model
    // ------------------------------------------------------------------
    const NAV_STUDENT = [
        { section: 'dashboard', label: 'Dashboard', icon: '⌂' },
        { section: 'classes', label: 'My Classes', icon: '🗓' },
        { section: 'billing', label: 'Payments & Billing', icon: '₹' },
        { section: 'assignments', label: 'Assignments', icon: '✎' },
        { section: 'materials', label: 'Study Material', icon: '◫' },
        { section: 'reports', label: 'Monthly Reports', icon: '☰' },
        { section: 'syllabus', label: 'Syllabus & Progress', icon: '✓' },
        { section: 'exams', label: 'Exams & Milestones', icon: '♛' },
        { section: 'resources', label: 'Resources', icon: '◈' },
        { section: 'remarks', label: 'Remarks', icon: '💬' },
        { divider: true },
        { section: 'profile', label: 'My Profile', icon: '◐' },
        { section: 'help', label: 'Help & Support', icon: '?' },
    ];

    const NAV_FACULTY = [
        { section: 'dashboard', label: 'Dashboard', icon: '⌂' },
        { section: 'classes', label: 'Class Schedule', icon: '🗓' },
        { section: 'assignments', label: 'Assignments', icon: '✎' },
        { section: 'materials', label: 'Study Material', icon: '◫' },
        { section: 'reports', label: 'Monthly Reports', icon: '☰' },
        { section: 'syllabus', label: 'Syllabus & Progress', icon: '✓' },
        { section: 'exams', label: 'Exams & Milestones', icon: '♛' },
        { section: 'resources', label: 'Resources', icon: '◈' },
        { divider: true },
        { section: 'profile', label: 'My Profile', icon: '◐' },
        { section: 'help', label: 'Help & Support', icon: '?' },
    ];

    function navItems() {
        return state.role === 'instructor' ? NAV_FACULTY : NAV_STUDENT;
    }

    function isFaculty() {
        return state.role === 'instructor';
    }

    function sectionFromPath() {
        const canonical = window.AppCanonical(window.location.pathname);
        const match = canonical.match(/^\/academy\/portal\/?([^/?]*)/);
        const section = match && match[1] ? match[1] : 'dashboard';
        return navItems().some(function (n) { return n.section === section; }) ? section : 'dashboard';
    }

    function go(section) {
        const path = '/academy/portal/' + section;
        if (window.AppCanonical(window.location.pathname) !== path) {
            window.history.pushState({}, '', window.AppPath(path));
        }
        state.section = section;
        state.sidebarOpen = false;
        render();
    }

    // ------------------------------------------------------------------
    // Shell
    // ------------------------------------------------------------------
    function renderSidebar() {
        const items = navItems().map(function (item) {
            if (item.divider) return '<div class="portal-nav__label">Account</div>';
            let badgeHtml = '';
            if (item.section === 'assignments' && state.dashboard && state.dashboard.pending_assignments) {
                badgeHtml = '<span class="portal-nav__badge">' + state.dashboard.pending_assignments + '</span>';
            }
            return '' +
                '<button class="portal-nav__link' + (state.section === item.section ? ' portal-nav__link--active' : '') + '" ' +
                'data-portal-nav="' + item.section + '">' +
                '<span class="portal-nav__icon">' + item.icon + '</span>' +
                '<span>' + item.label + '</span>' + badgeHtml +
                '</button>';
        }).join('');

        return '' +
            '<aside class="portal-sidebar' + (state.sidebarOpen ? ' portal-sidebar--open' : '') + '" id="portalSidebar">' +
            '<div class="portal-sidebar__brand">' +
            '<img src="assets/ChankArts Music Academy.png" alt="">' +
            '<span class="portal-sidebar__brand-text">' +
            '<span class="portal-sidebar__brand-name">CHANKARTS</span>' +
            '<span class="portal-sidebar__brand-tag">Music Academy</span>' +
            '</span></div>' +
            '<nav class="portal-nav">' + items + '</nav>' +
            '<div class="portal-nav">' +
            '<button class="portal-nav__link" data-portal-logout>' +
            '<span class="portal-nav__icon">⏻</span><span>Logout</span></button>' +
            '</div>' +
            '</aside>';
    }

    function renderTopbar() {
        const me = state.me || {};
        let name = storedUser().name || '';
        let sub = '';
        if (state.role === 'student' && me.student) {
            name = me.student.full_name;
            sub = me.student.cma_registration_id || '';
        } else if (state.role === 'instructor' && me.instructor) {
            name = me.instructor.name || name;
            sub = 'Faculty';
        } else if (state.role === 'parent') {
            name = name || 'Guardian';
            sub = 'Parent account';
        }
        const unread = state.notifications.filter(function (n) { return !n.read; }).length;
        const crumb = (navItems().find(function (n) { return n.section === state.section; }) || {}).label || 'Dashboard';

        const notifPanel = state.notifOpen
            ? '<div class="notif-p" id="notifPanel">' +
              (state.notifications.length
                  ? state.notifications.slice(0, 12).map(function (n) {
                        return '<div class="notif-p__item">' + esc(n.title) +
                            (n.body ? '<br><small style="color:var(--text-2)">' + esc(n.body) + '</small>' : '') +
                            '<time>' + esc(n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : '') + '</time></div>';
                    }).join('')
                  : '<div class="notif-p__item">No notifications yet</div>') +
              '</div>'
            : '';

        return '' +
            '<header class="portal-topbar">' +
            '<div class="portal-topbar__left">' +
            '<button class="portal-menu-btn" data-portal-menu aria-label="Menu">☰</button>' +
            '<a class="portal-topbar__logo" href="/academy/portal" data-portal-home>' +
            '<img src="assets/ChankArts Music Academy.png" alt="">' +
            '<span class="portal-topbar__wordmark">ChankArts</span></a>' +
            '<span class="portal-topbar__crumb">' + esc(crumb) + '</span>' +
            '</div>' +
            '<div class="portal-topbar__right" style="position:relative">' +
            '<button class="portal-bell" data-portal-notif aria-label="Notifications">🔔' +
            (unread ? '<span class="portal-bell__dot"></span>' : '') + '</button>' +
            notifPanel +
            '<div class="portal-user">' +
            '<span class="portal-avatar">' + esc(initials(name)) + '</span>' +
            '<span class="portal-user__meta">' +
            '<span class="portal-user__name">' + esc(name) + '</span>' +
            '<span class="portal-user__id">' + esc(sub) + '</span>' +
            '</span></div>' +
            '</div>' +
            '</header>';
    }

    // ------------------------------------------------------------------
    // Section: Dashboard
    // ------------------------------------------------------------------
    async function loadDashboard() {
        if (isFaculty()) {
            const results = await Promise.all([
                api('/sessions?limit=200'),
                api('/sessions/stats/monthly'),
                api('/learning/assignments?status=submitted'),
                api('/portal/enrollments'),
            ]);
            state.sessions = results[0];
            state.facultyStats = results[1];
            state.pendingReviews = results[2];
            state.enrollments = results[3];
            return;
        }
        state.dashboard = await api('/portal/dashboard' + (state.activeStudentId ? '?student_id=' + state.activeStudentId : ''));
    }

    function renderFacultyDashboard() {
        const upcoming = state.sessions
            .filter(function (s) { return s.status === 'scheduled' && s.scheduled_date >= todayIso(); })
            .sort(function (a, b) { return (a.scheduled_date + a.scheduled_start) < (b.scheduled_date + b.scheduled_start) ? -1 : 1; })
            .slice(0, 6);
        const stats = state.facultyStats || {};
        const students = state.enrollments.length;
        const pending = (state.pendingReviews || []).length;
        const name = (state.me.instructor && state.me.instructor.name) || 'Faculty';

        return '' +
            '<div class="welcome">' +
            '<div class="welcome__left">' +
            '<span class="welcome__photo">' + esc(initials(name)) + '</span>' +
            '<div>' +
            '<h1 class="welcome__title">Welcome, ' + esc(name) + '! 🎵</h1>' +
            '<p class="welcome__meta"><strong>' + esc(String(students)) + ' active students</strong> · ' + esc(monthLabel(todayYm())) + '</p>' +
            '<p class="welcome__quote">“Teaching is the art of helping others hear what is already inside them.”</p>' +
            '</div></div>' +
            '<div class="welcome__progress">' +
            '<div class="welcome__progress-label"><span>' + esc(monthLabel(todayYm())) + ' Progress</span>' +
            '<strong>' + (stats.completed || 0) + ' completed</strong></div>' +
            '<p class="welcome__progress-sub">' + (stats.completed || 0) + ' of ' +
            ((stats.completed || 0) + (stats.scheduled || 0)) + ' classes this month</p>' +
            '<div class="progress"><div class="progress__bar" style="width:' + progressPct(stats.completed, stats.completed + stats.scheduled) + '%"></div></div>' +
            '</div></div>' +

            '<div class="grid grid--stats" style="margin-top:16px">' +
            statCard('ok', '✓', stats.completed || 0, 'Classes Completed') +
            statCard('wait', '🗓', stats.scheduled || 0, 'Classes Scheduled') +
            statCard('alert', '⟳', stats.rescheduling_required || 0, 'Reschedule Pending') +
            statCard('fee', '✎', pending, 'Submissions to Review') +
            '</div>' +

            '<div class="grid grid--main" style="margin-top:16px">' +
            '<div class="card">' +
            '<div class="card__head"><h3 class="card__title">Upcoming Classes</h3>' +
            '<button class="card__link" data-portal-nav="classes">View All →</button></div>' +
            (upcoming.length
                ? '<div class="list">' + upcoming.map(sessionRow).join('') + '</div>'
                : emptyState('🗓', 'No upcoming classes scheduled yet.')) +
            '</div>' +
            '<div class="card">' + renderCalendar() + '</div>' +
            '</div>' +

            '<div class="card">' +
            '<div class="card__head"><h3 class="card__title">My Students</h3></div>' +
            (state.enrollments.length
                ? '<div class="list">' + state.enrollments.map(function (e) {
                    return '<div class="list__row">' +
                        '<span class="portal-avatar">' + esc(initials(e.student_name)) + '</span>' +
                        '<div class="list__body"><div class="list__title">' + esc(e.student_name) + '</div>' +
                        '<div class="list__sub">' + esc(e.programme_name) + ' · ' + esc(e.cma_registration_id || '') + '</div></div>' +
                        '<div class="list__actions">' + badge(e.status) + '</div></div>';
                }).join('') + '</div>'
                : emptyState('🎓', 'No students assigned yet.')) +
            '</div>';
    }

    function statCard(kind, icon, value, label) {
        return '<div class="stat stat--' + kind + '">' +
            '<span class="stat__icon">' + icon + '</span>' +
            '<div><div class="stat__value">' + esc(String(value)) + '</div>' +
            '<div class="stat__label">' + esc(label) + '</div></div></div>';
    }

    function progressPct(done, total) {
        if (!total) return 0;
        return Math.min(100, Math.round((done / total) * 100));
    }

    function todayIso() {
        const d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function todayYm() {
        return todayIso().slice(0, 7);
    }

    function sessionRow(s) {
        return '<div class="list__row">' +
            '<div class="list__date">' + esc(fmtDay(s.scheduled_date)) + '</div>' +
            '<div class="list__body">' +
            '<div class="list__title">' + esc(s.scheduled_start) + ' – ' + esc(s.scheduled_end) + '</div>' +
            '<div class="list__sub">' + esc(s.programme || (s.is_online ? 'Online class' : 'Academy class')) +
            (s.location ? ' · ' + esc(s.location) : '') + '</div></div>' +
            '<div class="list__actions">' + badge(s.status) + '</div></div>';
    }

    function renderStudentDashboard() {
        const d = state.dashboard;
        if (!d) return loadingState();
        const student = d.student || {};
        const enrol = (d.enrollments && d.enrollments[0]) || {};
        const month = d.month_summary || {};
        const total = (month.completed || 0) + (month.scheduled || 0);
        const pct = progressPct(month.completed, total);
        const fee = d.fee;
        const report = d.latest_report;
        const syllabus = d.syllabus || {};

        const childrenSwitch = state.role === 'parent' && state.children.length > 1
            ? '<div class="child-switch">' + state.children.map(function (c) {
                return '<button data-child="' + esc(c.id) + '"' + (c.id === state.activeStudentId ? ' class="active"' : '') + '>' +
                    esc(c.first_name) + '</button>';
            }).join('') + '</div>'
            : '';

        return childrenSwitch +
            '<div class="welcome">' +
            '<div class="welcome__left">' +
            '<span class="welcome__photo">' + esc(initials(student.full_name)) + '</span>' +
            '<div>' +
            '<h1 class="welcome__title">Welcome, ' + esc(student.full_name || 'Student') + '! 🎵</h1>' +
            '<p class="welcome__meta"><strong>' + esc(student.cma_registration_id || '') + '</strong>' +
            (enrol.programme_name ? ' | ' + esc(enrol.programme_name) : '') +
            (enrol.instructor ? ' | Faculty: ' + esc(enrol.instructor) : '') + '</p>' +
            '<p class="welcome__quote">“Consistent practice turns effort into artistry.”</p>' +
            '</div></div>' +
            '<div class="welcome__progress">' +
            '<div class="welcome__progress-label"><span>' + esc(monthLabel(d.month)) + ' Progress</span>' +
            '<strong>' + pct + '%</strong></div>' +
            '<p class="welcome__progress-sub">' + (month.completed || 0) + ' of ' + total + ' classes completed</p>' +
            '<div class="progress"><div class="progress__bar" style="width:' + pct + '%"></div></div>' +
            '</div></div>' +

            '<div class="grid grid--stats" style="margin-top:16px">' +
            statCard('ok', '✓', month.completed || 0, 'Classes Completed') +
            statCard('wait', '🗓', month.scheduled || 0, 'Classes Scheduled') +
            statCard('alert', '⟳', month.rescheduling_required || 0, 'Reschedule Pending') +
            statCard('fee', '₹', fee ? fmtPaise(fee.amount_paid_paise) : '—',
                fee && fee.status === 'paid' ? monthLabel(d.month) + ' Fee Paid'
                    : fee ? monthLabel(d.month) + ' Fee Due' : 'No Fee Issued') +
            '</div>' +

            '<div class="grid grid--main" style="margin-top:16px">' +
            '<div class="card">' +
            '<div class="card__head"><h3 class="card__title">Upcoming Classes</h3>' +
            '<button class="card__link" data-portal-nav="classes">View All →</button></div>' +
            (d.upcoming_classes && d.upcoming_classes.length
                ? '<div class="list">' + d.upcoming_classes.map(function (s) {
                    return '<div class="list__row">' +
                        '<div class="list__date">' + esc(fmtDay(s.date)) + '</div>' +
                        '<div class="list__body"><div class="list__title">' + esc(s.start) + ' – ' + esc(s.end) + '</div>' +
                        '<div class="list__sub">' + esc(s.programme || 'Class') + '</div></div>' +
                        '<div class="list__actions">' + badge(s.status) + '</div></div>';
                }).join('') + '</div>'
                : emptyState('🗓', 'No upcoming classes yet.')) +
            '</div>' +
            '<div class="card">' + renderCalendar() + '</div>' +
            '</div>' +

            '<div class="grid grid--tiles" style="margin-top:16px">' +
            tile('♛', 'Next Exam', d.upcoming_exams && d.upcoming_exams.length
                ? (d.upcoming_exams[0].board + ' Grade ' + (d.upcoming_exams[0].grade || '—')) : 'None scheduled', 'exams') +
            tile('✎', 'Assignments', d.pending_assignments ? d.pending_assignments + ' Pending' : 'All clear', 'assignments') +
            tile('◫', 'Study Material', state.materials.length + ' Resources', 'materials') +
            tile('☰', 'Monthly Report', report ? monthLabel(report.report_month) : 'No report yet', 'reports') +
            '</div>' +

            '<div class="grid grid--2" style="margin-top:16px">' +
            '<div class="card">' +
            '<div class="card__head"><h3 class="card__title">Monthly Report</h3>' +
            (report ? '<button class="card__link" data-portal-nav="reports">View Full Report →</button>' : '') + '</div>' +
            (report
                ? '<div class="report__block"><h4>Progress Summary</h4><p>' + esc(report.progress_summary || '—') + '</p></div>' +
                  '<div class="report__block" style="margin-top:12px"><h4>Next Month Focus</h4><p>' + esc(report.next_month_focus || '—') + '</p></div>'
                : emptyState('☰', 'No published report for this month yet.')) +
            '</div>' +
            '<div class="card">' +
            '<div class="card__head"><h3 class="card__title">Syllabus & Progress</h3>' +
            '<button class="card__link" data-portal-nav="syllabus">Open →</button></div>' +
            (syllabus.total
                ? '<p class="welcome__progress-sub">' + syllabus.completed + ' of ' + syllabus.total + ' topics completed</p>' +
                  '<div class="progress"><div class="progress__bar" style="width:' + (syllabus.percent || 0) + '%"></div></div>' +
                  '<p style="margin-top:10px;font-weight:700;color:var(--text)">' + (syllabus.percent || 0) + '% complete</p>'
                : emptyState('✓', 'Syllabus progress will appear once faculty updates it.')) +
            '</div>' +
            '</div>';
    }

    function tile(icon, label, value, section) {
        return '<button class="tile" data-portal-nav="' + section + '">' +
            '<span class="tile__icon">' + icon + '</span>' +
            '<span class="tile__label">' + esc(label) + '</span>' +
            '<span class="tile__value">' + esc(value) + '</span></button>';
    }

    // ------------------------------------------------------------------
    // Calendar
    // ------------------------------------------------------------------
    function renderCalendar() {
        const anchor = state.calMonth || (function () {
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), 1);
        })();

        const year = anchor.getFullYear();
        const month = anchor.getMonth();
        const firstDow = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevDays = new Date(year, month, 0).getDate();

        const dayStatus = {};
        state.sessions.forEach(function (s) {
            if (!s.scheduled_date) return;
            const key = Number(s.scheduled_date.slice(8, 10));
            const cur = dayStatus[key];
            if (s.status === 'completed') dayStatus[key] = 'completed';
            else if (s.status === 'rescheduling_required' && cur !== 'completed') dayStatus[key] = 'rescheduling';
            else if (s.status === 'scheduled' && !cur) dayStatus[key] = 'scheduled';
        });

        let cells = '';
        for (let i = firstDow - 1; i >= 0; i--) {
            cells += '<div class="cal__day cal__day--muted">' + (prevDays - i) + '</div>';
        }
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const classes = dayStatus[day] ? ' cal__day--' + dayStatus[day] : '';
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            cells += '<div class="cal__day' + (isToday ? ' cal__day--today' : '') + classes + '">' + day + '</div>';
        }
        const totalCells = firstDow + daysInMonth;
        for (let i = 1; i <= (7 - (totalCells % 7)) % 7; i++) {
            cells += '<div class="cal__day cal__day--muted">' + i + '</div>';
        }

        return '' +
            '<div class="cal__head">' +
            '<button class="cal__nav" data-cal-prev aria-label="Previous month">‹</button>' +
            '<span class="cal__month">' + MON[month] + ' ' + year + '</span>' +
            '<button class="cal__nav" data-cal-next aria-label="Next month">›</button>' +
            '</div>' +
            '<div class="cal__grid">' +
            DOW.map(function (d) { return '<div class="cal__dow">' + d[0] + '</div>'; }).join('') +
            cells +
            '</div>' +
            '<div class="cal__legend">' +
            '<span><i style="background:var(--success)"></i>Completed</span>' +
            '<span><i style="background:var(--scheduled-fg)"></i>Scheduled</span>' +
            '<span><i style="background:var(--danger)"></i>Reschedule</span>' +
            '</div>';
    }

    // ------------------------------------------------------------------
    // Section: Classes
    // ------------------------------------------------------------------
    async function loadClasses() {
        const from = state.calMonth
            ? ymOf(state.calMonth, -1) : ymOf(new Date(), -1);
        const to = state.calMonth
            ? ymOf(state.calMonth, 1) : ymOf(new Date(), 1);
        state.sessions = await api('/sessions?date_from=' + from + '&date_to=' + to + '&limit=300');
    }

    function ymOf(date, offset) {
        const d = new Date(date.getFullYear(), date.getMonth() + offset, 1);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01';
    }

    function renderClasses() {
        const now = new Date();
        const monthSessions = state.sessions
            .filter(function (s) { return s.scheduled_date.slice(0, 7) === todayYm(); })
            .sort(function (a, b) { return (a.scheduled_date + a.scheduled_start) < (b.scheduled_date + b.scheduled_start) ? -1 : 1; });

        const list = state.classView === 'list'
            ? state.sessions.slice().sort(function (a, b) { return a.scheduled_date < b.scheduled_date ? 1 : -1; })
            : monthSessions;

        const actions = isFaculty()
            ? '<button class="btn-p btn-p--auto btn-p--sm" data-action="new-session">＋ New Session</button>'
            : '';

        const sessionList = list.length
            ? '<div class="list">' + list.map(function (s) {
                let facultyActions = '';
                if (isFaculty()) {
                    facultyActions = '<div class="btn-row" style="margin-top:8px">';
                    if (s.status === 'scheduled') {
                        facultyActions += '<button class="btn-p btn-p--sm" data-action="complete-session" data-id="' + s.id + '">Mark Completed</button>';
                        facultyActions += '<button class="btn-p btn-p--sm btn-p--ghost" data-action="flag-session" data-id="' + s.id + '">Flag Reschedule</button>';
                        facultyActions += '<button class="btn-p btn-p--sm btn-p--ghost" data-action="cancel-session" data-id="' + s.id + '">Cancel</button>';
                    } else if (s.status === 'rescheduling_required') {
                        facultyActions += '<button class="btn-p btn-p--sm" data-action="reschedule-session" data-id="' + s.id + '">Schedule Replacement</button>';
                    }
                    facultyActions += '</div>';
                } else if (s.status === 'scheduled') {
                    facultyActions = '<div class="btn-row" style="margin-top:8px">' +
                        '<button class="btn-p btn-p--sm btn-p--ghost" data-action="flag-session" data-id="' + s.id + '">Request Reschedule</button></div>';
                }
                return '<div class="list__row" style="align-items:flex-start">' +
                    '<div class="list__date">' + esc(fmtDay(s.scheduled_date)) +
                    '<span>' + esc(s.scheduled_start) + ' – ' + esc(s.scheduled_end) + '</span></div>' +
                    '<div class="list__body">' +
                    '<div class="list__title">' + esc(s.is_online ? 'Online class' : (s.location || 'Academy class')) +
                    (s.is_duration_exception ? ' · ' + esc(s.duration_minutes) + ' min (exception)' : '') + '</div>' +
                    '<div class="list__sub">' + esc(s.topics_covered || '—') + '</div>' +
                    facultyActions + '</div>' +
                    '<div class="list__actions">' + badge(s.status) + '</div></div>';
            }).join('') + '</div>'
            : emptyState('🗓', 'No classes scheduled in this period.');

        return '' +
            '<div class="card">' +
            '<div class="card__head">' +
            '<div class="tabs" style="margin:0;border:none">' +
            ['month', 'week', 'list'].map(function (v) {
                return '<button class="tabs__tab' + (state.classView === v ? ' tabs__tab--active' : '') + '" ' +
                    'data-classview="' + v + '">' + v[0].toUpperCase() + v.slice(1) + '</button>';
            }).join('') +
            '</div>' + actions +
            '</div>' +
            '<div class="grid grid--main">' +
            '<div>' + renderCalendar() + '</div>' +
            '<div><h4 style="margin:0 0 6px;font-size:13px;text-transform:uppercase;letter-spacing:.1em;color:var(--text-2)">This Month</h4>' +
            sessionList + '</div>' +
            '</div></div>';
    }

    // ------------------------------------------------------------------
    // Section: Billing
    // ------------------------------------------------------------------
    async function loadBilling() {
        const results = await Promise.all([
            api('/billing/packages'),
            api('/billing/invoices?limit=100'),
            api('/billing/payments?limit=100'),
            api('/billing/payments/config'),
        ]);
        state.packages = results[0];
        state.invoices = results[1];
        state.payments = results[2];
        state.paymentConfig = results[3];
    }

    function renderBilling() {
        const paidInvoices = state.invoices.filter(function (i) { return i.status === 'paid'; });
        const due = state.invoices.filter(function (i) { return i.status !== 'paid' && i.status !== 'void'; });

        const tabs = [
            { id: 'pay', label: 'Pay Now' },
            { id: 'history', label: 'Payment History' },
            { id: 'invoices', label: 'Invoices' },
        ].map(function (t) {
            return '<button class="tabs__tab' + (state.billingTab === t.id ? ' tabs__tab--active' : '') + '" ' +
                'data-billingtab="' + t.id + '">' + t.label + '</button>';
        }).join('');

        let body = '';
        if (state.billingTab === 'pay') {
            const pkgCards = (state.packages.length ? state.packages : [
                { id: null, name: '4 Classes Package', fee_paise: 450000, sessions_included: 4 },
                { id: null, name: '8 Classes Package', fee_paise: 800000, sessions_included: 8 },
            ]).map(function (p, index) {
                return '<div class="pack' + (index === 0 ? ' pack--featured' : '') + '">' +
                    '<div class="pack__name">' + esc(p.name) + '</div>' +
                    '<div class="pack__price">' + fmtPaise(p.fee_paise) + '</div>' +
                    '<div class="pack__note">(1 hour per class)</div>' +
                    '<ul class="pack__perks">' +
                    '<li>Valid for 1 month</li>' +
                    '<li>Access to study material</li>' +
                    '<li>Monthly faculty report</li>' +
                    '</ul>' +
                    (due.length
                        ? '<button class="btn-p" data-action="pay-invoice" data-id="' + due[0].id + '">' +
                          'Pay ' + fmtPaise(due[0].amount_paise - due[0].amount_paid_paise) +
                          '<br><small style="font-weight:500;opacity:.8">via ' +
                          (state.paymentConfig && state.paymentConfig.enabled ? 'Razorpay' : 'academy') + '</small></button>'
                        : '<div class="badge badge--paid" style="justify-content:center">Nothing due</div>') +
                    '</div>';
            }).join('');

            body = '<div class="grid grid--2">' + pkgCards + '</div>' +
                (state.paymentConfig && !state.paymentConfig.enabled
                    ? '<p class="hint-p" style="margin-top:12px">Online card payments are not configured yet — contact the academy to settle by cash/UPI. ' +
                      'Pending dues: ' + fmtPaise(due.reduce(function (sum, i) { return sum + (i.amount_paise - i.amount_paid_paise); }, 0)) + '</p>'
                    : '');
        } else if (state.billingTab === 'history') {
            body = state.payments.length
                ? '<table class="table-p"><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th><th>Reference</th></tr></thead><tbody>' +
                  state.payments.map(function (p) {
                      return '<tr><td>' + esc(p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '—') + '</td>' +
                          '<td>' + fmtPaise(p.amount_paise) + '</td>' +
                          '<td>' + esc(p.method || p.provider) + '</td>' +
                          '<td>' + badge(p.status === 'verified' ? 'paid' : p.status) + '</td>' +
                          '<td>' + esc(p.provider_payment_id || '—') + '</td></tr>';
                  }).join('') + '</tbody></table>'
                : emptyState('₹', 'No payments recorded yet.');
        } else {
            body = state.invoices.length
                ? '<table class="table-p"><thead><tr><th>Month</th><th>Invoice</th><th>Amount</th><th>Paid</th><th>Status</th></tr></thead><tbody>' +
                  state.invoices.map(function (i) {
                      return '<tr><td>' + esc(monthLabel(i.billing_month)) + '</td>' +
                          '<td>' + esc(i.invoice_number) + '</td>' +
                          '<td>' + fmtPaise(i.amount_paise) + '</td>' +
                          '<td>' + fmtPaise(i.amount_paid_paise) + '</td>' +
                          '<td>' + badge(i.status) + '</td></tr>';
                  }).join('') + '</tbody></table>'
                : emptyState('🧾', 'No invoices issued yet.');
        }

        return '<div class="card"><div class="tabs">' + tabs + '</div>' + body + '</div>';
    }

    // ------------------------------------------------------------------
    // Section: Assignments
    // ------------------------------------------------------------------
    async function loadAssignments() {
        state.assignments = await api('/learning/assignments');
    }

    function renderAssignments() {
        const tabs = [
            { id: 'current', label: 'Current' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'all', label: 'All' },
        ].map(function (t) {
            return '<button class="tabs__tab' + (state.assignmentTab === t.id ? ' tabs__tab--active' : '') + '" ' +
                'data-assignmenttab="' + t.id + '">' + t.label + '</button>';
        }).join('');

        const filtered = state.assignments.filter(function (a) {
            if (state.assignmentTab === 'all') return true;
            if (state.assignmentTab === 'submitted') return a.submission && ['submitted', 'reviewed'].indexOf(a.submission.status) >= 0;
            return !a.submission || ['assigned', 'revision_requested'].indexOf(a.status) >= 0;
        });

        const head = isFaculty()
            ? '<button class="btn-p btn-p--auto btn-p--sm" data-action="new-assignment">＋ New Assignment</button>'
            : '';

        const rows = filtered.length ? '<div class="list">' + filtered.map(function (a) {
            const sub = a.submission;
            let action = '';
            if (isFaculty()) {
                if (sub && sub.status === 'submitted') {
                    action = '<button class="btn-p btn-p--sm" data-action="review-submission" data-id="' + sub.id + '">Review</button>';
                }
            } else if (!sub || a.status === 'revision_requested') {
                action = '<button class="btn-p btn-p--sm" data-action="submit-homework" data-id="' + a.id + '">Upload</button>';
            } else if (sub.status === 'reviewed') {
                action = '<span class="badge badge--reviewed">Reviewed</span>';
            } else {
                action = '<span class="badge badge--submitted">Submitted</span>';
            }
            const due = a.due_date
                ? '<div class="list__sub list__sub--due">Due: ' + esc(fmtDay(a.due_date)) + ' ' + esc(a.due_date.slice(0, 4)) + '</div>'
                : '';
            return '<div class="list__row" style="align-items:flex-start">' +
                '<span class="list__icon">♪</span>' +
                '<div class="list__body">' +
                '<div class="list__title">' + esc(a.title) + '</div>' +
                '<div class="list__sub">' + esc(a.instructions || a.practice_notes || 'Practice as assigned.') + '</div>' +
                due +
                (sub && sub.feedback ? '<div class="list__sub" style="color:var(--success)">Faculty: ' + esc(sub.feedback) + '</div>' : '') +
                '</div>' +
                '<div class="list__actions">' + action + '</div></div>';
        }).join('') + '</div>' : emptyState('✎', 'No assignments here yet.');

        return '<div class="card"><div class="card__head"><div class="tabs" style="margin:0;border:none">' + tabs + '</div>' + head + '</div>' + rows + '</div>';
    }

    // ------------------------------------------------------------------
    // Section: Study material
    // ------------------------------------------------------------------
    async function loadMaterials() {
        state.materials = await api('/learning/materials');
    }

    function renderMaterials() {
        const filters = [
            { id: 'all', label: 'All' },
            { id: 'technique', label: 'Technique' },
            { id: 'repertoire', label: 'Repertoire' },
            { id: 'theory', label: 'Theory' },
            { id: 'ear_training', label: 'Ear Training' },
            { id: 'exam_preparation', label: 'Exams' },
        ].map(function (f) {
            return '<button class="chip' + (state.materialFilter === f.id ? ' chip--active' : '') + '" ' +
                'data-matfilter="' + f.id + '">' + f.label + '</button>';
        }).join('');

        const rows = state.materials
            .filter(function (m) { return state.materialFilter === 'all' || m.category === state.materialFilter; })
            .map(function (m) {
                const isPdf = m.content_type === 'application/pdf';
                const glyphClass = m.material_type === 'link' ? 'link' : (isPdf ? 'pdf' : (String(m.content_type || '').startsWith('audio') ? 'audio' : 'doc'));
                const glyphText = glyphClass === 'pdf' ? 'PDF' : glyphClass === 'audio' ? '♪' : glyphClass === 'link' ? '↗' : 'DOC';
                const action = m.material_type === 'link' && m.link_url
                    ? '<a class="btn-p btn-p--sm btn-p--ghost" href="' + esc(m.link_url) + '" target="_blank" rel="noopener">Open ↗</a>'
                    : '<button class="btn-p btn-p--sm btn-p--ghost" data-action="download" data-name="' + esc(m.stored_name) + '" data-filename="' + esc(m.filename || m.title) + '">⇩ Download</button>';
                return '<div class="list__row">' +
                    '<span class="glyph glyph--' + glyphClass + '">' + glyphText + '</span>' +
                    '<div class="list__body"><div class="list__title">' + esc(m.title) + '</div>' +
                    '<div class="list__sub">' + esc(m.description || m.category.replace('_', ' ')) + '</div></div>' +
                    '<div class="list__actions">' + action + '</div></div>';
            }).join('');

        const head = isFaculty()
            ? '<button class="btn-p btn-p--auto btn-p--sm" data-action="new-material">＋ Upload Material</button>'
            : '';

        return '<div class="card"><div class="card__head"><div class="chips" style="margin:0">' + filters + '</div>' + head + '</div>' +
            (rows || emptyState('◫', 'No study material here yet.')) + '</div>';
    }

    // ------------------------------------------------------------------
    // Section: Reports
    // ------------------------------------------------------------------
    async function loadReports() {
        state.reports = await api('/learning/reports');
    }

    // ------------------------------------------------------------------
    // Section: Remarks
    // ------------------------------------------------------------------
    async function loadRemarks() {
        let studentId = null;
        if (state.role === 'student' && state.me && state.me.student) {
            studentId = state.me.student.id;
        } else if (state.role === 'parent') {
            studentId = state.activeStudentId;
        }
        if (!studentId) { state.remarks = []; return; }
        state.remarks = await api('/remarks?student_id=' + studentId);
    }

    function renderRemarks() {
        const remarks = state.remarks || [];
        if (!remarks.length) {
            return '<div class="card">' + emptyState('💬', 'No remarks yet. Faculty remarks will appear here.') + '</div>';
        }
        const rows = remarks.map(function (r) {
            const visBadge = r.visibility === 'parent_visible'
                ? '<span class="badge badge--parent">For Parents</span>'
                : '<span class="badge badge--student">For Students</span>';
            return '<div class="list__row" style="align-items:flex-start;flex-direction:column;gap:6px;">' +
                '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
                '<span class="list__icon">💬</span>' + visBadge +
                '<span style="font-size:0.78rem;color:var(--text-2);">' +
                esc(r.author_role === 'instructor' ? 'Faculty' : 'Academy') +
                ' · ' + esc(r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '') +
                '</span></div>' +
                '<div style="white-space:pre-wrap;line-height:1.55;">' + esc(r.body) + '</div>' +
                '</div>';
        }).join('');
        return '<div class="card"><div class="card__head"><h3 class="card__title">Remarks from Faculty</h3></div>' + rows + '</div>';
    }

    function renderReports() {
        const head = isFaculty()
            ? '<button class="btn-p btn-p--auto btn-p--sm" data-action="new-report">＋ New Report</button>'
            : '';
        const rows = state.reports.length ? state.reports.map(function (r) {
            const actions = isFaculty()
                ? (r.status === 'draft'
                    ? '<button class="btn-p btn-p--sm" data-action="publish-report" data-id="' + r.id + '">Publish</button>'
                    : '<span class="badge badge--completed">Published</span>')
                : '<button class="btn-p btn-p--sm btn-p--ghost" data-action="view-report" data-id="' + r.id + '">View</button>';
            return '<div class="list__row">' +
                '<span class="list__icon">☰</span>' +
                '<div class="list__body"><div class="list__title">Faculty Report — ' + esc(monthLabel(r.report_month)) + '</div>' +
                '<div class="list__sub">' + esc((r.progress_summary || '').slice(0, 110) || '—') + '</div></div>' +
                '<div class="list__actions">' + badge(r.status) + actions + '</div></div>';
        }).join('') : emptyState('☰', 'No reports yet.');

        return '<div class="card"><div class="card__head"><h3 class="card__title">Monthly Reports</h3>' + head + '</div>' + rows + '</div>';
    }

    // ------------------------------------------------------------------
    // Section: Syllabus
    // ------------------------------------------------------------------
    async function loadSyllabus() {
        const results = await Promise.all([
            api('/learning/syllabi'),
            state.activeStudentId
                ? api('/learning/syllabus-progress?student_id=' + state.activeStudentId)
                : Promise.resolve(null),
        ]);
        state.syllabi = results[0];
        state.progress = results[1];
    }

    function renderSyllabus() {
        if (!state.syllabi.length) {
            return '<div class="card">' + emptyState('✓', 'Syllabus will appear here once faculty publishes one.') + '</div>';
        }
        const syllabus = state.syllabi[0];
        const progressItems = state.progress ? state.progress.items : [];
        const pct = state.progress ? (state.progress.percent || 0) : 0;

        const checklist = syllabus.items.map(function (item) {
            const progress = progressItems.find(function (p) { return p.item_id === item.id; });
            const status = progress ? progress.status : 'not_started';
            const mark = status === 'completed'
                ? '<span class="check-mark check-mark--done">✓</span>'
                : status === 'in_progress'
                    ? '<span class="check-mark check-mark--progress">•</span>'
                    : '<span class="check-mark"></span>';
            const meta = progress
                ? '<span class="check-list__meta">' + esc(status === 'completed' ? 'Completed' : status === 'in_progress' ? 'In progress' : 'Not started') + '</span>'
                : '<span class="check-list__meta">Not started</span>';
            const facultyAction = isFaculty() && state.activeStudentId
                ? '<div class="btn-row" style="margin-left:8px">' +
                  (status !== 'completed'
                      ? '<button class="btn-p btn-p--sm btn-p--ghost" data-action="progress" data-item="' + item.id + '" data-status="' +
                        (status === 'not_started' ? 'in_progress' : 'completed') + '">' +
                        (status === 'not_started' ? 'Start' : 'Mark Done') + '</button>'
                      : '') + '</div>'
                : '';
            return '<li>' + mark + '<span>' + esc(item.title) + '</span>' + facultyAction + meta + '</li>';
        }).join('');

        return '<div class="card">' +
            '<div class="card__head"><h3 class="card__title">' + esc(syllabus.title) + '</h3>' +
            '<span class="badge badge--pending">' + esc(syllabus.grade ? 'Grade ' + syllabus.grade : syllabus.board) + '</span></div>' +
            '<div class="welcome__progress-label"><span>Overall Progress</span><strong>' + pct + '%</strong></div>' +
            '<div class="progress" style="margin:8px 0 16px"><div class="progress__bar" style="width:' + pct + '%"></div></div>' +
            '<ul class="check-list">' + checklist + '</ul>' +
            '</div>';
    }

    // ------------------------------------------------------------------
    // Section: Exams
    // ------------------------------------------------------------------
    async function loadExams() {
        const results = await Promise.all([
            api('/learning/exams'),
            api('/learning/milestones'),
        ]);
        state.exams = results[0];
        state.milestones = results[1];
    }

    function renderExams() {
        const examRows = state.exams.length ? state.exams.map(function (x) {
            const action = isFaculty()
                ? '<button class="btn-p btn-p--sm btn-p--ghost" data-action="exam-status" data-id="' + x.id + '">Update</button>'
                : '';
            return '<div class="list__row">' +
                '<span class="list__icon">♛</span>' +
                '<div class="list__body">' +
                '<div class="list__title">' + esc(x.board) + ' Grade ' + esc(x.grade || '—') + ' · ' + esc(x.instrument) + '</div>' +
                '<div class="list__sub">' +
                (x.submission_deadline ? 'Submission deadline: ' + esc(fmtLong(x.submission_deadline)) : 'No deadline set') +
                (x.readiness ? ' · Readiness: ' + esc(x.readiness) : '') + '</div></div>' +
                '<div class="list__actions">' + badge(x.submission_status === 'submitted' ? 'completed' : x.submission_status || 'pending') + action + '</div></div>';
        }).join('') : emptyState('♛', 'No exams configured yet.');

        const milestoneRows = state.milestones.length ? state.milestones.map(function (m) {
            return '<div class="list__row">' +
                '<span class="list__icon">★</span>' +
                '<div class="list__body"><div class="list__title">' + esc(m.title) + '</div>' +
                '<div class="list__sub">' + esc(m.description || m.milestone_type) +
                (m.due_date ? ' · due ' + esc(fmtDay(m.due_date)) : '') + '</div></div>' +
                '<div class="list__actions">' + badge(m.achieved_at ? 'completed' : m.status || 'pending') + '</div></div>';
        }).join('') : emptyState('★', 'No milestones yet.');

        return '<div class="grid grid--2">' +
            '<div class="card"><div class="card__head"><h3 class="card__title">Exams</h3>' +
            (isFaculty() ? '<button class="btn-p btn-p--sm" data-action="new-exam">＋ Add</button>' : '') + '</div>' + examRows + '</div>' +
            '<div class="card"><div class="card__head"><h3 class="card__title">Milestones</h3>' +
            (isFaculty() ? '<button class="btn-p btn-p--sm" data-action="new-milestone">＋ Add</button>' : '') + '</div>' + milestoneRows + '</div>' +
            '</div>';
    }

    // ------------------------------------------------------------------
    // Section: Resources
    // ------------------------------------------------------------------
    async function loadResources() {
        state.resources = await api('/learning/recommendations');
    }

    function renderResources() {
        const tabs = [
            { id: 'books', label: 'Books', types: ['book'] },
            { id: 'instruments', label: 'Instruments', types: ['instrument'] },
            { id: 'accessories', label: 'Accessories', types: ['accessory', 'stand_notebook', 'metronome_tuner'] },
            { id: 'links', label: 'Online Links', types: ['online_link'] },
        ];
        const active = tabs.find(function (t) { return t.id === state.resourceTab; }) || tabs[0];
        const rows = state.resources
            .filter(function (r) { return active.types.indexOf(r.resource_type) >= 0; })
            .map(function (r) {
                return '<div class="res-row">' +
                    '<span class="res-row__thumb">' + (r.image_url ? '♪' : (active.id === 'books' ? '📖' : active.id === 'instruments' ? '🎻' : '🎧')) + '</span>' +
                    '<div class="list__body"><div class="list__title">' + esc(r.name) + '</div>' +
                    '<div class="list__sub">' + esc(r.author_or_brand || r.suitability || '') +
                    (r.faculty_note ? ' · ' + esc(r.faculty_note) : '') + '</div></div>' +
                    '<div class="list__actions">' +
                    (r.external_url
                        ? '<a class="btn-p btn-p--sm btn-p--ghost" href="' + esc(r.external_url) + '" target="_blank" rel="noopener">Buy Link</a>'
                        : '<span class="list__sub">Ask faculty</span>') +
                    '</div></div>';
            }).join('');

        return '<div class="card">' +
            '<div class="card__head"><div class="tabs" style="margin:0;border:none">' +
            tabs.map(function (t) {
                return '<button class="tabs__tab' + (state.resourceTab === t.id ? ' tabs__tab--active' : '') + '" ' +
                    'data-restab="' + t.id + '">' + t.label + '</button>';
            }).join('') + '</div></div>' +
            (rows || emptyState('◈', 'No recommendations in this category yet.')) + '</div>';
    }

    // ------------------------------------------------------------------
    // Section: Profile & help
    // ------------------------------------------------------------------
    function renderProfile() {
        const me = state.me || {};
        if (state.role === 'student' && me.student) {
            const s = me.student;
            const enrolRows = (s.enrollments || []).map(function (e) {
                return '<tr><td>' + esc(e.programme_name) + '</td><td>' + esc(e.instructor || '—') + '</td>' +
                    '<td>' + esc(e.fee_plan || '—') + '</td><td>' + badge(e.status) + '</td></tr>';
            }).join('');
            const guardianRows = (s.guardians || []).map(function (g) {
                return '<div class="list__row"><div class="list__body">' +
                    '<div class="list__title">' + esc(g.name) + '</div>' +
                    '<div class="list__sub">' + esc(g.relationship || '') + (g.phone ? ' · ' + esc(g.phone) : '') + '</div></div></div>';
            }).join('');

            return '<div class="grid grid--2">' +
                '<div class="card">' +
                '<div class="card__head"><h3 class="card__title">Profile</h3>' +
                '<button class="btn-p btn-p--sm btn-p--ghost" data-action="edit-profile">Edit</button></div>' +
                '<table class="table-p"><tbody>' +
                '<tr><td>Full name</td><td>' + esc(s.full_name) + '</td></tr>' +
                '<tr><td>CMA Registration ID</td><td><strong>' + esc(s.cma_registration_id) + '</strong></td></tr>' +
                '<tr><td>Email</td><td>' + esc(s.email) + '</td></tr>' +
                '<tr><td>Phone</td><td>' + esc(s.phone || '—') + '</td></tr>' +
                '<tr><td>Date of birth</td><td>' + esc(s.date_of_birth ? fmtLong(s.date_of_birth) : '—') + '</td></tr>' +
                '<tr><td>Skill level</td><td>' + esc(s.skill_level || '—') + '</td></tr>' +
                '</tbody></table></div>' +
                '<div class="card"><div class="card__head"><h3 class="card__title">Enrolled Courses</h3></div>' +
                (enrolRows
                    ? '<table class="table-p"><thead><tr><th>Programme</th><th>Faculty</th><th>Plan</th><th>Status</th></tr></thead><tbody>' + enrolRows + '</tbody></table>'
                    : emptyState('🎓', 'No enrolments yet.')) +
                '<div class="card__head" style="margin-top:18px"><h3 class="card__title">Guardians</h3></div>' +
                (guardianRows || emptyState('👪', 'No guardians on record.')) +
                '</div></div>';
        }
        if (state.role === 'parent') {
            const kids = (state.children || []).map(function (c) {
                return '<div class="list__row"><span class="portal-avatar">' + esc(initials(c.full_name)) + '</span>' +
                    '<div class="list__body"><div class="list__title">' + esc(c.full_name) + '</div>' +
                    '<div class="list__sub">' + esc(c.cma_registration_id || '') + '</div></div></div>';
            }).join('');
            return '<div class="card"><div class="card__head"><h3 class="card__title">Linked Children</h3></div>' +
                (kids || emptyState('👪', 'No children linked to this account.')) + '</div>';
        }
        const instructor = (state.me && state.me.instructor) || {};
        return '<div class="card"><div class="card__head"><h3 class="card__title">Faculty Profile</h3></div>' +
            '<table class="table-p"><tbody>' +
            '<tr><td>Name</td><td>' + esc(instructor.name || '—') + '</td></tr>' +
            '<tr><td>Email</td><td>' + esc((state.me || {}).email || '—') + '</td></tr>' +
            '<tr><td>Students</td><td>' + state.enrollments.length + '</td></tr>' +
            '</tbody></table></div>';
    }

    function renderHelp() {
        return '<div class="grid grid--2">' +
            '<div class="card"><h3 class="card__title" style="margin-bottom:10px">Help & Support</h3>' +
            '<p style="font-size:13.5px;color:var(--text-2);line-height:1.6">' +
            'Questions about classes, fees, or the portal? Reach the academy:</p>' +
            '<ul class="pack__perks"><li>Front desk: during academy hours</li>' +
            '<li>Email: support@chankarts.com</li>' +
            '<li>WhatsApp: use the number on your fee receipt</li></ul></div>' +
            '<div class="card"><h3 class="card__title" style="margin-bottom:10px">Class Policies</h3>' +
            '<ul class="pack__perks">' +
            '<li>Reschedule requests are reviewed by the academy — classes are never marked absent by the portal.</li>' +
            '<li>Standard classes run 60 minutes; legacy 30-minute slots are honoured.</li>' +
            '<li>Monthly fees are due as per your package (4 or 8 classes).</li>' +
            '</ul></div></div>';
    }

    // ------------------------------------------------------------------
    // Render orchestration
    // ------------------------------------------------------------------
    const loaders = {
        dashboard: loadDashboard,
        classes: loadClasses,
        billing: loadBilling,
        assignments: loadAssignments,
        materials: loadMaterials,
        reports: loadReports,
        syllabus: loadSyllabus,
        exams: loadExams,
        resources: loadResources,
        remarks: loadRemarks,
    };

    const renderers = {
        dashboard: function () { return isFaculty() ? renderFacultyDashboard() : renderStudentDashboard(); },
        classes: renderClasses,
        billing: renderBilling,
        assignments: renderAssignments,
        materials: renderMaterials,
        reports: renderReports,
        syllabus: renderSyllabus,
        exams: renderExams,
        resources: renderResources,
        remarks: renderRemarks,
        profile: renderProfile,
        help: renderHelp,
    };

    async function render() {
        const root = document.getElementById('portalRoot');
        if (!root) return;

        root.innerHTML =
            renderTopbar() +
            '<div class="portal-shell">' + renderSidebar() +
            '<main class="portal-main" id="portalMain">' +
            '<div id="portalSection">' + loadingState() + '</div>' +
            '</main></div>';

        bindShell();

        if (!loaders[state.section]) {
            paint('<div id="portalSection">' + renderers[state.section]() + '</div>');
            return;
        }

        try {
            if (!state['loaded_' + state.section] || state.section === 'dashboard') {
                await loaders[state.section]();
            }
            paintSection(renderers[state.section]());
        } catch (err) {
            paintSection('<div class="card">' + emptyState('⚠', err.message) + '</div>');
        }
    }

    function paintSection(html) {
        const el = document.getElementById('portalSection');
        if (el) el.innerHTML = html;
        bindSection();
    }

    function paint(html) {
        const root = document.getElementById('portalRoot');
        if (root) {
            root.innerHTML = html;
            bindSection();
        }
    }

    function markLoaded(section) {
        state['loaded_' + section] = true;
    }

    // ------------------------------------------------------------------
    // Events
    // ------------------------------------------------------------------
    function bindShell() {
        const root = document.getElementById('portalRoot');
        if (!root) return;

        root.querySelectorAll('[data-portal-nav]').forEach(function (btn) {
            btn.addEventListener('click', function () { go(btn.getAttribute('data-portal-nav')); });
        });

        const menu = root.querySelector('[data-portal-menu]');
        if (menu) {
            menu.addEventListener('click', function () {
                state.sidebarOpen = !state.sidebarOpen;
                const sidebar = document.getElementById('portalSidebar');
                if (sidebar) sidebar.classList.toggle('portal-sidebar--open', state.sidebarOpen);
            });
        }

        const notif = root.querySelector('[data-portal-notif]');
        if (notif) {
            notif.addEventListener('click', async function () {
                state.notifOpen = !state.notifOpen;
                if (state.notifOpen && !state.notifications.length) {
                    try {
                        state.notifications = await api('/portal/notifications');
                        await api('/portal/notifications/read', { method: 'POST', body: '{}' });
                    } catch (e) { /* ignore */ }
                }
                render();
            });
        }

        const logout = root.querySelector('[data-portal-logout]');
        if (logout) {
            logout.addEventListener('click', function () {
                localStorage.removeItem('academy_token');
                localStorage.removeItem('academy_user');
                window.location.href = window.AppPath('/academy/login');
            });
        }

        const home = root.querySelector('[data-portal-home]');
        if (home) {
            home.addEventListener('click', function (e) { e.preventDefault(); go('dashboard'); });
        }
    }

    function bindSection() {
        const root = document.getElementById('portalRoot');
        if (!root) return;

        root.querySelectorAll('[data-portal-nav]').forEach(function (btn) {
            if (btn.dataset.bound) return;
            btn.dataset.bound = '1';
            btn.addEventListener('click', function () { go(btn.getAttribute('data-portal-nav')); });
        });

        root.querySelectorAll('[data-cal-prev]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const anchor = state.calMonth || new Date();
                state.calMonth = new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1);
                refreshClasses();
            });
        });
        root.querySelectorAll('[data-cal-next]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const anchor = state.calMonth || new Date();
                state.calMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1);
                refreshClasses();
            });
        });

        root.querySelectorAll('[data-classview]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.classView = btn.getAttribute('data-classview');
                paintSection(renderClasses());
            });
        });
        root.querySelectorAll('[data-billingtab]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.billingTab = btn.getAttribute('data-billingtab');
                paintSection(renderBilling());
            });
        });
        root.querySelectorAll('[data-assignmenttab]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.assignmentTab = btn.getAttribute('data-assignmenttab');
                paintSection(renderAssignments());
            });
        });
        root.querySelectorAll('[data-matfilter]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.materialFilter = btn.getAttribute('data-matfilter');
                paintSection(renderMaterials());
            });
        });
        root.querySelectorAll('[data-restab]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                state.resourceTab = btn.getAttribute('data-restab');
                paintSection(renderResources());
            });
        });
        root.querySelectorAll('[data-child]').forEach(function (btn) {
            btn.addEventListener('click', async function () {
                state.activeStudentId = btn.getAttribute('data-child');
                state.loaded_dashboard = false;
                state.loaded_syllabus = false;
                await render();
            });
        });

        root.querySelectorAll('[data-action]').forEach(function (btn) {
            btn.addEventListener('click', handleAction);
        });
    }

    async function refreshClasses() {
        try {
            await loadClasses();
            paintSection(state.section === 'classes' ? renderClasses() : renderStudentDashboard());
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    // ------------------------------------------------------------------
    // Actions (modals + API writes)
    // ------------------------------------------------------------------
    function openModal(html) {
        closeModal();
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-p-backdrop';
        backdrop.id = 'portalModal';
        backdrop.innerHTML = '<div class="modal-p">' + html + '</div>';
        backdrop.addEventListener('click', function (e) {
            if (e.target === backdrop) closeModal();
        });
        document.body.appendChild(backdrop);
        backdrop.querySelectorAll('[data-modal-close]').forEach(function (btn) {
            btn.addEventListener('click', closeModal);
        });
        return backdrop;
    }

    function closeModal() {
        const el = document.getElementById('portalModal');
        if (el) el.remove();
    }

    function modalShell(title, sub, bodyHtml) {
        return '<h3 class="modal-p__title">' + esc(title) + '</h3>' +
            (sub ? '<p class="modal-p__sub">' + esc(sub) + '</p>' : '') +
            bodyHtml;
    }

    async function handleAction(event) {
        const btn = event.currentTarget;
        const action = btn.getAttribute('data-action');
        const id = btn.getAttribute('data-id');

        try {
            if (action === 'download') {
                await downloadFile(btn.getAttribute('data-name'), btn.getAttribute('data-filename'));
                return;
            }
            if (action === 'complete-session') return completeSession(id);
            if (action === 'flag-session') return flagSession(id);
            if (action === 'cancel-session') return cancelSession(id);
            if (action === 'reschedule-session') return rescheduleSession(id);
            if (action === 'new-session') return newSessionModal();
            if (action === 'submit-homework') return submitHomeworkModal(id);
            if (action === 'review-submission') return reviewModal(id);
            if (action === 'new-assignment') return newAssignmentModal();
            if (action === 'new-material') return newMaterialModal();
            if (action === 'new-report') return newReportModal();
            if (action === 'publish-report') return publishReport(id);
            if (action === 'view-report') return viewReport(id);
            if (action === 'pay-invoice') return payInvoice(id);
            if (action === 'progress') return updateProgress(btn.getAttribute('data-item'), btn.getAttribute('data-status'));
            if (action === 'new-exam') return newExamModal();
            if (action === 'new-milestone') return newMilestoneModal();
            if (action === 'exam-status') return examStatusModal(id);
            if (action === 'edit-profile') return editProfileModal();
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    function enrolOptions() {
        return state.enrollments.map(function (e) {
            return '<option value="' + esc(e.id) + '">' + esc(e.student_name + ' — ' + e.programme_name) + '</option>';
        }).join('');
    }

    async function completeSession(id) {
        openModal(modalShell('Mark Class Completed', 'Record topics covered and faculty remarks.', '' +
            '<form class="form-p" id="completeForm">' +
            '<div class="field-p"><label>Topics covered</label><textarea name="topics_covered" placeholder="Scales, pieces, theory…"></textarea></div>' +
            '<div class="field-p"><label>Faculty remarks</label><textarea name="faculty_remarks" placeholder="How did the student do?"></textarea></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Mark Completed</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('completeForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            await api('/sessions/' + id + '/complete', { method: 'POST', body: JSON.stringify(data) });
            closeModal();
            toast('Class marked completed');
            state.sessions = [];
            await refreshAll();
        });
    }

    async function flagSession(id) {
        openModal(modalShell('Request Reschedule', 'The class stays on the schedule until the academy confirms a new time.', '' +
            '<form class="form-p" id="flagForm">' +
            '<div class="field-p"><label>Reason</label><textarea name="reason" required placeholder="Why does this class need to move?"></textarea></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Send Request</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('flagForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            await api('/sessions/' + id + '/flag-reschedule', { method: 'POST', body: JSON.stringify(data) });
            closeModal();
            toast('Reschedule request sent');
            await refreshAll();
        });
    }

    async function cancelSession(id) {
        if (!window.confirm('Cancel this class?')) return;
        await api('/sessions/' + id + '/cancel', { method: 'POST', body: JSON.stringify({ reason: 'Cancelled by faculty' }) });
        toast('Class cancelled');
        await refreshAll();
    }

    async function rescheduleSession(id) {
        openModal(modalShell('Schedule Replacement', 'The original class stays in history; a new session is created.', '' +
            '<form class="form-p" id="reschForm">' +
            '<div class="field-row-p">' +
            '<div class="field-p"><label>Date</label><input type="date" name="new_date" required></div>' +
            '<div class="field-p"><label>Start</label><input type="time" name="new_start" value="10:00" required></div>' +
            '<div class="field-p"><label>End</label><input type="time" name="new_end" value="11:00" required></div>' +
            '</div>' +
            '<div class="field-p"><label>Reason</label><input type="text" name="reason" value="Faculty rescheduled" required></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Create Replacement</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('reschForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            await api('/sessions/' + id + '/reschedule', { method: 'POST', body: JSON.stringify(data) });
            closeModal();
            toast('Replacement class scheduled');
            await refreshAll();
        });
    }

    async function newSessionModal() {
        if (!state.enrollments.length) state.enrollments = await api('/portal/enrollments');
        if (!state.enrollments.length) {
            toast('No enrolments available for scheduling', 'error');
            return;
        }
        openModal(modalShell('New Class Session', 'Standard sessions are at least 60 minutes.', '' +
            '<form class="form-p" id="sessForm">' +
            '<div class="field-p"><label>Enrolment</label><select name="enrollment_id" required>' + enrolOptions() + '</select></div>' +
            '<div class="field-row-p">' +
            '<div class="field-p"><label>Date</label><input type="date" name="scheduled_date" required></div>' +
            '<div class="field-p"><label>Start</label><input type="time" name="scheduled_start" value="10:00" required></div>' +
            '<div class="field-p"><label>End</label><input type="time" name="scheduled_end" value="11:00" required></div>' +
            '</div>' +
            '<div class="field-p"><label><input type="checkbox" name="is_online" style="width:auto"> Online class</label></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Schedule</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('sessForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const payload = {
                enrollment_id: form.enrollment_id.value,
                scheduled_date: form.scheduled_date.value,
                scheduled_start: form.scheduled_start.value,
                scheduled_end: form.scheduled_end.value,
                is_online: form.is_online.checked,
            };
            await api('/sessions', { method: 'POST', body: JSON.stringify(payload) });
            closeModal();
            toast('Session scheduled');
            await refreshAll();
        });
    }

    async function submitHomeworkModal(id) {
        openModal(modalShell('Submit Homework', 'PDF, JPG or PNG' + (isFaculty() ? '' : ' (audio allowed when enabled)'), '' +
            '<form class="form-p" id="hwForm">' +
            '<div class="field-p"><label>Notes</label><textarea name="notes" placeholder="What did you practise?"></textarea></div>' +
            '<div class="field-p"><label>File</label><input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.mp3" required></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Upload</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('hwForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData();
            fd.append('notes', form.notes.value);
            const file = form.file.files[0];
            if (file) fd.append('files', file, file.name);
            await api('/learning/assignments/' + id + '/submit', { method: 'POST', body: fd });
            closeModal();
            toast('Homework submitted');
            state.loaded_assignments = false;
            await refreshAll();
        });
    }

    async function reviewModal(submissionId) {
        openModal(modalShell('Review Submission', 'Feedback is shared with the student immediately.', '' +
            '<form class="form-p" id="revForm">' +
            '<div class="field-p"><label>Feedback</label><textarea name="feedback" required placeholder="What went well, what to improve"></textarea></div>' +
            '<div class="field-p"><label>Outcome</label><select name="status">' +
            '<option value="reviewed">Reviewed — looks good</option>' +
            '<option value="revision_requested">Request revision</option></select></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Save Review</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('revForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            await api('/learning/submissions/' + submissionId + '/review', { method: 'POST', body: JSON.stringify(data) });
            closeModal();
            toast('Review saved');
            await refreshAll();
        });
    }

    async function newAssignmentModal() {
        if (!state.enrollments.length) state.enrollments = await api('/portal/enrollments');
        if (!state.enrollments.length) {
            toast('No enrolments available', 'error');
            return;
        }
        openModal(modalShell('New Assignment', 'Students see this in their portal immediately.', '' +
            '<form class="form-p" id="asgForm">' +
            '<div class="field-p"><label>Title</label><input name="title" required placeholder="e.g. C major scales"></div>' +
            '<div class="field-p"><label>Instructions</label><textarea name="instructions" placeholder="What to practise and how"></textarea></div>' +
            '<div class="field-row-p">' +
            '<div class="field-p"><label>Enrolment</label><select name="enrollment_id">' + enrolOptions() + '</select></div>' +
            '<div class="field-p"><label>Due date</label><input type="date" name="due_date"></div>' +
            '</div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Create</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('asgForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const payload = {
                title: form.title.value,
                instructions: form.instructions.value || null,
                enrollment_id: form.enrollment_id.value,
                due_date: form.due_date.value || null,
            };
            await api('/learning/assignments', { method: 'POST', body: JSON.stringify(payload) });
            closeModal();
            toast('Assignment created');
            await refreshAll();
        });
    }

    async function newMaterialModal() {
        openModal(modalShell('Upload Study Material', 'Files are validated (PDF/JPG/PNG/audio) and stored securely.', '' +
            '<form class="form-p" id="matForm">' +
            '<div class="field-p"><label>Title</label><input name="title" required></div>' +
            '<div class="field-p"><label>Category</label><select name="category">' +
            ['technique', 'repertoire', 'theory', 'ear_training', 'rhythm', 'exam_preparation', 'practice']
                .map(function (c) { return '<option value="' + c + '">' + c.replace('_', ' ') + '</option>'; }).join('') +
            '</select></div>' +
            '<div class="field-p"><label>Description</label><textarea name="description"></textarea></div>' +
            '<div class="field-p"><label>File (optional if link given)</label><input type="file" name="file" accept=".pdf,.jpg,.jpeg,.png,.mp3"></div>' +
            '<div class="field-p"><label>External link (https://…)</label><input type="url" name="link_url" placeholder="https://"></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Save</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('matForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const fd = new FormData();
            fd.append('title', form.title.value);
            fd.append('category', form.category.value);
            fd.append('description', form.description.value || '');
            if (form.link_url.value) fd.append('link_url', form.link_url.value);
            if (form.file.files[0]) fd.append('file', form.file.files[0]);
            await api('/learning/materials', { method: 'POST', body: fd });
            closeModal();
            toast('Material published');
            await refreshAll();
        });
    }

    async function newReportModal() {
        if (!state.enrollments.length) state.enrollments = await api('/portal/enrollments');
        if (!state.enrollments.length) {
            toast('No enrolments available', 'error');
            return;
        }
        const month = todayYm();
        openModal(modalShell('Monthly Report', 'Draft now, publish when ready — staff notes stay private.', '' +
            '<form class="form-p" id="repForm">' +
            '<div class="field-row-p">' +
            '<div class="field-p"><label>Enrolment</label><select name="enrollment_id">' + enrolOptions() + '</select></div>' +
            '<div class="field-p"><label>Month</label><input type="month" name="report_month" value="' + month + '" required></div>' +
            '</div>' +
            '<div class="field-p"><label>Progress summary</label><textarea name="progress_summary"></textarea></div>' +
            '<div class="field-p"><label>Topics covered</label><textarea name="topics_covered"></textarea></div>' +
            '<div class="field-row-p">' +
            '<div class="field-p"><label>Strengths</label><textarea name="strengths"></textarea></div>' +
            '<div class="field-p"><label>Areas for improvement</label><textarea name="areas_for_improvement"></textarea></div>' +
            '</div>' +
            '<div class="field-p"><label>Next month focus</label><textarea name="next_month_focus"></textarea></div>' +
            '<div class="field-p"><label>Private staff notes (never shown to family)</label><textarea name="staff_notes"></textarea></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Save Draft</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('repForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const enrollment = state.enrollments.find(function (x) { return x.id === form.enrollment_id.value; });
            const payload = {
                student_id: enrollment ? enrollment.student_id : state.activeStudentId,
                enrollment_id: form.enrollment_id.value,
                report_month: form.report_month.value,
                progress_summary: form.progress_summary.value || null,
                topics_covered: form.topics_covered.value || null,
                strengths: form.strengths.value || null,
                areas_for_improvement: form.areas_for_improvement.value || null,
                next_month_focus: form.next_month_focus.value || null,
                staff_notes: form.staff_notes.value || null,
            };
            await api('/learning/reports', { method: 'POST', body: JSON.stringify(payload) });
            closeModal();
            toast('Draft report saved');
            await refreshAll();
        });
    }

    async function publishReport(id) {
        await api('/learning/reports/' + id + '/publish', { method: 'POST', body: '{}' });
        toast('Report published to the family');
        await refreshAll();
    }

    async function viewReport(id) {
        const report = state.reports.find(function (r) { return r.id === id; });
        if (!report) return;
        const blocks = [
            ['Progress Summary', report.progress_summary],
            ['Topics Covered', report.topics_covered],
            ['Strengths', report.strengths],
            ['Areas for Improvement', report.areas_for_improvement],
            ['Practice Recommendations', report.practice_recommendations],
            ['Next Month Focus', report.next_month_focus],
            ['Faculty Remarks', report.faculty_remarks],
        ].map(function (pair) {
            return '<div class="report__block" style="margin-bottom:12px"><h4>' + esc(pair[0]) + '</h4>' +
                '<p>' + esc(pair[1] || '—') + '</p></div>';
        }).join('');
        openModal(modalShell('Faculty Report — ' + monthLabel(report.report_month),
            'Revision ' + report.revision + ' · ' + report.status, blocks));
    }

    async function payInvoice(id) {
        try {
            const order = await api('/billing/payments/orders', { method: 'POST', body: JSON.stringify({ invoice_id: id }) });
            if (order.reused) toast('Continuing the existing payment order');
            toast('Payment order ' + order.order_id + ' created for ' + fmtPaise(order.amount_paise));
        } catch (err) {
            toast(err.message, 'error');
        }
    }

    async function updateProgress(itemId, status) {
        if (!state.activeStudentId) {
            toast('Select a student first (parent accounts)', 'error');
            return;
        }
        await api('/learning/syllabus-progress/' + itemId +
            '?student_id=' + state.activeStudentId + '&enrollment_id=' + (state.enrollments[0] ? state.enrollments[0].id : ''),
            { method: 'POST', body: JSON.stringify({ status: status }) });
        toast('Progress updated');
        state.loaded_syllabus = false;
        await refreshAll();
    }

    async function newExamModal() {
        if (!state.enrollments.length) state.enrollments = await api('/portal/enrollments');
        openModal(modalShell('Add Exam', 'Board exams, graded assessments or recitals.', '' +
            '<form class="form-p" id="examForm">' +
            '<div class="field-p"><label>Enrolment</label><select name="enrollment_id">' + enrolOptions() + '</select></div>' +
            '<div class="field-row-p">' +
            '<div class="field-p"><label>Board</label><input name="board" value="Trinity" required></div>' +
            '<div class="field-p"><label>Grade</label><input name="grade" placeholder="1"></div>' +
            '<div class="field-p"><label>Instrument</label><input name="instrument" required></div>' +
            '</div>' +
            '<div class="field-p"><label>Submission deadline</label><input type="date" name="submission_deadline"></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Save</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('examForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const enrollment = state.enrollments.find(function (x) { return x.id === form.enrollment_id.value; });
            const payload = {
                student_id: enrollment ? enrollment.student_id : null,
                enrollment_id: form.enrollment_id.value,
                board: form.board.value,
                grade: form.grade.value || null,
                instrument: form.instrument.value,
                submission_deadline: form.submission_deadline.value || null,
            };
            await api('/learning/exams', { method: 'POST', body: JSON.stringify(payload) });
            closeModal();
            toast('Exam added');
            await refreshAll();
        });
    }

    async function examStatusModal(id) {
        const exam = state.exams.find(function (x) { return x.id === id; });
        if (!exam) return;
        openModal(modalShell('Update Exam', exam.board + ' Grade ' + (exam.grade || '—'), '' +
            '<form class="form-p" id="exUpd">' +
            '<div class="field-p"><label>Application status</label><select name="application_status">' +
            ['not_started', 'in_progress', 'submitted', 'confirmed'].map(function (s) {
                return '<option' + (exam.application_status === s ? ' selected' : '') + '>' + s + '</option>';
            }).join('') + '</select></div>' +
            '<div class="field-p"><label>Readiness</label><select name="readiness">' +
            ['', 'on_track', 'needs_work', 'ready'].map(function (s) {
                return '<option value="' + s + '"' + (exam.readiness === s ? ' selected' : '') + '>' + (s || 'unset') + '</option>';
            }).join('') + '</select></div>' +
            '<div class="field-p"><label>Notes</label><textarea name="notes">' + esc(exam.notes || '') + '</textarea></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Save</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('exUpd').addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            await api('/learning/exams/' + id, { method: 'PATCH', body: JSON.stringify(data) });
            closeModal();
            toast('Exam updated');
            await refreshAll();
        });
    }

    async function newMilestoneModal() {
        if (!state.enrollments.length) state.enrollments = await api('/portal/enrollments');
        openModal(modalShell('Add Milestone', 'Achievements, recitals or goals.', '' +
            '<form class="form-p" id="msForm">' +
            '<div class="field-p"><label>Student enrolment</label><select name="enrollment_id">' + enrolOptions() + '</select></div>' +
            '<div class="field-p"><label>Title</label><input name="title" required></div>' +
            '<div class="field-p"><label>Description</label><textarea name="description"></textarea></div>' +
            '<div class="field-p"><label>Due date</label><input type="date" name="due_date"></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Save</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('msForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const form = e.target;
            const enrollment = state.enrollments.find(function (x) { return x.id === form.enrollment_id.value; });
            await api('/learning/milestones', {
                method: 'POST',
                body: JSON.stringify({
                    student_id: enrollment ? enrollment.student_id : null,
                    enrollment_id: form.enrollment_id.value,
                    title: form.title.value,
                    description: form.description.value || null,
                    due_date: form.due_date.value || null,
                }),
            });
            closeModal();
            toast('Milestone added');
            await refreshAll();
        });
    }

    async function editProfileModal() {
        const student = (state.me || {}).student || {};
        openModal(modalShell('Edit Profile', 'Name, CMA ID and DOB are managed by the academy.', '' +
            '<form class="form-p" id="profForm">' +
            '<div class="field-p"><label>Phone</label><input name="phone" value="' + esc(student.phone || '') + '" placeholder="+91…"></div>' +
            '<div class="field-p"><label>Address</label><textarea name="address">' + esc(student.address || '') + '</textarea></div>' +
            '<div class="field-p"><label>Skill level</label><select name="skill_level">' +
            ['', 'beginner', 'intermediate', 'advanced'].map(function (s) {
                return '<option value="' + s + '"' + (student.skill_level === s ? ' selected' : '') + '>' + (s || 'unset') + '</option>';
            }).join('') + '</select></div>' +
            '<div class="btn-row"><button type="submit" class="btn-p">Save</button>' +
            '<button type="button" class="btn-p btn-p--ghost" data-modal-close>Cancel</button></div>' +
            '</form>'));
        document.getElementById('profForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.target).entries());
            await api('/portal/profile', { method: 'PATCH', body: JSON.stringify(data) });
            closeModal();
            toast('Profile updated');
            state.me = await api('/portal/me');
            await render();
        });
    }

    // ------------------------------------------------------------------
    // Boot
    // ------------------------------------------------------------------
    async function refreshAll() {
        Object.keys(state).forEach(function (key) {
            if (key.indexOf('loaded_') === 0) state[key] = false;
        });
        await render();
    }

    async function init() {
        const stored = storedUser();
        if (!token() || ['student', 'parent', 'instructor'].indexOf(stored.role) < 0) {
            window.location.href = window.AppPath('/academy/login');
            return;
        }
        state.role = stored.role;
        state.section = sectionFromPath();
        state.calMonth = new Date();
        state.activeStudentId = null;

        try {
            state.me = await api('/portal/me');
            if (state.role === 'parent') {
                state.children = (state.me.children || []);
                if (state.children.length) state.activeStudentId = state.children[0].id;
            }
            state.notifications = await api('/portal/notifications');
            const materialsPromise = api('/learning/materials').then(function (m) {
                state.materials = m;
            }).catch(function () { state.materials = []; });
            const enrollmentsPromise = api('/portal/enrollments').then(function (e) {
                state.enrollments = e;
            }).catch(function () { state.enrollments = []; });
            await Promise.all([materialsPromise, enrollmentsPromise]);
        } catch (err) {
            console.error('Portal init failed', err);
        }

        await render();

        if (!window.__portalPopstateBound) {
            window.__portalPopstateBound = true;
            window.addEventListener('popstate', function () {
                const section = sectionFromPath();
                if (section !== state.section && document.getElementById('portalRoot')) {
                    state.section = section;
                    render();
                }
            });
        }
    }

    return {
        init: init,
        navigate: go,
    };
})();
