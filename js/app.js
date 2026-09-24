/* ============================================
   ChankArts Music Academy - Application
   Learn. Create. Perform.
   ============================================ */

(function() {
    'use strict';

    // ========================================
    // Course Catalogue (Data-driven)
    // ========================================
    const COURSE_CATALOGUE = [
        {
            category: 'Piano / Keyboard',
            programmes: [
                { id: 'piano', name: 'Piano' },
                { id: 'electronic_keyboard', name: 'Electronic Keyboard' }
            ]
        },
        {
            category: 'Guitar',
            programmes: [
                { id: 'acoustic_guitar', name: 'Acoustic Guitar' },
                { id: 'electric_guitar', name: 'Electric Guitar' },
                { id: 'bass_guitar', name: 'Bass Guitar' }
            ]
        },
        {
            category: 'Indian Classical',
            programmes: [
                { id: 'indian_bansuri', name: 'Indian Bansuri' }
            ]
        },
        {
            category: 'Other Programmes',
            programmes: [
                { id: 'ukulele', name: 'Ukulele' },
                { id: 'western_vocals', name: 'Western Vocals' },
                { id: 'music_theory', name: 'Music Theory / Foundation Music Theory' }
            ]
        }
    ];

    // ========================================
    // Configuration
    // ========================================
    const CONFIG = {
        routes: {
            '/academy/': 'home',
            '/academy/login': 'login',
            '/academy/register': 'register',
            '/academy/forgot-password': 'forgot-password',
            '/academy/admin': 'admin',
            '/academy/admin/': 'admin',
            '/academy/registration-success': 'registration-success',
        },
        defaultRoute: '/academy/'
    };

    // ========================================
    // Registration State
    // ========================================
    const registrationState = {
        currentStep: 1,
        totalSteps: 4,
        data: {
            // Step 1: Account
            fullName: '',
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
            // Step 2: Student Details
            dateOfBirth: '',
            isMinor: false,
            address: '',
            // Guardian fields
            guardianName: '',
            guardianRelationship: '',
            guardianEmail: '',
            guardianMobile: '',
            // Step 3: Programmes
            selectedProgrammes: []
        }
    };

    // ========================================
    // State
    // ========================================
    const state = {
        currentRoute: null,
        isAuthenticated: false,
        user: null
    };

    // ========================================
    // Router
    // ========================================
    const Router = {
        init() {
            window.addEventListener('popstate', () => this.handleRoute());
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[data-route]');
                if (link) {
                    e.preventDefault();
                    const route = link.getAttribute('href');
                    this.navigate(route);
                }
            });
            this.handleRoute();
        },

        navigate(route) {
            window.history.pushState({}, '', route);
            this.handleRoute();
        },

        handleRoute() {
            const path = window.location.pathname;
            const page = CONFIG.routes[path] || 'home';
            
            if (state.currentRoute === page) return;
            
            state.currentRoute = page;
            this.render(page);
            this.updateActiveLinks(page);
        },

        render(page) {
            const main = document.getElementById('mainContent');
            main.innerHTML = '';
            
            const content = Pages[page]();
            if (content) {
                main.appendChild(content);
            }
        },

        updateActiveLinks(page) {
            document.querySelectorAll('[data-route]').forEach(link => {
                const route = link.dataset.route;
                link.classList.toggle('header__nav-link--active', route === page);
            });
        }
    };

    // ========================================
    // Utility Functions
    // ========================================
    function calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function showError(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add('auth__error--visible');
    }

    function hideError(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('auth__error--visible');
    }

    function clearAllErrors() {
        document.querySelectorAll('.auth__error').forEach(el => {
            el.classList.remove('auth__error--visible');
        });
    }

    // ========================================
    // Registration Step Renderers
    // ========================================
    function renderStep1() {
        return `
            <div class="reg__step" data-step="1">
                <div class="reg__step-header">
                    <h2 class="reg__step-title">Account Details</h2>
                    <p class="reg__step-subtitle">Create your Academy account credentials</p>
                </div>
                <div class="reg__fields">
                    <div class="auth__field">
                        <label class="auth__label" for="regFullName">Full Name <span class="reg__required">*</span></label>
                        <input 
                            type="text" 
                            id="regFullName" 
                            class="auth__input" 
                            placeholder="Enter your full name"
                            autocomplete="name"
                            value="${registrationState.data.fullName}"
                        >
                        <span class="auth__error" id="regFullNameError">Please enter your full name</span>
                    </div>
                    <div class="auth__field">
                        <label class="auth__label" for="regEmail">Email Address <span class="reg__required">*</span></label>
                        <input 
                            type="email" 
                            id="regEmail" 
                            class="auth__input" 
                            placeholder="you@example.com"
                            autocomplete="email"
                            value="${registrationState.data.email}"
                        >
                        <span class="auth__error" id="regEmailError">Please enter a valid email</span>
                    </div>
                    <div class="auth__field">
                        <label class="auth__label" for="regMobile">Mobile Number <span class="reg__required">*</span></label>
                        <input 
                            type="tel" 
                            id="regMobile" 
                            class="auth__input" 
                            placeholder="+91 XXXXX XXXXX"
                            autocomplete="tel"
                            value="${registrationState.data.mobile}"
                        >
                        <span class="auth__error" id="regMobileError">Please enter a valid mobile number</span>
                    </div>
                    <div class="auth__field">
                        <label class="auth__label" for="regPassword">Password <span class="reg__required">*</span></label>
                        <div class="auth__password-wrapper">
                            <input 
                                type="password" 
                                id="regPassword" 
                                class="auth__input" 
                                placeholder="Create a password (min 8 characters)"
                                autocomplete="new-password"
                            >
                            <button type="button" class="auth__password-toggle" id="toggleRegPassword">Show</button>
                        </div>
                        <span class="auth__error" id="regPasswordError">Password must be at least 8 characters</span>
                    </div>
                    <div class="auth__field">
                        <label class="auth__label" for="regConfirmPassword">Confirm Password <span class="reg__required">*</span></label>
                        <input 
                            type="password" 
                            id="regConfirmPassword" 
                            class="auth__input" 
                            placeholder="Confirm your password"
                            autocomplete="new-password"
                        >
                        <span class="auth__error" id="regConfirmError">Passwords do not match</span>
                    </div>
                </div>
            </div>
        `;
    }

    function renderStep2() {
        const isMinor = registrationState.data.isMinor;
        return `
            <div class="reg__step" data-step="2">
                <div class="reg__step-header">
                    <h2 class="reg__step-title">Student Details</h2>
                    <p class="reg__step-subtitle">Tell us about the student</p>
                </div>
                <div class="reg__fields">
                    <div class="auth__field">
                        <label class="auth__label" for="regDOB">Date of Birth <span class="reg__required">*</span></label>
                        <input 
                            type="date" 
                            id="regDOB" 
                            class="auth__input" 
                            value="${registrationState.data.dateOfBirth}"
                        >
                        <span class="auth__error" id="regDOBError">Please enter a valid date of birth</span>
                    </div>
                    <div class="auth__field">
                        <label class="auth__label" for="regAddress">Address</label>
                        <textarea 
                            id="regAddress" 
                            class="auth__input auth__textarea" 
                            placeholder="Enter your address (optional)"
                            rows="3"
                        >${registrationState.data.address}</textarea>
                    </div>
                    
                    <div class="reg__guardian-section" id="guardianSection" style="display: ${isMinor ? 'block' : 'none'}">
                        <div class="reg__guardian-header">
                            <h3 class="reg__guardian-title">Parent/Guardian Information</h3>
                            <p class="reg__guardian-subtitle">Required for students under 18 years</p>
                        </div>
                        <div class="auth__field">
                            <label class="auth__label" for="regGuardianName">Parent/Guardian Name <span class="reg__required">*</span></label>
                            <input 
                                type="text" 
                                id="regGuardianName" 
                                class="auth__input" 
                                placeholder="Enter parent/guardian name"
                                value="${registrationState.data.guardianName}"
                            >
                            <span class="auth__error" id="regGuardianNameError">Parent/guardian name is required for minors</span>
                        </div>
                        <div class="auth__field">
                            <label class="auth__label" for="regGuardianRelationship">Relationship <span class="reg__required">*</span></label>
                            <select id="regGuardianRelationship" class="auth__input auth__select">
                                <option value="">Select relationship</option>
                                <option value="parent" ${registrationState.data.guardianRelationship === 'parent' ? 'selected' : ''}>Parent</option>
                                <option value="guardian" ${registrationState.data.guardianRelationship === 'guardian' ? 'selected' : ''}>Guardian</option>
                                <option value="other" ${registrationState.data.guardianRelationship === 'other' ? 'selected' : ''}>Other</option>
                            </select>
                            <span class="auth__error" id="regGuardianRelError">Please select a relationship</span>
                        </div>
                        <div class="auth__field">
                            <label class="auth__label" for="regGuardianEmail">Parent/Guardian Email</label>
                            <input 
                                type="email" 
                                id="regGuardianEmail" 
                                class="auth__input" 
                                placeholder="guardian@example.com"
                                value="${registrationState.data.guardianEmail}"
                            >
                            <span class="auth__error" id="regGuardianEmailError">Please enter a valid email</span>
                        </div>
                        <div class="auth__field">
                            <label class="auth__label" for="regGuardianMobile">Parent/Guardian Mobile <span class="reg__required">*</span></label>
                            <input 
                                type="tel" 
                                id="regGuardianMobile" 
                                class="auth__input" 
                                placeholder="+91 XXXXX XXXXX"
                                value="${registrationState.data.guardianMobile}"
                            >
                            <span class="auth__error" id="regGuardianMobileError">Parent/guardian mobile is required for minors</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderStep3() {
        const selected = registrationState.data.selectedProgrammes;
        return `
            <div class="reg__step" data-step="3">
                <div class="reg__step-header">
                    <h2 class="reg__step-title">What Would You Like to Learn?</h2>
                    <p class="reg__step-subtitle">Select one or more programmes</p>
                </div>
                <div class="reg__programmes">
                    <p class="reg__programmes-note">
                        You can choose more than one programme. Your Academy account and CMA Registration ID will remain the same.
                    </p>
                    
                    ${selected.length > 0 ? `
                        <div class="reg__selected">
                            <h4 class="reg__selected-title">Selected Programmes</h4>
                            <div class="reg__selected-list">
                                ${selected.map(p => `
                                    <span class="reg__selected-item">
                                        ${p.name}
                                        <button type="button" class="reg__selected-remove" data-id="${p.id}" aria-label="Remove ${p.name}">×</button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="reg__categories">
                        ${COURSE_CATALOGUE.map(cat => `
                            <div class="reg__category">
                                <h3 class="reg__category-title">${cat.category}</h3>
                                <div class="reg__category-programmes">
                                    ${cat.programmes.map(prog => {
                                        const isSelected = selected.some(p => p.id === prog.id);
                                        return `
                                            <button type="button" class="reg__programme ${isSelected ? 'reg__programme--selected' : ''}" data-id="${prog.id}" data-name="${prog.name}">
                                                <span class="reg__programme-check">${isSelected ? '✓' : ''}</span>
                                                <span class="reg__programme-name">${prog.name}</span>
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <span class="auth__error" id="regProgrammeError">Please select at least one programme</span>
                </div>
            </div>
        `;
    }

    function renderStep4() {
        const { data } = registrationState;
        const programmes = data.selectedProgrammes.map(p => p.name).join(', ');
        return `
            <div class="reg__step" data-step="4">
                <div class="reg__step-header">
                    <h2 class="reg__step-title">Review Your Details</h2>
                    <p class="reg__step-subtitle">Please confirm your information before creating your account</p>
                </div>
                <div class="reg__review">
                    <div class="reg__review-section">
                        <h3 class="reg__review-title">Account Information</h3>
                        <div class="reg__review-row">
                            <span class="reg__review-label">Name</span>
                            <span class="reg__review-value">${data.fullName}</span>
                        </div>
                        <div class="reg__review-row">
                            <span class="reg__review-label">Email</span>
                            <span class="reg__review-value">${data.email}</span>
                        </div>
                        <div class="reg__review-row">
                            <span class="reg__review-label">Mobile</span>
                            <span class="reg__review-value">${data.mobile}</span>
                        </div>
                    </div>
                    
                    <div class="reg__review-section">
                        <h3 class="reg__review-title">Student Details</h3>
                        <div class="reg__review-row">
                            <span class="reg__review-label">Date of Birth</span>
                            <span class="reg__review-value">${new Date(data.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <div class="reg__review-row">
                            <span class="reg__review-label">Age</span>
                            <span class="reg__review-value">${calculateAge(data.dateOfBirth)} years</span>
                        </div>
                        ${data.address ? `
                            <div class="reg__review-row">
                                <span class="reg__review-label">Address</span>
                                <span class="reg__review-value">${data.address}</span>
                            </div>
                        ` : ''}
                        ${data.isMinor ? `
                            <div class="reg__review-section reg__review-section--nested">
                                <h4 class="reg__review-title reg__review-title--sub">Parent/Guardian</h4>
                                <div class="reg__review-row">
                                    <span class="reg__review-label">Name</span>
                                    <span class="reg__review-value">${data.guardianName}</span>
                                </div>
                                <div class="reg__review-row">
                                    <span class="reg__review-label">Relationship</span>
                                    <span class="reg__review-value">${data.guardianRelationship}</span>
                                </div>
                                ${data.guardianEmail ? `
                                    <div class="reg__review-row">
                                        <span class="reg__review-label">Email</span>
                                        <span class="reg__review-value">${data.guardianEmail}</span>
                                    </div>
                                ` : ''}
                                <div class="reg__review-row">
                                    <span class="reg__review-label">Mobile</span>
                                    <span class="reg__review-value">${data.guardianMobile}</span>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="reg__review-section">
                        <h3 class="reg__review-title">Selected Programmes</h3>
                        <div class="reg__review-programmes">
                            ${data.selectedProgrammes.map(p => `
                                <span class="reg__review-programme">✓ ${p.name}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================
    // Pages
    // ========================================
    const Pages = {
        home() {
            const div = document.createElement('div');
            div.className = 'page';
            div.innerHTML = `
                <section class="hero">
                    <div class="hero__bg"></div>
                    <div class="hero__content">
                        <img src="assets/ChankArts Music Academy.png" alt="ChankArts Music Academy" class="hero__logo">
                        <div class="hero__badge">
                            <span class="hero__badge-dot"></span>
                            Now Enrolling
                        </div>
                        <h1 class="hero__title">
                            Welcome to
                            <span class="hero__title-accent">ChankArts Music Academy</span>
                        </h1>
                        <p class="hero__tagline">Learn. Create. Perform.</p>
                        <p class="hero__description">
                            Your digital learning space for music education. Access courses, track your progress,
                            connect with instructors, and pursue your musical journey with Trinity and Rockschool certifications.
                        </p>
                        <div class="hero__actions">
                            <a href="/academy/login" class="btn btn--primary btn--large" data-route="login">
                                Login to Academy
                            </a>
                            <a href="/academy/register" class="btn btn--secondary btn--large" data-route="register">
                                Create Account
                            </a>
                        </div>
                        <div class="hero__features">
                            <div class="hero__feature">
                                <div class="hero__feature-icon">🎵</div>
                                <h3 class="hero__feature-title">Learn</h3>
                                <p class="hero__feature-text">Access structured courses in piano, guitar, vocals, and more</p>
                            </div>
                            <div class="hero__feature">
                                <div class="hero__feature-icon">✨</div>
                                <h3 class="hero__feature-title">Create</h3>
                                <p class="hero__feature-text">Work on projects, compose music, and develop your artistry</p>
                            </div>
                            <div class="hero__feature">
                                <div class="hero__feature-icon">🎤</div>
                                <h3 class="hero__feature-title">Perform</h3>
                                <p class="hero__feature-text">Prepare for exams, certifications, and live performances</p>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            return div;
        },

        login() {
            const div = document.createElement('div');
            div.className = 'page';
            div.innerHTML = `
                <section class="auth">
                    <div class="auth__bg"></div>
                    <div class="auth__container">
                        <div class="auth__card">
                            <div class="auth__header">
                                <img src="assets/ChankArts Music Academy.png" alt="ChankArts Music Academy" class="auth__header-logo">
                                <h1 class="auth__title">Welcome Back</h1>
                                <p class="auth__subtitle">Sign in to your academy account</p>
                            </div>
                            <form class="auth__form" id="loginForm">
                                <div class="auth__field">
                                    <label class="auth__label" for="loginEmail">Email or Username</label>
                                    <input 
                                        type="text" 
                                        id="loginEmail" 
                                        class="auth__input" 
                                        placeholder="Enter your email or username"
                                        autocomplete="username"
                                        required
                                    >
                                    <span class="auth__error" id="loginEmailError">Please enter a valid email or username</span>
                                </div>
                                <div class="auth__field">
                                    <label class="auth__label" for="loginPassword">Password</label>
                                    <div class="auth__password-wrapper">
                                        <input 
                                            type="password" 
                                            id="loginPassword" 
                                            class="auth__input" 
                                            placeholder="Enter your password"
                                            autocomplete="current-password"
                                            required
                                        >
                                        <button type="button" class="auth__password-toggle" id="togglePassword">Show</button>
                                    </div>
                                    <span class="auth__error" id="loginPasswordError">Password is required</span>
                                </div>
                                <div class="auth__forgot">
                                    <a href="/academy/forgot-password" class="auth__forgot-link" data-route="forgot-password">Forgot password?</a>
                                </div>
                                <button type="submit" class="btn btn--primary btn--full btn--large">Sign In</button>
                            </form>
                            <div class="auth__footer">
                                Don't have an account? 
                                <a href="/academy/register" class="auth__footer-link" data-route="register">Register here</a>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            
            setTimeout(() => {
                const form = div.querySelector('#loginForm');
                const toggleBtn = div.querySelector('#togglePassword');
                
                if (form) form.addEventListener('submit', handleLogin);
                if (toggleBtn) {
                    toggleBtn.addEventListener('click', () => {
                        const passwordInput = div.querySelector('#loginPassword');
                        const type = passwordInput.type === 'password' ? 'text' : 'password';
                        passwordInput.type = type;
                        toggleBtn.textContent = type === 'password' ? 'Show' : 'Hide';
                    });
                }
            }, 0);
            
            return div;
        },

        register() {
            // Reset registration state when entering register page
            registrationState.currentStep = 1;
            
            const div = document.createElement('div');
            div.className = 'page';
            div.innerHTML = `
                <section class="auth reg">
                    <div class="auth__bg"></div>
                    <div class="auth__container reg__container">
                        <div class="auth__card reg__card">
                            <div class="auth__header">
                                <img src="assets/ChankArts Music Academy.png" alt="ChankArts Music Academy" class="auth__header-logo">
                                <h1 class="auth__title">Create Your Academy Account</h1>
                                <p class="auth__subtitle">Learn. Create. Perform.</p>
                            </div>
                            
                            <div class="reg__progress">
                                <div class="reg__progress-steps">
                                    <div class="reg__progress-step reg__progress-step--active" data-step="1">
                                        <span class="reg__progress-number">1</span>
                                        <span class="reg__progress-label">Account</span>
                                    </div>
                                    <div class="reg__progress-line"></div>
                                    <div class="reg__progress-step" data-step="2">
                                        <span class="reg__progress-number">2</span>
                                        <span class="reg__progress-label">Details</span>
                                    </div>
                                    <div class="reg__progress-line"></div>
                                    <div class="reg__progress-step" data-step="3">
                                        <span class="reg__progress-number">3</span>
                                        <span class="reg__progress-label">Programmes</span>
                                    </div>
                                    <div class="reg__progress-line"></div>
                                    <div class="reg__progress-step" data-step="4">
                                        <span class="reg__progress-number">4</span>
                                        <span class="reg__progress-label">Review</span>
                                    </div>
                                </div>
                            </div>
                            
                            <form class="auth__form reg__form" id="registerForm">
                                <div class="reg__steps" id="regSteps">
                                    ${renderStep1()}
                                </div>
                                
                                <div class="reg__actions">
                                    <button type="button" class="btn btn--secondary" id="regPrev" style="display: none;">
                                        Previous
                                    </button>
                                    <button type="button" class="btn btn--primary" id="regNext">
                                        Continue
                                    </button>
                                </div>
                            </form>
                            
                            <div class="auth__footer">
                                Already have an account? 
                                <a href="/academy/login" class="auth__footer-link" data-route="login">Sign in</a>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            
            setTimeout(() => {
                initRegistration();
            }, 0);
            
            return div;
        },

        'forgot-password'() {
            const div = document.createElement('div');
            div.className = 'page';
            div.innerHTML = `
                <section class="auth">
                    <div class="auth__bg"></div>
                    <div class="auth__container">
                        <div class="auth__card">
                            <div class="auth__header">
                                <img src="assets/ChankArts Music Academy.png" alt="ChankArts Music Academy" class="auth__header-logo">
                                <h1 class="auth__title">Reset Password</h1>
                                <p class="auth__subtitle">Enter your email to receive reset instructions</p>
                            </div>
                            <form class="auth__form" id="forgotForm">
                                <div class="auth__field">
                                    <label class="auth__label" for="forgotEmail">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="forgotEmail" 
                                        class="auth__input" 
                                        placeholder="you@example.com"
                                        autocomplete="email"
                                        required
                                    >
                                    <span class="auth__error" id="forgotEmailError">Please enter a valid email</span>
                                </div>
                                <button type="submit" class="btn btn--primary btn--full btn--large">Send Reset Link</button>
                            </form>
                            <div class="auth__footer">
                                Remember your password? 
                                <a href="/academy/login" class="auth__footer-link" data-route="login">Sign in</a>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            
            setTimeout(() => {
                const form = div.querySelector('#forgotForm');
                if (form) form.addEventListener('submit', handleForgotPassword);
            }, 0);
            
            return div;
        },

        admin() {
            // Check authentication
            const token = localStorage.getItem('academy_token');
            const user = JSON.parse(localStorage.getItem('academy_user') || '{}');
            
            if (!token || user.role !== 'admin') {
                // Redirect to login
                window.location.href = '/academy/login';
                return document.createElement('div');
            }
            
            const div = document.createElement('div');
            div.className = 'page admin-page';
            div.innerHTML = `
                <div class="admin-layout" id="adminLayout"></div>
            `;
            
            setTimeout(() => {
                if (typeof Admin !== 'undefined') {
                    Admin.init();
                }
            }, 0);
            
            return div;
        }
    };

    // ========================================
    // Registration Logic
    // ========================================
    function initRegistration() {
        const prevBtn = document.getElementById('regPrev');
        const nextBtn = document.getElementById('regNext');
        const form = document.getElementById('registerForm');
        
        if (prevBtn) prevBtn.addEventListener('click', goToPrevStep);
        if (nextBtn) nextBtn.addEventListener('click', goToNextStep);
        if (form) form.addEventListener('submit', handleSubmit);
        
        // Password toggle
        const toggleBtn = document.getElementById('toggleRegPassword');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const passwordInput = document.getElementById('regPassword');
                const type = passwordInput.type === 'password' ? 'text' : 'password';
                passwordInput.type = type;
                toggleBtn.textContent = type === 'password' ? 'Show' : 'Hide';
            });
        }
        
        // DOB change handler for minor detection
        const dobInput = document.getElementById('regDOB');
        if (dobInput) {
            dobInput.addEventListener('change', (e) => {
                const age = calculateAge(e.target.value);
                registrationState.data.isMinor = age < 18;
                const guardianSection = document.getElementById('guardianSection');
                if (guardianSection) {
                    guardianSection.style.display = registrationState.data.isMinor ? 'block' : 'none';
                }
            });
        }
        
        updateProgressUI();
    }

    function goToPrevStep() {
        if (registrationState.currentStep > 1) {
            saveCurrentStepData();
            registrationState.currentStep--;
            renderCurrentStep();
            updateProgressUI();
        }
    }

    function goToNextStep() {
        if (!validateCurrentStep()) return;
        
        saveCurrentStepData();
        
        if (registrationState.currentStep < registrationState.totalSteps) {
            registrationState.currentStep++;
            renderCurrentStep();
            updateProgressUI();
        }
    }

    function renderCurrentStep() {
        const stepsContainer = document.getElementById('regSteps');
        const prevBtn = document.getElementById('regPrev');
        const nextBtn = document.getElementById('regNext');
        
        let stepHtml = '';
        switch (registrationState.currentStep) {
            case 1: stepHtml = renderStep1(); break;
            case 2: stepHtml = renderStep2(); break;
            case 3: stepHtml = renderStep3(); break;
            case 4: stepHtml = renderStep4(); break;
        }
        
        stepsContainer.innerHTML = stepHtml;
        
        // Update button visibility
        prevBtn.style.display = registrationState.currentStep > 1 ? 'inline-flex' : 'none';
        
        if (registrationState.currentStep === registrationState.totalSteps) {
            nextBtn.textContent = 'Create Academy Account';
            nextBtn.classList.add('btn--submit');
        } else {
            nextBtn.textContent = 'Continue';
            nextBtn.classList.remove('btn--submit');
        }
        
        // Re-attach event listeners for current step
        attachStepEventListeners();
    }

    function attachStepEventListeners() {
        const step = registrationState.currentStep;
        
        if (step === 2) {
            const dobInput = document.getElementById('regDOB');
            if (dobInput) {
                dobInput.addEventListener('change', (e) => {
                    const age = calculateAge(e.target.value);
                    registrationState.data.isMinor = age < 18;
                    const guardianSection = document.getElementById('guardianSection');
                    if (guardianSection) {
                        guardianSection.style.display = registrationState.data.isMinor ? 'block' : 'none';
                    }
                });
            }
        }
        
        if (step === 3) {
            // Programme selection
            document.querySelectorAll('.reg__programme').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    const name = btn.dataset.name;
                    toggleProgramme(id, name);
                    btn.classList.toggle('reg__programme--selected');
                    const check = btn.querySelector('.reg__programme-check');
                    check.textContent = btn.classList.contains('reg__programme--selected') ? '✓' : '';
                });
            });
            
            // Remove programme from selected list
            document.querySelectorAll('.reg__selected-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const id = btn.dataset.id;
                    removeProgramme(id);
                    renderCurrentStep();
                });
            });
        }
    }

    function toggleProgramme(id, name) {
        const index = registrationState.data.selectedProgrammes.findIndex(p => p.id === id);
        if (index > -1) {
            registrationState.data.selectedProgrammes.splice(index, 1);
        } else {
            registrationState.data.selectedProgrammes.push({ id, name });
        }
        updateSelectedDisplay();
    }

    function removeProgramme(id) {
        registrationState.data.selectedProgrammes = registrationState.data.selectedProgrammes.filter(p => p.id !== id);
    }

    function updateSelectedDisplay() {
        const selected = registrationState.data.selectedProgrammes;
        const selectedContainer = document.querySelector('.reg__selected');
        
        if (selected.length > 0) {
            if (selectedContainer) {
                selectedContainer.querySelector('.reg__selected-list').innerHTML = selected.map(p => `
                    <span class="reg__selected-item">
                        ${p.name}
                        <button type="button" class="reg__selected-remove" data-id="${p.id}" aria-label="Remove ${p.name}">×</button>
                    </span>
                `).join('');
                
                // Re-attach remove handlers
                selectedContainer.querySelectorAll('.reg__selected-remove').forEach(btn => {
                    btn.addEventListener('click', () => {
                        removeProgramme(btn.dataset.id);
                        renderCurrentStep();
                    });
                });
            } else {
                renderCurrentStep();
            }
        }
    }

    function saveCurrentStepData() {
        const step = registrationState.currentStep;
        
        if (step === 1) {
            registrationState.data.fullName = document.getElementById('regFullName')?.value || '';
            registrationState.data.email = document.getElementById('regEmail')?.value || '';
            registrationState.data.mobile = document.getElementById('regMobile')?.value || '';
            registrationState.data.password = document.getElementById('regPassword')?.value || '';
            registrationState.data.confirmPassword = document.getElementById('regConfirmPassword')?.value || '';
        } else if (step === 2) {
            registrationState.data.dateOfBirth = document.getElementById('regDOB')?.value || '';
            registrationState.data.address = document.getElementById('regAddress')?.value || '';
            if (registrationState.data.isMinor) {
                registrationState.data.guardianName = document.getElementById('regGuardianName')?.value || '';
                registrationState.data.guardianRelationship = document.getElementById('regGuardianRelationship')?.value || '';
                registrationState.data.guardianEmail = document.getElementById('regGuardianEmail')?.value || '';
                registrationState.data.guardianMobile = document.getElementById('regGuardianMobile')?.value || '';
            }
        }
    }

    function validateCurrentStep() {
        clearAllErrors();
        const step = registrationState.currentStep;
        let isValid = true;
        
        if (step === 1) {
            const fullName = document.getElementById('regFullName')?.value.trim();
            const email = document.getElementById('regEmail')?.value.trim();
            const mobile = document.getElementById('regMobile')?.value.trim();
            const password = document.getElementById('regPassword')?.value;
            const confirmPassword = document.getElementById('regConfirmPassword')?.value;
            
            if (!fullName || fullName.length < 2) {
                showError('regFullNameError');
                isValid = false;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                showError('regEmailError');
                isValid = false;
            }
            
            const mobileRegex = /^[\+]?[(]?[0-9]{10,15}$/;
            if (!mobile || !mobileRegex.test(mobile.replace(/[\s\-\(\)]/g, ''))) {
                showError('regMobileError');
                isValid = false;
            }
            
            if (!password || password.length < 8) {
                showError('regPasswordError');
                isValid = false;
            }
            
            if (password !== confirmPassword) {
                showError('regConfirmError');
                isValid = false;
            }
        } else if (step === 2) {
            const dob = document.getElementById('regDOB')?.value;
            
            if (!dob) {
                showError('regDOBError');
                isValid = false;
            }
            
            if (registrationState.data.isMinor) {
                const guardianName = document.getElementById('regGuardianName')?.value.trim();
                const guardianRel = document.getElementById('regGuardianRelationship')?.value;
                const guardianMobile = document.getElementById('regGuardianMobile')?.value.trim();
                
                if (!guardianName) {
                    showError('regGuardianNameError');
                    isValid = false;
                }
                
                if (!guardianRel) {
                    showError('regGuardianRelError');
                    isValid = false;
                }
                
                if (!guardianMobile) {
                    showError('regGuardianMobileError');
                    isValid = false;
                }
                
                const guardianEmail = document.getElementById('regGuardianEmail')?.value.trim();
                if (guardianEmail && !emailRegex.test(guardianEmail)) {
                    showError('regGuardianEmailError');
                    isValid = false;
                }
            }
        } else if (step === 3) {
            if (registrationState.data.selectedProgrammes.length === 0) {
                showError('regProgrammeError');
                isValid = false;
            }
        }
        
        return isValid;
    }

    function handleSubmit(e) {
        e.preventDefault();
        
        if (!validateCurrentStep()) return;
        
        saveCurrentStepData();
        
        // Disable submit button to prevent double submission
        const submitBtn = document.getElementById('regNext');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        
        // Submit to backend
        const payload = {
            fullName: registrationState.data.fullName,
            email: registrationState.data.email,
            mobile: registrationState.data.mobile,
            password: registrationState.data.password,
            dateOfBirth: registrationState.data.dateOfBirth,
            isMinor: registrationState.data.isMinor,
            address: registrationState.data.address || null,
            guardianName: registrationState.data.isMinor ? registrationState.data.guardianName : null,
            guardianRelationship: registrationState.data.isMinor ? registrationState.data.guardianRelationship : null,
            guardianEmail: registrationState.data.isMinor ? registrationState.data.guardianEmail : null,
            guardianMobile: registrationState.data.isMinor ? registrationState.data.guardianMobile : null,
            selectedProgrammes: registrationState.data.selectedProgrammes,
        };
        
        fetch('/api/v1/registration/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(data => {
                    throw new Error(data.detail || 'Registration failed');
                });
            }
            return res.json();
        })
        .then(data => {
            // Show success screen
            showRegistrationSuccess(data);
        })
        .catch(err => {
            console.error('Registration error:', err);
            alert('Registration failed: ' + err.message);
            
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Academy Account';
            }
        });
    }

    function showRegistrationSuccess(data) {
        const main = document.getElementById('mainContent');
        main.innerHTML = `
            <section class="auth">
                <div class="auth__bg"></div>
                <div class="auth__container" style="max-width: 560px;">
                    <div class="auth__card">
                        <div style="text-align: center; margin-bottom: 32px;">
                            <div style="width: 80px; height: 80px; background: rgba(74, 222, 128, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 36px; color: #4ade80;">✓</div>
                            <h1 style="font-family: var(--font-display); font-size: 1.75rem; margin-bottom: 8px; color: var(--color-text-primary);">Registration Submitted Successfully</h1>
                            <p style="color: var(--color-text-secondary); font-size: 0.95rem;">Thank you for registering with ChankArts Music Academy</p>
                        </div>
                        
                        <div style="background: var(--color-bg-secondary); border-radius: var(--radius-md); padding: 24px; margin-bottom: 24px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <span style="color: var(--color-text-muted); font-size: 0.85rem;">Application ID</span>
                                <span style="font-weight: 600; color: var(--color-accent);">${data.request_id}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <span style="color: var(--color-text-muted); font-size: 0.85rem;">Submitted</span>
                                <span style="font-weight: 500;">${new Date(data.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                                <span style="color: var(--color-text-muted); font-size: 0.85rem;">Status</span>
                                <span class="badge badge--pending">Pending Approval</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                                <span style="color: var(--color-text-muted); font-size: 0.85rem;">Expected Review</span>
                                <span style="font-weight: 500;">Within 72 hours</span>
                            </div>
                        </div>
                        
                        <div style="background: rgba(201, 169, 110, 0.08); border-left: 3px solid var(--color-accent); border-radius: 0 var(--radius-md) var(--radius-md) 0; padding: 16px; margin-bottom: 24px;">
                            <p style="color: var(--color-text-secondary); font-size: 0.9rem; line-height: 1.6; margin: 0;">
                                Your application has been successfully received and is now under review. We will contact you once your registration has been reviewed.
                            </p>
                        </div>
                        
                        <p style="color: var(--color-text-muted); font-size: 0.85rem; text-align: center; margin-bottom: 24px;">
                            A confirmation email has been sent to <strong style="color: var(--color-text-primary);">${registrationState.data.email}</strong>
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="/academy/" class="btn btn--primary" data-route="home">Return to Home</a>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        // Reset registration state
        registrationState.currentStep = 1;
        registrationState.data = {
            fullName: '',
            email: '',
            mobile: '',
            password: '',
            confirmPassword: '',
            dateOfBirth: '',
            isMinor: false,
            address: '',
            guardianName: '',
            guardianRelationship: '',
            guardianEmail: '',
            guardianMobile: '',
            selectedProgrammes: [],
        };
    }

    function updateProgressUI() {
        const steps = document.querySelectorAll('.reg__progress-step');
        const lines = document.querySelectorAll('.reg__progress-line');
        
        steps.forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('reg__progress-step--active', 'reg__progress-step--completed');
            
            if (stepNum === registrationState.currentStep) {
                step.classList.add('reg__progress-step--active');
            } else if (stepNum < registrationState.currentStep) {
                step.classList.add('reg__progress-step--completed');
            }
        });
        
        lines.forEach((line, index) => {
            line.classList.toggle('reg__progress-line--completed', index + 1 < registrationState.currentStep);
        });
    }

    // ========================================
    // Form Handlers
    // ========================================
    function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        let isValid = true;
        
        if (!email) {
            showError('loginEmailError');
            isValid = false;
        } else {
            hideError('loginEmailError');
        }
        
        if (!password) {
            showError('loginPasswordError');
            isValid = false;
        } else {
            hideError('loginPasswordError');
        }
        
        if (isValid) {
            // Try to connect to backend
            fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            .then(res => {
                if (!res.ok) throw new Error('Login failed');
                return res.json();
            })
            .then(data => {
                // Store token and user info
                localStorage.setItem('academy_token', data.access_token);
                localStorage.setItem('academy_user', JSON.stringify({
                    role: data.role,
                    user_id: data.user_id,
                }));
                
                // Route based on role
                switch (data.role) {
                    case 'admin':
                        Router.navigate('/academy/admin');
                        break;
                    case 'instructor':
                        // TODO: instructor dashboard
                        alert('Instructor dashboard coming soon');
                        break;
                    default:
                        // TODO: student dashboard
                        alert('Student dashboard coming soon');
                }
            })
            .catch(err => {
                console.error('Login error:', err);
                alert('Login failed. Please check your credentials and try again.');
            });
        }
    }

    function handleForgotPassword(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgotEmail').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email || !emailRegex.test(email)) {
            showError('forgotEmailError');
        } else {
            hideError('forgotEmailError');
            console.log('Forgot password attempt:', { email });
            alert('Password reset functionality will be connected to the backend in a future phase.');
        }
    }

    // ========================================
    // Header
    // ========================================
    const Header = {
        init() {
            const header = document.getElementById('header');
            const menuBtn = document.getElementById('menuBtn');
            const mobileMenu = document.getElementById('mobileMenu');
            
            window.addEventListener('scroll', () => {
                header.classList.toggle('header--scrolled', window.scrollY > 20);
            });
            
            if (menuBtn && mobileMenu) {
                menuBtn.addEventListener('click', () => {
                    const isOpen = mobileMenu.classList.contains('mobile-menu--open');
                    mobileMenu.classList.toggle('mobile-menu--open');
                    menuBtn.classList.toggle('header__menu-btn--active');
                    menuBtn.setAttribute('aria-expanded', !isOpen);
                    document.body.style.overflow = isOpen ? '' : 'hidden';
                });
                
                mobileMenu.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', () => {
                        mobileMenu.classList.remove('mobile-menu--open');
                        menuBtn.classList.remove('header__menu-btn--active');
                        menuBtn.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    });
                });
            }
        }
    };

    // ========================================
    // Initialize
    // ========================================
    document.addEventListener('DOMContentLoaded', () => {
        Header.init();
        Router.init();
    });

})();
