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
        
        this.appSettings = {
            min_withdrawal: 10000,
            referral_bonus: { referrer: 250, referred: 250 },
            daily_scratch_limit: 3,
            video_ad_rewards: { min: 10, max: 20 },
            scratch_card_rewards: { min: 5, max: 50 }
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing Earnzy App...');
        
        // Set up event listeners first
        this.setupEventListeners();
        
        // Check authentication status
        await this.checkAuthStatus();
        
        // Load app settings
        await this.loadAppSettings();
        
        console.log('Earnzy App initialized successfully');
    }

    async checkAuthStatus() {
        try {
            console.log('Checking authentication status...');
            const user = await authFunctions.checkAuthStatus();
            
            if (user) {
                this.currentUser = user;
                console.log('User is logged in:', user.email);
                this.showPage('home-page');
                await this.loadUserData();
                this.setupNavigation();
            } else {
                console.log('No user logged in, showing auth page');
                this.showPage('auth-page');
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.showPage('auth-page');
            this.showLoginForm();
        }
    }

    async loadUserData() {
        if (!this.currentUser) {
            console.log('No user logged in, skipping data load');
            return;
        }

        this.showLoading(true);
        
        try {
            console.log('Loading user data for:', this.currentUser.email);
            
            // Get user wallet data
            let wallet = await supabaseFunctions.getUserWallet(this.currentUser.id);
            
            if (!wallet) {
                console.log('No wallet found, creating new wallet...');
                wallet = await supabaseFunctions.createUserWallet(this.currentUser.id);
            }
            
            if (wallet) {
                this.userWallet = wallet;
                console.log('Wallet data loaded:', wallet);
                this.updateUI();
            } else {
                console.error('Failed to load or create wallet');
                this.showNotification('Error loading wallet data');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showNotification('Error loading data. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async loadAppSettings() {
        try {
            console.log('Loading app settings...');
            const settings = await supabaseFunctions.getAppSettings();
            
            if (settings && Object.keys(settings).length > 0) {
                this.appSettings = {
                    ...this.appSettings,
                    ...settings
                };
                console.log('App settings loaded:', this.appSettings);
            } else {
                console.log('Using default app settings');
            }
        } catch (error) {
            console.error('Error loading app settings:', error);
        }
    }

    updateUI() {
        console.log('Updating UI with user data...');
        
        // Update wallet balance
        document.getElementById('wallet-amount').textContent = this.userWallet.balance.toLocaleString();
        document.getElementById('wallet-rupees').textContent = (this.userWallet.balance * 0.01).toFixed(2);
        
        // Update stats
        document.getElementById('total-earned').textContent = this.userWallet.earned.toLocaleString();
        document.getElementById('total-withdrawn').textContent = this.userWallet.withdrawn.toLocaleString();
        document.getElementById('total-referrals').textContent = this.userWallet.total_referrals.toLocaleString();
        
        // Update withdrawal balance
        document.getElementById('withdraw-balance').textContent = this.userWallet.balance.toLocaleString() + ' coins';
        
        // Update profile info
        if (this.currentUser && this.currentUser.email) {
            const userName = this.currentUser.email.split('@')[0];
            document.getElementById('user-name').textContent = userName;
            document.getElementById('profile-name').textContent = userName;
            document.getElementById('profile-email').textContent = this.currentUser.email;
            
            // Update profile stats
            document.getElementById('profile-total-earned').textContent = this.userWallet.earned.toLocaleString();
            document.getElementById('profile-total-withdrawn').textContent = this.userWallet.withdrawn.toLocaleString();
            document.getElementById('profile-total-referrals').textContent = this.userWallet.total_referrals.toLocaleString();
        }
        
        // Update referral code if available
        if (this.userWallet.referral_code) {
            document.getElementById('referral-code').value = this.userWallet.referral_code;
            document.getElementById('referral-link').value = `https://earnzy.com/ref/${this.userWallet.referral_code}`;
        }
        
        // Update referral stats
        document.getElementById('ref-total').textContent = this.userWallet.total_referrals.toLocaleString();
        document.getElementById('ref-earned').textContent = (this.userWallet.total_referrals * 250).toLocaleString();
        document.getElementById('ref-pending').textContent = '0';
        
        console.log('UI updated successfully');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Auth form switches
        document.getElementById('show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            this.showSignupForm();
        });
        
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });
        
        // Auth buttons
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        document.getElementById('signup-btn').addEventListener('click', () => this.handleSignup());
        document.getElementById('google-login').addEventListener('click', () => this.handleGoogleLogin());
        document.getElementById('facebook-login').addEventListener('click', () => this.handleFacebookLogin());
        document.getElementById('google-signup').addEventListener('click', () => this.handleGoogleLogin());
        document.getElementById('facebook-signup').addEventListener('click', () => this.handleFacebookLogin());
        
        // Navigation
        this.setupNavigation();
        
        // Feature cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const pageId = card.getAttribute('data-page');
                this.showPage(pageId);
            });
        });
        
        // Earning actions
        document.getElementById('check-in-btn').addEventListener('click', () => this.handleDailyCheckIn());
        document.getElementById('watch-random-btn').addEventListener('click', () => this.handleWatchVideo());
        
        // Watch video buttons
        document.querySelectorAll('.btn-watch').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const coins = parseInt(e.target.getAttribute('data-coins'));
                this.handleWatchVideo(coins);
            });
        });
        
        // Scratch cards
        document.querySelectorAll('.scratch-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const cardId = e.currentTarget.getAttribute('data-card');
                this.handleScratchCard(cardId);
            });
        });
        
        document.getElementById('scratch-all-btn').addEventListener('click', () => this.handleScratchAll());
        
        // Referral actions
        document.getElementById('copy-referral').addEventListener('click', () => this.copyReferralCode());
        document.getElementById('share-referral').addEventListener('click', () => this.shareReferral());
        
        // Withdrawal actions
        document.getElementById('withdraw-now-btn').addEventListener('click', () => this.handleWithdrawal());
        
        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => {
                this.selectPaymentMethod(e.currentTarget);
            });
        });
        
        // Profile actions
        document.getElementById('profile-icon').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('profile-page');
        });
        
        document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
        
        // Task buttons
        document.querySelectorAll('.task-card .btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showNotification('Task feature coming soon!');
            });
        });
        
        console.log('Event listeners setup completed');
    }

    setupNavigation() {
        console.log('Setting up navigation...');
        
        // Bottom navigation
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
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Header profile icon
        document.getElementById('profile-icon').addEventListener('click', (e) => {
            e.preventDefault();
            
            if (!this.currentUser) {
                this.showNotification('Please login first');
                this.showPage('auth-page');
                return;
            }
            
            this.showPage('profile-page');
        });
    }

    showPage(pageId) {
        console.log('Showing page:', pageId);
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        } else {
            console.error('Page not found:', pageId);
        }
        
        // Update navigation if it's a main page
        if (['home-page', 'watch-page', 'tasks-page', 'scratch-page', 'withdraw-page'].includes(pageId)) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            const navItem = document.querySelector(`.nav-item[data-page="${pageId}"]`);
            if (navItem) navItem.classList.add('active');
        }
    }

    showLoginForm() {
        console.log('Showing login form');
        document.getElementById('login-form').classList.add('active');
        document.getElementById('signup-form').classList.remove('active');
        document.getElementById('login-title').textContent = 'Login to Earnzy';
    }

    showSignupForm() {
        console.log('Showing signup form');
        document.getElementById('login-form').classList.remove('active');
        document.getElementById('signup-form').classList.add('active');
        document.getElementById('login-title').textContent = 'Join Earnzy';
    }

    showLoading(show) {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.style.display = show ? 'block' : 'none';
        }
    }

    async handleLogin() {
        console.log('Handling login...');
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (!email || !password) {
            this.showNotification('Please enter email and password');
            return;
        }
        
        if (!authFunctions.validateEmail(email)) {
            this.showNotification('Please enter a valid email address');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const data = await authFunctions.loginWithEmail(email, password);
            this.currentUser = data.user;
            this.showPage('home-page');
            await this.loadUserData();
            this.showNotification('Login successful! Welcome back!');
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleSignup() {
        console.log('Handling signup...');
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        if (!email || !password || !confirmPassword) {
            this.showNotification('Please fill all fields');
            return;
        }
        
        if (!authFunctions.validateEmail(email)) {
            this.showNotification('Please enter a valid email address');
            return;
        }
        
        const passwordValidation = authFunctions.validatePassword(password);
        if (!passwordValidation.valid) {
            this.showNotification(passwordValidation.message);
            return;
        }
        
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match');
            return;
        }
        
        this.showLoading(true);
        
        try {
            const data = await authFunctions.signUp(email, password);
            
            if (data.user) {
                this.showNotification('Account created successfully! Please check your email for verification.');
                this.showLoginForm();
            } else {
                this.showNotification('Signup successful! Please check your email for verification.');
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification('Signup failed: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async handleGoogleLogin() {
        console.log('Handling Google login...');
        
        try {
            await authFunctions.loginWithGoogle();
            // The auth state change will handle the rest
        } catch (error) {
            console.error('Google login error:', error);
            this.showNotification('Google login failed. Please try again.');
        }
    }

    async handleFacebookLogin() {
        console.log('Handling Facebook login...');
        
        try {
            await authFunctions.loginWithFacebook();
            // The auth state change will handle the rest
        } catch (error) {
            console.error('Facebook login error:', error);
            this.showNotification('Facebook login failed. Please try again.');
        }
    }

    async handleLogout() {
        console.log('Handling logout...');
        
        try {
            await authFunctions.signOut();
            this.currentUser = null;
            this.userWallet = { balance: 0, earned: 0, withdrawn: 0, referral_code: '', total_referrals: 0 };
            this.showPage('auth-page');
            this.showLoginForm();
            this.showNotification('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Logout failed. Please try again.');
        }
    }

    async handleDailyCheckIn() {
        console.log('Handling daily check-in...');
        
        if (!this.currentUser) {
            this.showNotification('Please login first');
            this.showPage('auth-page');
            return;
        }

        // Check if already checked in today
        const alreadyCheckedIn = await supabaseFunctions.getTodayCheckin(this.currentUser.id);
        if (alreadyCheckedIn) {
            this.showNotification('You have already checked in today!');
            document.getElementById('check-in-btn').textContent = 'Already Checked In';
            document.getElementById('check-in-btn').disabled = true;
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
                // Update local wallet data
                this.userWallet.balance += coinsEarned;
                this.userWallet.earned += coinsEarned;
                this.updateUI();
                
                this.showNotification(`Daily check-in successful! You earned ${coinsEarned} coins.`);
                document.getElementById('check-in-btn').textContent = 'Checked In Today';
                document.getElementById('check-in-btn').disabled = true;
            } else {
                throw new Error('Failed to update wallet');
            }
        } catch (error) {
            console.error('Check-in error:', error);
            this.showNotification('Check-in failed. Please try again.');
        }
    }

    async handleWatchVideo(coins = null) {
        console.log('Handling watch video...');
        
        if (!this.currentUser) {
            this.showNotification('Please login first');
            this.showPage('auth-page');
            return;
        }

        const coinsEarned = coins || Math.floor(Math.random() * 11) + 10; // 10-20 coins or specified amount
        
        // Simulate video watching
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
                    // Update local wallet data
                    this.userWallet.balance += coinsEarned;
                    this.userWallet.earned += coinsEarned;
                    this.updateUI();
                    
                    this.showNotification(`You earned ${coinsEarned} coins for watching the video!`);
                } else {
                    throw new Error('Failed to update wallet');
                }
            } catch (error) {
                console.error('Watch video error:', error);
                this.showNotification('Failed to add coins. Please try again.');
            }
        }, 2000);
    }

    async handleScratchCard(cardId) {
        console.log('Handling scratch card:', cardId);
        
        if (!this.currentUser) {
            this.showNotification('Please login first');
            this.showPage('auth-page');
            return;
        }

        // Check daily scratch card limit
        const todayScratches = await supabaseFunctions.getTodayScratchCards(this.currentUser.id);
        if (todayScratches >= this.appSettings.daily_scratch_limit) {
            this.showNotification('Daily scratch card limit reached! Come back tomorrow.');
            return;
        }

        const cardElement = document.querySelector(`.scratch-card[data-card="${cardId}"]`);
        if (cardElement.classList.contains('scratched')) {
            this.showNotification('This card has already been scratched!');
            return;
        }

        const coinsEarned = Math.floor(Math.random() * 
            (this.appSettings.scratch_card_rewards.max - this.appSettings.scratch_card_rewards.min + 1)) + 
            this.appSettings.scratch_card_rewards.min;
        
        // Animate scratching
        cardElement.classList.add('scratched');
        const resultElement = cardElement.querySelector('.scratch-result');
        resultElement.textContent = `+${coinsEarned} coins`;
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
                    // Update local wallet data
                    this.userWallet.balance += coinsEarned;
                    this.userWallet.earned += coinsEarned;
                    this.updateUI();
                    
                    this.showNotification(`Congratulations! You won ${coinsEarned} coins from scratch card!`);
                } else {
                    throw new Error('Failed to update wallet');
                }
            } catch (error) {
                console.error('Scratch card error:', error);
                this.showNotification('Failed to process scratch card. Please try again.');
            }
        }, 1000);
    }

    async handleScratchAll() {
        console.log('Handling scratch all cards...');
        
        if (!this.currentUser) {
            this.showNotification('Please login first');
            this.showPage('auth-page');
            return;
        }

        const cards = document.querySelectorAll('.scratch-card:not(.scratched)');
        if (cards.length === 0) {
            this.showNotification('All cards have been scratched today!');
            return;
        }

        for (const card of cards) {
            const cardId = card.getAttribute('data-card');
            await this.handleScratchCard(cardId);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay between cards
        }
    }

    copyReferralCode() {
        const referralCode = document.getElementById('referral-code');
        referralCode.select();
        referralCode.setSelectionRange(0, 99999);
        document.execCommand('copy');
        
        this.showNotification('Referral code copied to clipboard!');
    }

    shareReferral() {
        const referralLink = document.getElementById('referral-link').value;
        
        if (navigator.share) {
            navigator.share({
                title: 'Join Earnzy and Earn Money',
                text: 'Use my referral code to get bonus coins!',
                url: referralLink
            }).then(() => {
                this.showNotification('Referral link shared successfully!');
            }).catch(error => {
                console.error('Share failed:', error);
                this.copyReferralCode();
            });
        } else {
            this.copyReferralCode();
        }
    }

    selectPaymentMethod(methodElement) {
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('active');
        });
        methodElement.classList.add('active');
    }

    async handleWithdrawal() {
        console.log('Handling withdrawal...');
        
        if (!this.currentUser) {
            this.showNotification('Please login first');
            this.showPage('auth-page');
            return;
        }

        const amount = parseInt(document.getElementById('withdraw-amount').value);
        const methodElement = document.querySelector('.payment-method.active');
        const account = document.getElementById('account-details').value;
        
        if (!amount || amount < this.appSettings.min_withdrawal) {
            this.showNotification(`Minimum withdrawal is ${this.appSettings.min_withdrawal.toLocaleString()} coins (₹${this.appSettings.min_withdrawal * 0.01})`);
            return;
        }
        
        if (amount > this.userWallet.balance) {
            this.showNotification('Insufficient balance');
            return;
        }
        
        if (!methodElement) {
            this.showNotification('Please select a payment method');
            return;
        }
        
        if (!account) {
            this.showNotification('Please enter your account details');
            return;
        }
        
        const method = methodElement.getAttribute('data-method');
        
        this.showLoading(true);
        
        try {
            // Update wallet balance
            const newBalance = this.userWallet.balance - amount;
            const updatedWallet = await supabaseFunctions.updateWalletBalance(
                this.currentUser.id, 
                newBalance, 
                0, 
                amount
            );
            
            if (updatedWallet) {
                // Create withdrawal request
                await supabaseFunctions.createWithdrawal(
                    this.currentUser.id,
                    amount,
                    method,
                    account
                );
                
                // Create transaction record
                await supabaseFunctions.createTransaction(
                    this.currentUser.id,
                    'withdrawal',
                    -amount,
                    `Withdrawal request via ${method}`
                );
                
                // Update local wallet data
                this.userWallet.balance = newBalance;
                this.userWallet.withdrawn += amount;
                this.updateUI();
                
                // Reset form
                document.getElementById('withdraw-amount').value = '';
                document.getElementById('account-details').value = '';
                
                this.showNotification(`Withdrawal request submitted for ${amount.toLocaleString()} coins. It will be processed within 48 hours.`);
            } else {
                throw new Error('Failed to update wallet');
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            this.showNotification('Withdrawal failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    showNotification(message) {
        console.log('Showing notification:', message);
        
        const notification = document.getElementById('notification');
        if (!notification) {
            console.error('Notification element not found');
            return;
        }
        
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Earnzy App...');
    window.earnzyApp = new EarnzyApp();
});

// Export for global access
window.EarnzyApp = EarnzyApp;
