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
            const { data, error } = await supabase
                .from('wallets')
                .select('*')
                .eq('user_id', userId)
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error getting wallet:', error);
            return null;
        }
    },

    // Create user wallet
    async createUserWallet(userId) {
        try {
            const referralCode = 'EARNZY' + Math.random().toString(36).substring(2, 8).toUpperCase();
            
            const { data, error } = await supabase
                .from('wallets')
                .insert([
                    { 
                        user_id: userId, 
                        balance: 0, 
                        earned: 0, 
                        withdrawn: 0,
                        referral_code: referralCode
                    }
                ])
                .select()
                .single();
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating wallet:', error);
            return null;
        }
    },

    // Update wallet balance
    async updateWalletBalance(userId, newBalance, earned = 0, withdrawn = 0) {
        try {
            const updates = {
                balance: newBalance,
                updated_at: new Date().toISOString()
            };

            if (earned > 0) {
                updates.earned = (await this.getUserWallet(userId)).earned + earned;
            }

            if (withdrawn > 0) {
                updates.withdrawn = (await this.getUserWallet(userId)).withdrawn + withdrawn;
            }

            const { data, error } = await supabase
                .from('wallets')
                .update(updates)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating wallet:', error);
            return null;
        }
    },

    // Create withdrawal request
    async createWithdrawal(userId, amount, method, accountDetails) {
        try {
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

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating withdrawal:', error);
            return null;
        }
    },

    // Create transaction record
    async createTransaction(userId, type, amount, description) {
        try {
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

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating transaction:', error);
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
    }
};

// Export for use in other files
window.supabaseFunctions = supabaseFunctions;
