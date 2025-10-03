// Authentication Functions
const authFunctions = {
    // Check if user is authenticated
    async checkAuthStatus() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Auth check error:', error);
            return null;
        }
    },

    // Email login
    async loginWithEmail(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    // Email signup
    async signUp(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
            });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Sign up error:', error);
            throw error;
        }
    },

    // Google login
    async loginWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    },

    // Facebook login
    async loginWithFacebook() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
            });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Facebook login error:', error);
            throw error;
        }
    },

    // Sign out
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Sign out error:', error);
            return false;
        }
    },

    // Get current session
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Session error:', error);
            return null;
        }
    }
};

// Export for use in other files
window.authFunctions = authFunctions;
