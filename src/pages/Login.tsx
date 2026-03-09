import { useState } from "react";
import { useNavigate } from "react-router-dom";
import loginBg from "@/assets/login-bg.jpg";

const Login = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [regFirst, setRegFirst] = useState('');
  const [regLast, setRegLast] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Mock admin login
    setTimeout(() => {
      if (loginEmail && loginPassword) {
        localStorage.setItem('racynkx_admin', JSON.stringify({ name: 'Admin RACYNKX', email: loginEmail }));
        navigate('/dashboard');
      } else {
        setError('Veuillez remplir tous les champs.');
      }
      setLoading(false);
    }, 800);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (regPassword !== regConfirm) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }
    setTimeout(() => {
      setRegSuccess(true);
      setLoading(false);
      setTimeout(() => { setActiveTab('login'); setRegSuccess(false); }, 2000);
    }, 800);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Brand */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center">
        <img src={loginBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[rgba(10,10,15,0.55)]" />
        <div className="absolute top-8 left-8 z-10">
          <span className="font-logo text-foreground text-2xl tracking-wide">RACYNKX</span>
        </div>
        <div className="relative z-10 text-center px-12">
          <h1 className="font-display text-foreground text-5xl uppercase leading-tight mb-4">
            WHERE RACING<br />MEETS YOU
          </h1>
          <p className="font-ui text-rx-text-secondary text-base">
            La plateforme sociale du motorsport
          </p>
        </div>
        <div className="absolute bottom-8 left-8 z-10">
          <span className="font-mono-data text-rx-text-muted text-xs">
            Outil d'administration interne · V1
          </span>
        </div>
      </div>

      {/* Right Panel - Auth */}
      <div className="w-full md:w-1/2 bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="md:hidden mb-10 text-center">
            <span className="font-logo text-foreground text-3xl tracking-wide">RACYNKX</span>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-8 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('login')}
              className={`font-display uppercase text-sm pb-3 tracking-wide transition-colors ${
                activeTab === 'login'
                  ? 'text-foreground border-b-2 border-rx-blue'
                  : 'text-rx-text-muted hover:text-rx-text-secondary'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`font-display uppercase text-sm pb-3 tracking-wide transition-colors ${
                activeTab === 'register'
                  ? 'text-foreground border-b-2 border-rx-blue'
                  : 'text-rx-text-muted hover:text-rx-text-secondary'
              }`}
            >
              Inscription
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[hsl(0_72%_57%/0.1)] border border-[hsl(0_72%_57%/0.3)] text-rx-danger text-sm font-ui">
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">Email</label>
                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                  className="input-field w-full px-4 py-3" placeholder="admin@racynkx.com" />
              </div>
              <div>
                <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showLoginPw ? 'text' : 'password'} value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="input-field w-full px-4 py-3 pr-12" />
                  <button type="button" onClick={() => setShowLoginPw(!showLoginPw)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-rx-text-muted hover:text-rx-text-secondary text-sm">
                    {showLoginPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <button type="button" className="text-sm font-ui text-rx-text-secondary hover:text-foreground transition-colors">
                  Mot de passe oublié? →
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-12 bg-rx-blue hover:bg-[hsl(216_100%_46%)] text-foreground font-display uppercase text-sm tracking-wide rounded-lg transition-colors disabled:opacity-50">
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {regSuccess ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-3">✓</div>
                  <p className="text-rx-success font-ui">Compte créé. Vous pouvez maintenant vous connecter.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">Prénom</label>
                      <input type="text" value={regFirst} onChange={e => setRegFirst(e.target.value)}
                        className="input-field w-full px-4 py-3" />
                    </div>
                    <div>
                      <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">Nom</label>
                      <input type="text" value={regLast} onChange={e => setRegLast(e.target.value)}
                        className="input-field w-full px-4 py-3" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">Email</label>
                    <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)}
                      className="input-field w-full px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <input type={showRegPw ? 'text' : 'password'} value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="input-field w-full px-4 py-3 pr-12" />
                      <button type="button" onClick={() => setShowRegPw(!showRegPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-rx-text-muted hover:text-rx-text-secondary text-sm">
                        {showRegPw ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-ui text-rx-text-secondary mb-1.5">Confirmer le mot de passe</label>
                    <div className="relative">
                      <input type={showRegConfirm ? 'text' : 'password'} value={regConfirm}
                        onChange={e => setRegConfirm(e.target.value)}
                        className="input-field w-full px-4 py-3 pr-12" />
                      <button type="button" onClick={() => setShowRegConfirm(!showRegConfirm)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-rx-text-muted hover:text-rx-text-secondary text-sm">
                        {showRegConfirm ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full h-12 bg-rx-blue hover:bg-[hsl(216_100%_46%)] text-foreground font-display uppercase text-sm tracking-wide rounded-lg transition-colors disabled:opacity-50">
                    {loading ? 'Création...' : 'Créer le compte admin'}
                  </button>
                  <p className="text-center text-xs font-ui text-rx-text-muted">
                    L'accès est réservé aux administrateurs RACYNKX autorisés.
                  </p>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
