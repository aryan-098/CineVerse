import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Film, Eye, EyeOff } from 'lucide-react';
import { login, register } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [tab,      setTab]      = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [form,     setForm]     = useState({ username:'', email:'', password:'' });
  const { loginUser, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  if (isLoggedIn) { navigate('/'); return null; }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (tab === 'login') {
        res = await login({ email: form.email, password: form.password });
      } else {
        if (!form.username) { toast.error('Username is required'); setLoading(false); return; }
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); setLoading(false); return; }
        res = await register({ username: form.username, email: form.email, password: form.password });
      }
      loginUser(res.data.user, res.data.token);
      toast.success(tab === 'login' ? `Welcome back, ${res.data.user.username}! 🎬` : `Welcome to CineVerse, ${res.data.user.username}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><Film size={28} style={{color:'#a78bfa', verticalAlign:'middle'}}/> Cine<span>Verse</span></div>
        <p className="auth-subtitle">Your ultimate movie review platform</p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab==='login' ? 'active' : ''}`}     onClick={() => setTab('login')}>Sign In</button>
          <button className={`auth-tab ${tab==='register' ? 'active' : ''}`}  onClick={() => setTab('register')}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label>Username</label>
              <input
                className="form-control"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={set('username')}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              className="form-control"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{position:'relative'}}>
              <input
                className="form-control"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                style={{paddingRight:44}}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', color:'#64748b', cursor:'pointer'}}
              >
                {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          {tab === 'login'
            ? <>Don't have an account? <a href="#" onClick={e => {e.preventDefault(); setTab('register')}}>Sign up</a></>
            : <>Already have an account? <a href="#" onClick={e => {e.preventDefault(); setTab('login')}}>Sign in</a></>
          }
        </div>

        {/* Demo credentials */}
        {/* <div style={{marginTop:24, padding:16, background:'rgba(124,58,237,0.08)', borderRadius:10, border:'1px solid rgba(124,58,237,0.2)'}}>
          <p style={{fontSize:'0.78rem', color:'#64748b', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em'}}>Demo Account</p>
          <p style={{fontSize:'0.84rem', color:'#94a3b8'}}>Email: <code style={{color:'#a78bfa'}}>alice@example.com</code></p>
          <p style={{fontSize:'0.84rem', color:'#94a3b8'}}>Password: <code style={{color:'#a78bfa'}}>Password123!</code></p>
        </div> */}
      </div>
    </div>
  );
}
