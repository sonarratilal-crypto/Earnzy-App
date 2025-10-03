// Supabase Configuration
const supabaseUrl = 'https://vbvggminjsydhytwklef.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidmdnbWluanN5ZGh5dHdrbGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0Mjc4OTksImV4cCI6MjA3NTAwMzg5OX0.zpX745KdTOY4rn2VTt_aoQyCiQKZKcwrW-ki39jjP3A';

// Initialize Supabase
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Supabase Database Functions
const supabaseFunctions = {
    // Get user wallet data
    async getUserWallet(userId) {
        try {
            console.log('Getting wallet for user:', userId);
            const { data, error } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error) {
                console.error('Error getting wallet:', error);
                throw error;
            }
            
            console.log('Wallet data:', data);
            return data;
        } catch (error) {
            console.error('Error in getUserWallet:', error);
            return null;
        }
    },

    // Create user wallet
    async createUserWallet(userId) {
        try {
            console.log('Creating wallet for user:', userId);
            const referralCode = 'EARNZY' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const { data, error } = await supabase
                .from('wallets')
                .insert([
                    { 
                        user_id: userId, 
                        balance: 0, 
                        earned: 0, 
                        withdrawn: 0,
                        referral_code: referralCode,
                        total_referrals: 0
                    }
                ])
                .select()
                .single();
            
            if (error) {
                console.error('Error creating wallet:', error);
                throw error;
            }
            
            console.log('Wallet created:', data);
            return data;
        } catch (error) {
            console.error('Error in createUserWallet:', error);
            return null;
        }
    },

    // Update wallet balance
    async updateWalletBalance(userId, newBalance, earned = 0, withdrawn = 0) {
        try {
            console.log('Updating wallet for user:', userId, 'New balance:', newBalance);
            
            // First get current wallet to calculate new values
            const currentWallet = await this.getUserWallet(userId);
            if (!currentWallet) {
                throw new Error('Wallet not found');
            }

            const updates = {
                balance: newBalance,
                updated_at: new Date().toISOString()
            };

            if (earned > 0) {
                updates.earned = currentWallet.earned + earned;
            }

            if (withdrawn > 0) {
                updates.withdrawn = currentWallet.withdrawn + withdrawn;
            }

            const { data, error } = await supabase
                .from('wallets')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Error updating wallet:', error);
                throw error;
            }

            console.log('Wallet updated:', data);
            return data;
        } catch (error) {
            console.error('Error in updateWalletBalance:', error);
            return null;
        }
    },

    // Add coins to wallet
    async addCoins(userId, coins, type, description) {
        try {
            console.log('Adding coins:', coins, 'to user:', userId);
            
            const currentWallet = await this.getUserWallet(userId);
            if (!currentWallet) {
                throw new Error('Wallet not found');
            }

            const newBalance = currentWallet.balance + coins;
            const newEarned = currentWallet.earned + coins;

            const { data, error } = await supabase
                .from('wallets')
                .update({
                    balance: newBalance,
                    earned: newEarned,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;

            // Create transaction record
            await this.createTransaction(userId, type, coins, description);

            console.log('Coins added successfully');
            return data;
        } catch (error) {
            console.error('Error in addCoins:', error);
            return null;
        }
    },

    // Create withdrawal request
    async createWithdrawal(userId, amount, method, accountDetails) {
        try {
            console.log('Creating withdrawal for user:', userId, 'Amount:', amount);
            
            const { data, error } = await supabase
                .from('withdrawals')
                .insert([
                    {
                        user_id: userId,
                        amount: amount,
                        method: method,
                        account_details: accountDetails,
                        status: 'pending'
                    }
                ])
                .select();

            if (error) {
                console.error('Error creating withdrawal:', error);
                throw error;
            }

            console.log('Withdrawal created:', data);
            return data;
        } catch (error) {
            console.error('Error in createWithdrawal:', error);
            return null;
        }
    },

    // Create transaction record
    async createTransaction(userId, type, amount, description) {
        try {
            console.log('Creating transaction for user:', userId, 'Type:', type, 'Amount:', amount);
            
            const { data, error } = await supabase
                .from('transactions')
                .insert([
                    {
                        user_id: userId,
                        type: type,
                        amount: amount,
                        description: description,
                        status: 'completed'
                    }
                ])
                .select();

            if (error) {
                console.error('Error creating transaction:', error);
                throw error;
            }

            console.log('Transaction created:', data);
            return data;
        } catch (error) {
            console.error('Error in createTransaction:', error);
            return null;
        }
    },

    // Get user transactions
    async getUserTransactions(userId) {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },

    // Get user withdrawals
    async getUserWithdrawals(userId) {
        try {
            const { data, error } = await supabase
                .from('withdrawals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting withdrawals:', error);
            return [];
        }
    },

    // Check if user already checked in today
    async getTodayCheckin(userId) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .eq('type', 'daily_checkin')
                .gte('created_at', today + 'T00:00:00Z')
                .lte('created_at', today + 'T23:59:59Z');

            if (error) throw error;
            return data && data.length > 0;
        } catch (error) {
            console.error('Error checking today checkin:', error);
            return false;
        }
    },

    // Get today's scratch cards count
    async getTodayScratchCards(userId) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', userId)
                .eq('type', 'scratch_card')
                .gte('created_at', today + 'T00:00:00Z')
                .lte('created_at', today + 'T23:59:59Z');

            if (error) throw error;
            return data ? data.length : 0;
        } catch (error) {
            console.error('Error getting today scratch cards:', error);
            return 0;
        }
    },

    // Get app settings
    async getAppSettings() {
        try {
            const { data, error } = await supabase
                .from('app_settings')
                .select('*');

            if (error) throw error;
            
            const settings = {};
            data.forEach(setting => {
                settings[setting.setting_key] = setting.setting_value;
            });
            
            return settings;
        } catch (error) {
            console.error('Error getting app settings:', error);
            return {};
        }
    },

    // Get active tasks
    async getActiveTasks() {
        try {
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('is_active', true)
                .order('coins_reward', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting active tasks:', error);
            return [];
        }
    },

    // Complete task for user
    async completeTask(userId, taskId) {
        try {
            const { data, error } = await supabase
                .from('user_tasks')
                .insert([
                    {
                        user_id: userId,
                        task_id: taskId,
                        status: 'completed'
                    }
                ])
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error completing task:', error);
            return null;
        }
    },

    // Check if task already completed by user
    async isTaskCompleted(userId, taskId) {
        try {
            const { data, error } = await supabase
                .from('user_tasks')
                .select('*')
                .eq('user_id', userId)
                .eq('task_id', taskId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return !!data;
        } catch (error) {
            console.error('Error checking task completion:', error);
            return false;
        }
    },

    // Get user referrals
    async getUserReferrals(userId) {
        try {
            const { data, error } = await supabase
                .from('referrals')
                .select('*')
                .eq('referrer_id', userId);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting user referrals:', error);
            return [];
        }
    },

    // Create referral
    async createReferral(referrerId, referredId) {
        try {
            const { data, error } = await supabase
                .from('referrals')
                .insert([
                    {
                        referrer_id: referrerId,
                        referred_id: referredId,
                        referrer_bonus: 250,
                        referred_bonus: 250,
                        status: 'completed'
                    }
                ])
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating referral:', error);
            return null;
        }
    },

    // Update user profile
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .upsert([
                    {
                        user_id: userId,
                        ...updates,
                        updated_at: new Date().toISOString()
                    }
                ])
                .select();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating user profile:', error);
            return null;
        }
    },

    // Get user profile
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') throw error;
            return data;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    },

    // Test connection
    async testConnection() {
        try {
            const { data, error } = await supabase
                .from('wallets')
                .select('count')
                .limit(1);

            if (error) throw error;
            console.log('Supabase connection test: SUCCESS');
            return true;
        } catch (error) {
            console.error('Supabase connection test: FAILED', error);
            return false;
        }
    }
};

// Test connection on load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Testing Supabase connection...');
    await supabaseFunctions.testConnection();
});

// Export for use in other files
window.supabaseFunctions = supabaseFunctions;
window.supabaseClient = supabase;
