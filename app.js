// Main Application Logic
class EarnzyApp {
    constructor() {
        this.currentUser = null;
        this.userWallet = {
            balance: 0,
            earned: 0,
            withdrawn: 0,
            referral_code: ''
        };
        
        this.init();
    }

    async init() {
        // Check authentication status
        await this.checkAuthStatus();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show welcome notification
        setTimeout(() => {
            this.showNotification('Welcome to Earnzy! Start earning now.');
        }, 1000);
    }

    async checkAuthStatus() {
        const user = await authFunctions.checkAuthStatus();
        
        if (user) {
            this.currentUser = user;
            document.getElementById('login-page').classList.remove('active');
            document.getElementById('home-page').classList.add('active');
            await this.loadUserData();
        } else {
            this.showPage('login-page');
        }
    }

    async loadUserData() {
        this.showLoading(true);
        
        try {
            // Get user wallet data
            let wallet = await supabaseFunctions.getUserWallet(this.currentUser.id);
            
            if (!wallet) {
                // Create wallet if doesn't exist
                wallet = await supabaseFunctions.createUserWallet(this.currentUser.id);
            }
            
            if (wallet) {
                this.userWallet = wallet;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showNotification('Error loading data. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    updateUI() {
        // Update wallet balance
        document.getElementById('wallet-amount').textContent = this.userWallet.balance + ' Coins';
        
        // Update stats
        document.getElementById('total-earned').textContent = this.userWallet.earned;
        document.getElementById('total-withdrawn').textContent = this.userWallet.withdrawn;
        
        // Update referral code if available
        if (this.userWallet.referral_code) {
            document.getElementById('referral-code').value = this.userWallet.referral_code;
            document.getElementById('referral-link').value = `https://earnzy.com/ref/${this.userWallet.referral_code}`;
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = item.getAttribute('data-page');
                this.showPage(pageId);
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Feature Cards
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const pageId = card.getAttribute('data-page');
                this.showPage(pageId);
                
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                document.querySelector(`.nav-item[data-page="${pageId}"]`).classList.add('active');
            });
        });
        
        // Login Button
        document.getElementById('login-btn').addEventListener('click', () => this.handleLogin());
        
        // Google Login
        document.getElementById('google-login').addEventListener('click', () => this.handleGoogleLogin());
        
        // Facebook Login
        document.getElementById('facebook-login').addEventListener('click', () => this.handleFacebookLogin());
        
        // Check-in Button
        document.getElementById('check-in-btn').addEventListener('click', () => this.handleDailyCheckIn());
        
        // Watch Video Button
        document.getElementById('watch-video-btn').addEventListener('click', () => this.handleWatchVideo());
        
        // Scratch Card Button
        document.getElementById('scratch-now-btn').addEventListener('click', () => this.handleScratchCard());
        
        // Copy Referral Code
        document.getElementById('copy-referral').addEventListener('click', () => this.copyReferralCode());
        
        // Withdraw Button
        document.getElementById('withdraw-now-btn').addEventListener('click', () => this.handleWithdrawal());
        
        // Start Earning Button
        document.getElementById('start-earning').addEventListener('click', (e) => {
            e.preventDefault();
            this.showNotification('Choose any earning method to start!');
        });
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    showLoading(show) {
        document.getElementById('loading-spinner').style.display = show ? 'block' : 'none';
    }

    async handleLogin() {
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
            this.showNotification('Login successful!');
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification('Login failed. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    async handleGoogleLogin() {
        try {
            await authFunctions.loginWithGoogle();
        } catch (error) {
            console.error('Google login error:', error);
            this.showNotification('Google login failed. Please try again.');
        }
    }

    async handleFacebookLogin() {
        try {
            await authFunctions.loginWithFacebook();
        } catch (error) {
            console.error('Facebook login error:', error);
            this.showNotification('Facebook login failed. Please try again.');
        }
    }

    async handleDailyCheckIn() {
        const coinsEarned = 50;
        
        try {
            const newBalance = this.userWallet.balance + coinsEarned;
            const updatedWallet = await supabaseFunctions.updateWalletBalance(
                this.currentUser.id, 
                newBalance, 
                coinsEarned
            );
            
            if (updatedWallet) {
                // Update local wallet data
                this.userWallet.balance = newBalance;
                this.userWallet.earned += coinsEarned;
                this.updateUI();
                
                // Create transaction record
                await supabaseFunctions.createTransaction(
                    this.currentUser.id,
                    'checkin',
                    coinsEarned,
                    'Daily check-in bonus'
                );
                
                this.showNotification(`Daily check-in successful! You earned ${coinsEarned} coins.`);
                document.getElementById('check-in-btn').textContent = 'Checked In Today';
                document.getElementById('check-in-btn').disabled = true;
            }
        } catch (error) {
            console.error('Check-in error:', error);
            this.showNotification('Check-in failed. Please try again.');
        }
    }

    async handleWatchVideo() {
        const coinsEarned = Math.floor(Math.random() * 11) + 10; // 10-20 coins
        
        try {
            const newBalance = this.userWallet.balance + coinsEarned;
            const updatedWallet = await supabaseFunctions.updateWalletBalance(
                this.currentUser.id, 
                newBalance, 
                coinsEarned
            );
            
            if (updatedWallet) {
                // Update local wallet data
                this.userWallet.balance = newBalance;
                this.userWallet.earned += coinsEarned;
                this.updateUI();
                
                // Create transaction record
                await supabaseFunctions.createTransaction(
                    this.currentUser.id,
                    'watch_video',
                    coinsEarned,
                    'Watched video ad'
                );
                
                this.showNotification(`You earned ${coinsEarned} coins for watching the video!`);
            }
        } catch (error) {
            console.error('Watch video error:', error);
            this.showNotification('Failed to add coins. Please try again.');
        }
    }

    async handleScratchCard() {
        const coinsEarned = Math.floor(Math.random() * 46) + 5; // 5-50 coins
        
        try {
            const newBalance = this.userWallet.balance + coinsEarned;
            const updatedWallet = await supabaseFunctions.updateWalletBalance(
                this.currentUser.id, 
                newBalance, 
                coinsEarned
            );
            
            if (updatedWallet) {
                // Update local wallet data
                this.userWallet.balance = newBalance;
                this.userWallet.earned += coinsEarned;
                this.updateUI();
                
                // Create transaction record
                await supabaseFunctions.createTransaction(
                    this.currentUser.id,
                    'scratch_card',
                    coinsEarned,
                    'Scratch card reward'
                );
                
                this.showNotification(`Congratulations! You won ${coinsEarned} coins from scratch card!`);
            }
        } catch (error) {
            console.error('Scratch card error:', error);
            this.showNotification('Failed to process scratch card. Please try again.');
        }
    }

    copyReferralCode() {
        const referralCode = document.getElementById('referral-code');
        referralCode.select();
        document.execCommand('copy');
        this.showNotification('Referral code copied to clipboard!');
    }

    async handleWithdrawal() {
        const amount = parseInt(document.getElementById('withdraw-amount').value);
        const method = document.getElementById('payment-method').value;
        const account = document.getElementById('account-details').value;
        
        if (!amount || amount < 10000) {
            this.showNotification('Minimum withdrawal is 10,000 coins (₹100)');
            return;
        }
        
        if (amount > this.userWallet.balance) {
            this.showNotification('Insufficient balance');
            return;
        }
        
        if (!account) {
            this.showNotification('Please enter your account details');
            return;
        }
        
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
                
                this.showNotification(`Withdrawal request submitted for ${amount} coins. It will be processed within 48 hours.`);
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            this.showNotification('Withdrawal failed. Please try again.');
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

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.earnzyApp = new EarnzyApp();
});
