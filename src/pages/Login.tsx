import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, ShieldX } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

const AccessDeniedPopup = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center">
    <div className="absolute inset-0 bg-[rgba(0,0,0,0.7)]" onClick={onClose} />
    <div className="relative bg-rx-surface border border-border rounded-xl w-full max-w-[420px] overflow-hidden animate-fade-in mx-4">
      <div className="p-8 text-center">
        <div className="w-14 h-14 rounded-full bg-[hsl(0_72%_57%/0.15)] flex items-center justify-center mx-auto mb-5">
          <ShieldX size={28} className="text-rx-danger" />
        </div>
        <h3 className="font-display text-xl text-foreground mb-3">Accès refusé</h3>
        <p className="font-ui text-sm text-rx-text-secondary leading-relaxed mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          <br />
          Votre compte ne dispose pas des droits d'administrateur.
        </p>
        <button onClick={onClose}
          className="w-full h-11 bg-rx-blue hover:bg-[hsl(216_100%_46%)] text-foreground font-display uppercase text-sm tracking-wide rounded-lg transition-colors">
          Compris
        </button>
      </div>
    </div>
  </div>
);

const Login = () => {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeniedPopup, setShowDeniedPopup] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('denied') === 'true') {
      setShowDeniedPopup(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!loginEmail.trim()) {
      setError("L'email est requis");
      setLoading(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setError("Format d'email invalide");
      setLoading(false);
      return;
    }
    if (!loginPassword) {
      setError('Le mot de passe est requis');
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn(loginEmail, loginPassword);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Erreur de session');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.account_role !== 'admin') {
      await supabase.auth.signOut();
      setShowDeniedPopup(true);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  const PasswordToggle = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button type="button" onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-rx-text-muted hover:text-rx-text-secondary transition-colors">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black from-20% to-[#1A44FF]" />
        <div className="absolute top-8 left-8 z-10">
          {/* <img src="/logo_racynkx.webp" alt="Logo" className="h-8 rounded-sm object-cover" /> */}
        </div>
        <div className="relative z-10 text-center px-12">
          <img src="/logo_racynkx.webp" alt="Logo" className="h-24 rounded-sm object-cover" />

        </div>
        <div className="absolute bottom-8 left-8 z-10">
          <span className="font-mono-data text-rx-text-muted text-xs">
            Outil d'administration interne · V1
          </span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-1/2 bg-background flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[380px]">
          <div className="md:hidden mb-10 text-center">
            <span className="font-logo text-foreground text-3xl tracking-wide">RACYNKX</span>
          </div>

          <div className="flex gap-8 mb-8 border-b border-border">
            <span className="font-ui font-medium text-[13px] pb-3 tracking-wide text-foreground border-b-2 border-rx-blue">
              Connexion
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[hsl(0_72%_57%/0.1)] border border-[hsl(0_72%_57%/0.3)] text-rx-danger text-[13px] font-ui">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[13px] font-ui text-rx-text-secondary mb-1.5">Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                className="input-field w-full px-4 py-3" placeholder="admin@racynkx.com" />
            </div>
            <div>
              <label className="block text-[13px] font-ui text-rx-text-secondary mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showLoginPw ? 'text' : 'password'} value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="input-field w-full px-4 py-3 pr-10" />
                <PasswordToggle show={showLoginPw} toggle={() => setShowLoginPw(!showLoginPw)} />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-rx-blue hover:bg-[hsl(216_100%_46%)] text-foreground font-display uppercase text-sm tracking-wide rounded-lg transition-colors disabled:opacity-50">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {showDeniedPopup && (
            <AccessDeniedPopup onClose={() => setShowDeniedPopup(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;