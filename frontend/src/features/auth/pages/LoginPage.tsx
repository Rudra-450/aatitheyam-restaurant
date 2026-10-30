import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Lock, User, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await login(identifier, password);
      navigate('/admin');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid username/email or password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d12] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Owner Administration</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight">
            Aatitheyam Cafe & Bhojnalaya
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Sign in to manage your restaurant's digital menu
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#151720] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or owner@royalsaffron.com"
                  autoComplete="username"
                  required
                  className="w-full bg-[#1c1f2b] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#1c1f2b] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Initial default credentials hint for convenience */}
          <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-gray-400">
            <p>Default credentials created by bootstrap:</p>
            <p className="font-mono text-amber-400/90 mt-1">
              Username: <span className="text-gray-200">admin</span> • Password: <span className="text-gray-200">Admin@12345</span>
            </p>
          </div>
        </div>

        {/* Back to Public Menu Link */}
        <div className="text-center mt-6">
          <Link
            to="/menu"
            className="text-xs text-gray-400 hover:text-amber-400 transition-colors inline-flex items-center gap-1.5"
          >
            <span>← View Public Digital Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
