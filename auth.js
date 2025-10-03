// Authentication Functions
const authFunctions = {
    // Check if user is authenticated
    async checkAuthStatus() {
        try {
            console.log('Checking auth status...');
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) {
                console.error('Auth check error:', error);
                throw error;
            }
            
            console.log('Auth status:', user ? 'Logged in' : 'Not logged in');
            return user;
        } catch (error) {
            console.error('Error in checkAuthStatus:', error);
            return null;
        }
    },

    // Email login
    async loginWithEmail(email, password) {
        try {
            console.log('Logging in with email:', email);
            
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });
            
            if (error) {
                console.error('Login error:', error);
                throw error;
            }
            
            console.log('Login successful:', data.user.email);
            return data;
        } catch (error) {
            console.error('Error in loginWithEmail:', error);
            throw error;
        }
    },

    // Email signup
    async signUp(email, password) {
        try {
            console.log('Signing up with email:', email);
            
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });
            
            if (error) {
                console.error('Signup error:', error);
                throw error;
            }
            
            console.log('Signup successful:', data.user?.email);
            return data;
        } catch (error) {
            console.error('Error in signUp:', error);
            throw error;
        }
    },

    // Google login
    async loginWithGoogle() {
        try {
            console.log('Starting Google login...');
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            
            if (error) {
                console.error('Google login error:', error);
                throw error;
            }
            
            console.log('Google login initiated');
            return data;
        } catch (error) {
            console.error('Error in loginWithGoogle:', error);
            throw error;
        }
    },

    // Facebook login
    async loginWithFacebook() {
        try {
            console.log('Starting Facebook login...');
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: window.location.origin
                }
            });
            
            if (error) {
                console.error('Facebook login error:', error);
                throw error;
            }
            
            console.log('Facebook login initiated');
            return data;
        } catch (error) {
            console.error('Error in loginWithFacebook:', error);
            throw error;
        }
    },

    // Sign out
    async signOut() {
        try {
            console.log('Signing out...');
            
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Sign out error:', error);
                throw error;
            }
            
            console.log('Sign out successful');
            return true;
        } catch (error) {
            console.error('Error in signOut:', error);
            return false;
        }
    },

    // Get current session
    async getSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Session error:', error);
                throw error;
            }
            
            return session;
        } catch (error) {
            console.error('Error in getSession:', error);
            return null;
        }
    },

    // Reset password
    async resetPassword(email) {
        try {
            console.log('Resetting password for:', email);
            
            const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password'
            });
            
            if (error) {
                console.error('Password reset error:', error);
                throw error;
            }
            
            console.log('Password reset email sent');
            return data;
        } catch (error) {
            console.error('Error in resetPassword:', error);
            throw error;
        }
    },

    // Update password
    async updatePassword(newPassword) {
        try {
            console.log('Updating password...');
            
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) {
                console.error('Password update error:', error);
                throw error;
            }
            
            console.log('Password updated successfully');
            return data;
        } catch (error) {
            console.error('Error in updatePassword:', error);
            throw error;
        }
    },

    // Get user metadata
    async getUserMetadata() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            return user?.user_metadata || {};
        } catch (error) {
            console.error('Error getting user metadata:', error);
            return {};
        }
    },

    // Check if email is verified
    async isEmailVerified() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            
            if (error) throw error;
            return user?.email_confirmed_at !== null;
        } catch (error) {
            console.error('Error checking email verification:', error);
            return false;
        }
    },

    // Resend verification email
    async resendVerificationEmail() {
        try {
            const { data, error } = await supabase.auth.resend({
                type: 'signup',
                email: (await this.getSession())?.user?.email
            });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error resending verification email:', error);
            throw error;
        }
    },

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate password strength
    validatePassword(password) {
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        return { valid: true, message: 'Password is strong' };
    }
};

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, session?.user?.email);
    
    if (event === 'SIGNED_IN' && window.earnzyApp) {
        window.earnzyApp.currentUser = session.user;
        window.earnzyApp.showPage('home-page');
        window.earnzyApp.loadUserData();
    } else if (event === 'SIGNED_OUT' && window.earnzyApp) {
        window.earnzyApp.currentUser = null;
        window.earnzyApp.showPage('auth-page');
    }
});

// Export for use in other files
window.authFunctions = authFunctions;
