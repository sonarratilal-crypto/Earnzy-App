// Main Application Logic
class EarnzyApp {
    constructor() {
        this.currentUser = null;
        this.userWallet = {
            balance: 0,
            earned: 0,
            withdrawn: 0,
            referral_code: '',
            total_referrals: 0
        };
        
        this.init();
    }

    async init() {
        console.log('🚀 Earnzy App Starting...');
        
        // First setup event listeners
        this.setupEventListeners();
        
        // Then check auth status
        await this.checkAuthStatus();
        
        console.log('✅ Earnzy App Ready!');
    }

    async checkAuthStatus() {
        try {
            const user = await authFunctions.checkAuthStatus();
            
            if (user) {
                this.currentUser = user;
                console.log('✅ User logged in:', user.email);
                this.showPage('home-page');
                await this.loadUserData();
            } else {
                console.log('ℹ️ No user, showing login');
                this.showPage('auth-page');
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.showPage('auth-page');
            this.showLoginForm();
        }
    }

    async loadUserData() {
        if (!this.currentUser) return;

        this.showLoading(true);
        
        try {
            let wallet = await supabaseFunctions.getUserWallet(this.currentUser.id);
            
            if (!wallet) {
                wallet = await supabaseFunctions.createUserWallet(this.currentUser.id);
            }
            
            if (wallet) {
                this.userWallet = wallet;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.showNotification('Error loading data');
        } finally {
            this.showLoading(false);
        }
    }

    updateUI() {
        // Update wallet
        document.getElementById('wallet-amount').textContent = this.userWallet.balance.toLocaleString();
        document.getElementById('wallet-rupees').textContent = (this.userWallet.balance * 0.01).toFixed(2);
        
        // Update stats
        document.getElementById('total-earned').textContent = this.userWallet.earned.toLocaleString();
        document.getElementById('total-withdrawn').textContent = this.userWallet.withdrawn.toLocaleString();
        document.getElementById('total-referrals').textContent = this.userWallet.total_referrals.toLocaleString();
        
        // Update profile
        if (this.currentUser && this.currentUser.email) {
            const userName = this.currentUser.email.split('@')[0];
            document.getElementById('user-name').textContent = userName;
            document.getElementById('profile-name').textContent = userName;
            document.getElementById('profile-email').textContent = this.currentUser.email;
        }
        
        // Update referral
        if (this.userWallet.referral_code) {
            document.getElementById('referral-code').value = this.userWallet.referral_code;
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Auth Form Toggles - FIXED
        const showSignup = document.getElementById('show-signup');
        const showLogin = document.getElementById('show-login');
        
        if (showSignup) {
            showSignup.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📝 Show signup clicked');
                this.showSignupForm();
            });
        }
        
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔐 Show login clicked');
                this.showLoginForm();
            });
        }
        
        // Auth Buttons - FIXED
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                console.log('🔄 Login button clicked');
                this.handleLogin();
            });
        }
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                console.log('🔄 Signup button clicked');
                this.handleSignup();
            });
        }
        
        // Social Login - FIXED
        const googleLogin = document.getElementById('google-login');
        const facebookLogin = document.getElementById('facebook-login');
        const googleSignup = document.getElementById('google-signup');
        const facebookSignup = document.getElementById('facebook-signup');
        
        if (googleLogin) googleLogin.addEventListener('click', () => this.handleGoogleLogin());
        if (facebookLogin) facebookLogin.addEventListener('click', () => this.handleFacebookLogin());
        if (googleSignup) googleSignup.addEventListener('click', () => this.handleGoogleLogin());
        if (facebookSignup) facebookSignup.addEventListener('click', () => this.handleFacebookLogin());
        
        // Navigation - FIXED
        this.setupNavigation();
        
        // Feature Cards - FIXED
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const pageId = card.getAttribute('data-page');
                this.showPage(pageId);
            });
        });
        
        // Earning Actions - FIXED
        const checkinBtn = document.getElementById('check-in-btn');
        const watchBtn = document.getElementById('watch-random-btn');
        const scratchAllBtn = document.getElementById('scratch-all-btn');
        
        if (checkinBtn) checkinBtn.addEventListener('click', () => this.handleDailyCheckIn());
        if (watchBtn) watchBtn.addEventListener('click', () => this.handleWatchVideo());
        if (scratchAllBtn) scratchAllBtn.addEventListener('click', () => this.handleScratchAll());
        
        // Watch Video Buttons - FIXED
        document.querySelectorAll('.btn-watch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const coins = parseInt(e.target.getAttribute('data-coins'));
                this.handleWatchVideo(coins);
            });
        });
        
        // Scratch Cards - FIXED
        document.querySelectorAll('.scratch-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const cardId = e.currentTarget.getAttribute('data-card');
                this.handleScratchCard(cardId);
            });
        });
        
        // Referral - FIXED
        const copyRef = document.getElementById('copy-referral');
        const shareRef = document.getElementById('share-referral');
        
        if (copyRef) copyRef.addEventListener('click', () => this.copyReferralCode());
        if (shareRef) shareRef.addEventListener('click', () => this.shareReferral());
        
        // Withdrawal - FIXED
        const withdrawBtn = document.getElementById('withdraw-now-btn');
        if (withdrawBtn) withdrawBtn.addEventListener('click', () => this.handleWithdrawal());
        
        // Payment Methods - FIXED
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget);
            });
        });
        
        // Profile - FIXED
        const profileIcon = document.getElementById('profile-icon');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (profileIcon) profileIcon.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('profile-page');
        });
        
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Tasks - FIXED
        document.querySelectorAll('.task-card .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showNotification('Task feature coming soon!');
            });
        });
        
        console.log('✅ Event listeners setup complete');
    }

    setupNavigation() {
        console.log('🧭 Setting up navigation...');
        
        // Bottom Navigation - FIXED
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (!this.currentUser) {
                    this.showNotification('Please login first');
                    this.showPage('auth-page');
                    return;
                }
                
                const pageId = item.getAttribute('data-page');
                this.showPage(pageId);
                
                // Update active nav
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    showPage(pageId) {
        console.log('📄 Showing page:', pageId);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    showLoginForm() {
        console.log('🔐 Showing login form');
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('signup-form').style.display = 'none';
    }

    showSignupForm() {
        console.log('📝 Showing signup form');
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
    }

    async handleLogin() {
        console.log('🔄 Processing login...');
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            this.showNotification('Please enter email and password');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const data = await authFunctions.loginWithEmail(email, password);
            this.currentUser = data.user;
            this.showPage('home-page');
            await this.loadUserData();
            this.showNotification('Login successful! 🎉');
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleSignup() {
        console.log('🔄 Processing signup...');
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        if (!email || !password || !confirmPassword) {
            this.showNotification('Please fill all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const data = await authFunctions.signUp(email, password);
            this.showNotification('Account created successfully! Please check your email. 📧');
            this.showLoginForm();
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification('Signup failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleGoogleLogin() {
        try {
            await authFunctions.loginWithGoogle();
        } catch (error) {
            this.showNotification('Google login failed');
        }
    }

    async handleFacebookLogin() {
        try {
            await authFunctions.loginWithFacebook();
        } catch (error) {
            this.showNotification('Facebook login failed');
        }
    }

    async handleLogout() {
        try {
            await authFunctions.signOut();
            this.currentUser = null;
            this.userWallet = { balance: 0, earned: 0, withdrawn: 0, referral_code: '', total_referrals: 0 };
            this.showPage('auth-page');
            this.showLoginForm();
            this.showNotification('Logged out successfully');
        } catch (error) {
            this.showNotification('Logout failed');
        }
    }

    async handleDailyCheckIn() {
        if (!this.currentUser) {
            this.showNotification('Please login first');
            return;
        }

        const coinsEarned = 50;
        
        try {
            const result = await supabaseFunctions.addCoins(
                this.currentUser.id,
                coinsEarned,
                'daily_checkin',
                'Daily check-in bonus'
            );
            
            if (result) {
                this.userWallet.balance += coinsEarned;
                this.userWallet.earned += coinsEarned;
                this.updateUI();
                
                this.showNotification(`Daily check-in successful! +${coinsEarned} coins 🎉`);
                document.getElementById('check-in-btn').textContent = 'Checked In Today';
                document.getElementById('check-in-btn').disabled = true;
            }
        } catch (error) {
            this.showNotification('Check-in failed');
        }
    }

    async handleWatchVideo(coins = null) {
        if (!this.currentUser) {
            this.showNotification('Please login first');
            return;
        }

        const coinsEarned = coins || Math.floor(Math.random() * 11) + 10;
        
        this.showNotification('Loading video...');
        
        setTimeout(async () => {
            try {
                const result = await supabaseFunctions.addCoins(
                    this.currentUser.id,
                    coinsEarned,
                    'watch_video',
                    'Watched video ad'
                );
                
                if (result) {
                    this.userWallet.balance += coinsEarned;
                    this.userWallet.earned += coinsEarned;
                    this.updateUI();
                    
                    this.showNotification(`+${coinsEarned} coins for watching video! 🎬`);
                }
            } catch (error) {
                this.showNotification('Failed to add coins');
            }
        }, 2000);
    }

    async handleScratchCard(cardId) {
        if (!this.currentUser) {
            this.showNotification('Please login first');
            return;
        }

        const cardElement = document.querySelector(`.scratch-card[data-card="${cardId}"]`);
        if (cardElement.classList.contains('scratched')) {
            this.showNotification('Card already scratched!');
            return;
        }

        const coinsEarned = Math.floor(Math.random() * 46) + 5;
        
        // Animate scratching
        cardElement.classList.add('scratched');
        const resultElement = cardElement.querySelector('.scratch-result');
        resultElement.textContent = `+${coinsEarned}`;
        resultElement.style.background = '#4CAF50';
        resultElement.style.color = 'white';

        setTimeout(async () => {
            try {
                const result = await supabaseFunctions.addCoins(
                    this.currentUser.id,
                    coinsEarned,
                    'scratch_card',
                    'Scratch card reward'
                );
                
                if (result) {
                    this.userWallet.balance += coinsEarned;
                    this.userWallet.earned += coinsEarned;
                    this.updateUI();
                    
                    this.showNotification(`You won ${coinsEarned} coins! 🎁`);
                }
            } catch (error) {
                this.showNotification('Scratch card failed');
            }
        }, 1000);
    }

    async handleScratchAll() {
        if (!this.currentUser) {
            this.showNotification('Please login first');
            return;
        }

        const cards = document.querySelectorAll('.scratch-card:not(.scratched)');
        if (cards.length === 0) {
            this.showNotification('All cards scratched!');
            return;
        }

        for (const card of cards) {
            const cardId = card.getAttribute('data-card');
            await this.handleScratchCard(cardId);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    copyReferralCode() {
        const referralCode = document.getElementById('referral-code');
        referralCode.select();
        document.execCommand('copy');
        this.showNotification('Referral code copied! 📋');
    }

    shareReferral() {
        this.showNotification('Share feature coming soon!');
    }

    selectPaymentMethod(methodElement) {
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('active');
        });
        methodElement.classList.add('active');
    }

    async handleWithdrawal() {
        if (!this.currentUser) {
            this.showNotification('Please login first');
            return;
        }

        const amount = parseInt(document.getElementById('withdraw-amount').value);
        const methodElement = document.querySelector('.payment-method.active');
        const account = document.getElementById('account-details').value;
        
        if (!amount || amount < 10000) {
            this.showNotification('Minimum withdrawal: 10,000 coins (₹100)');
            return;
        }
        
        if (amount > this.userWallet.balance) {
            this.showNotification('Insufficient balance');
            return;
        }
        
        if (!methodElement) {
            this.showNotification('Select payment method');
            return;
        }
        
        if (!account) {
            this.showNotification('Enter account details');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const newBalance = this.userWallet.balance - amount;
            const updatedWallet = await supabaseFunctions.updateWalletBalance(
                this.currentUser.id, 
                newBalance, 
                0, 
                amount
            );
            
            if (updatedWallet) {
                await supabaseFunctions.createWithdrawal(
                    this.currentUser.id,
                    amount,
                    methodElement.getAttribute('data-method'),
                    account
                );
                
                this.userWallet.balance = newBalance;
                this.userWallet.withdrawn += amount;
                this.updateUI();
                
                document.getElementById('withdraw-amount').value = '';
                document.getElementById('account-details').value = '';
                
                this.showNotification(`Withdrawal request submitted! ⏳`);
            }
        } catch (error) {
            this.showNotification('Withdrawal failed');
        } finally {
            this.showLoading(false);
        }
    }

    showNotification(message) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM Loaded - Starting Earnzy App');
    window.earnzyApp = new EarnzyApp();
});
