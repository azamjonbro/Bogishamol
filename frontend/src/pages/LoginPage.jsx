import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wheat, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
 const { login, user } = useAuth();
 const navigate = useNavigate();
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);
 const [loading, setLoading] = useState(false);

 if (user) {
  navigate('/', { replace: true });
  return null;
 }

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!username.trim() || !password) return;

  setLoading(true);
  try {
   await login(username.trim(), password);
   toast.success('Muvaffaqiyatli kirildi!');
   navigate('/', { replace: true });
  } catch (err) {
   toast.error(getErrorMessage(err));
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4 relative overflow-hidden">
   <div className="absolute top-5 right-5 z-20">
    <ThemeToggle showLabel />
   </div>

   <div className="w-full max-w-md animate-scale-in">
    <div className="glass rounded-2xl p-8 shadow-xl">
     {/* Logo */}
     <div className="text-center mb-8">
      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md">
       <Wheat className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-surface-100">
       Bog'ishamol
      </h1>
      <p className="text-surface-400 text-sm mt-1">Yemxona ERP & POS tizimi</p>
     </div>

     <form onSubmit={handleSubmit} className="space-y-5">
      <div>
       <label htmlFor="login-username" className="block text-sm font-medium text-surface-300 mb-1.5">
        Foydalanuvchi nomi
       </label>
       <input
        id="login-username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full px-4 py-3 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
        placeholder="admin"
        autoComplete="username"
        required
       />
      </div>

      <div>
       <label htmlFor="login-password" className="block text-sm font-medium text-surface-300 mb-1.5">
        Parol
       </label>
       <div className="relative">
        <input
         id="login-password"
         type={showPassword ? 'text' : 'password'}
         value={password}
         onChange={(e) => setPassword(e.target.value)}
         className="w-full px-4 py-3 pr-12 bg-surface-800/50 border border-surface-700 rounded-xl text-surface-100 placeholder-surface-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all"
         placeholder="••••••••"
         autoComplete="current-password"
         required
        />
        <button
         type="button"
         onClick={() => setShowPassword(!showPassword)}
         className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors"
        >
         {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
       </div>
      </div>

      <button
       type="submit"
       id="login-submit"
       disabled={loading}
       className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl disabled:opacity-50 transition-all duration-200 shadow-sm"
      >
       {loading ? (
        <span className="flex items-center justify-center gap-2">
         <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
         Kirish...
        </span>
       ) : 'Kirish'}
      </button>
     </form>
    </div>
   </div>
  </div>
 );
}
