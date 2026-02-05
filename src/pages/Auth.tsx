import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, ShieldCheck, ChevronLeft, Sparkles, Globe, Banknote } from "lucide-react";
import { countries, currencies } from "@/lib/countries";
import { sendEmail } from "@/utils/email";

type AuthStage = "credentials" | "email_otp" | "forgot_password";

const Auth = () => {
  const [authStage, setAuthStage] = useState<AuthStage>("credentials");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form Data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [otpToken, setOtpToken] = useState("");

  const navigate = useNavigate();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back to Bookish Bliss!");
        navigate("/");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              country: country, // Saving ISO Code now (e.g. US)
              currency: currency
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Log transmission to Intelligence Stream
          await sendEmail(
            email,
            "Identity Verification Protocol: Initiated",
            `Your authorization node code is pending verification. Please confirm to finalize registry membership.`,
            true // Silent (only in stream)
          );
          toast.success("Account created! Please verify your email.");
          setAuthStage("email_otp");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpToken,
        type: 'signup'
      });

      if (error) throw error;
      toast.success("Email verified! Welcome aboard.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Invalid OTP code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) {
        if (error.message.includes("provider is not enabled")) {
          toast.error("Google login is currently disabled in the backend. Please use email/password.");
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (error) throw error;

      // Log transmission to Intelligence Stream
      await sendEmail(
        email,
        "Access Recall Protocol: Authorized",
        `An access recall link has been dispatched to your primary communication channel.`,
        true // Silent
      );

      toast.success("Check your email for the reset link!");
      setAuthStage("credentials");
      setIsLogin(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-black selection:text-white">
      <Header />

      <main className="flex-1 flex items-center justify-center pt-48 pb-32 px-6 relative overflow-hidden bg-[#FEF7EB]">
        {/* Cinematic Background Image with Premium Overlay */}
        <div className="absolute inset-0 z-0 scale-110">
          <img
            src="https://images.unsplash.com/photo-1507842217121-9d590864706f?auto=format&fit=crop&q=80"
            alt="Library Background"
            className="w-full h-full object-cover opacity-100 blur-[2px]"
          />
          <div className="absolute inset-0 bg-[#FEF7EB]/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FEF7EB] via-transparent to-[#FEF7EB] opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FEF7EB] via-transparent to-[#FEF7EB] opacity-90" />

          {/* Animated Glow Accents */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[100px] animate-pulse-slow delay-700" />
        </div>

        <div className="w-full max-w-[520px] relative z-10 animate-fade-in px-4">
          {/* Presidential Glass Card */}
          <div className="bg-white/70 backdrop-blur-[40px] rounded-[3.5rem] p-10 md:p-14 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.1)] border border-white/60 text-center ring-1 ring-white/40 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-1000" />

            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-brand-black text-white mb-10 shadow-2xl shadow-brand-black/20 transform -rotate-12 group-hover:rotate-0 transition-all duration-700">
              <ShieldCheck className="w-10 h-10 text-brand-secondary" />
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-black italic text-brand-black mb-4 tracking-tighter">
              {authStage === "credentials" && (isLogin ? "Welcome back" : "Join the circle")}
              {authStage === "email_otp" && "Verify Intel"}
              {authStage === "forgot_password" && "Reset Link"}
            </h1>
            <p className="text-brand-grey font-black uppercase tracking-[0.3em] text-[10px] mb-12">
              {authStage === "credentials" && (isLogin ? "Authenticate to access the archive" : "Initialize your literary identity")}
              {authStage === "email_otp" && "Awaiting transmission verification"}
              {authStage === "forgot_password" && "Dispatching secure recovery signal"}
            </p>

            {authStage === "credentials" && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-6 text-left">
                {!isLogin && (
                  <div className="space-y-6 animate-slide-up">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 ml-2">Member Identity</Label>
                      <div className="relative group/field">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey/40 group-focus-within/field:text-brand-black transition-colors" />
                        <Input
                          placeholder="EX: JULIAN MORNES"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required={!isLogin}
                          className="pl-16 h-16 rounded-2xl bg-white/40 border-brand-primary/10 focus:bg-white transition-all focus:border-brand-primary/40 text-sm font-bold placeholder:text-brand-grey/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 ml-2">Origin</Label>
                        <div className="relative">
                          <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey/40 z-10" />
                          <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger className="pl-14 h-16 rounded-2xl bg-white/40 border-brand-primary/10 focus:bg-white text-xs font-bold">
                              <SelectValue placeholder="LOC" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] rounded-2xl">
                              {countries.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  <span className="mr-2">{c.flag}</span>{c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 ml-2">Valuation</Label>
                        <div className="relative">
                          <Banknote className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-grey/40 z-10" />
                          <Select value={currency} onValueChange={setCurrency}>
                            <SelectTrigger className="pl-14 h-16 rounded-2xl bg-white/40 border-brand-primary/10 focus:bg-white text-xs font-bold">
                              <SelectValue placeholder="CUR" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[300px] rounded-2xl">
                              {currencies.map((c) => (
                                <SelectItem key={c.code} value={c.code}>
                                  <span className="font-serif font-black mr-2 text-brand-secondary">{c.symbol}</span> {c.code}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 ml-2">Registry Email</Label>
                  <div className="relative group/field">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey/40 group-focus-within/field:text-brand-black transition-colors" />
                    <Input
                      type="email"
                      placeholder="YOU@DOMAIN.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-16 h-16 rounded-2xl bg-white/40 border-brand-primary/10 focus:bg-white transition-all focus:border-brand-primary/40 text-sm font-bold placeholder:text-brand-grey/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50">Passphrase</Label>
                    {isLogin && (
                      <button type="button" onClick={() => setAuthStage("forgot_password")} className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-secondary hover:text-brand-black transition-colors">
                        Lost Access?
                      </button>
                    )}
                  </div>
                  <div className="relative group/field">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey/40 group-focus-within/field:text-brand-black transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-16 h-16 rounded-2xl bg-white/40 border-brand-primary/10 focus:bg-white transition-all focus:border-brand-primary/40 text-sm font-bold placeholder:text-brand-grey/20"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 bg-brand-black text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl shadow-2xl hover:bg-brand-secondary hover:text-brand-black hover:-translate-y-1 active:translate-y-0 transition-all duration-500 flex items-center justify-center gap-4 group/btn overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  <span className="relative z-10">{isLoading ? "Synchronizing..." : (isLogin ? "Authenticate" : "Register")}</span>
                  {!isLoading && <ArrowRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-2 transition-transform" />}
                </Button>

                <div className="relative flex items-center gap-6 py-4">
                  <div className="flex-1 h-[1px] bg-brand-primary/10" />
                  <span className="text-[9px] font-black uppercase tracking-[0.5em] text-brand-grey/30">Intelligence Link</span>
                  <div className="flex-1 h-[1px] bg-brand-primary/10" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="w-full h-16 gap-6 border-brand-primary/10 rounded-2xl hover:bg-white hover:border-brand-primary/40 transition-all font-black uppercase tracking-[0.3em] shadow-sm bg-white/40 backdrop-blur-md group/google relative overflow-hidden active:scale-[0.98]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/google:translate-x-full transition-transform duration-1000" />
                  <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm border border-brand-primary/5">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>
                  <span className="text-[10px] tracking-[0.4em] relative z-10">Glow Matrix Link</span>
                </Button>

                <div className="pt-8 text-center border-t border-brand-primary/5">
                  <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black transition-all flex flex-col items-center gap-3 w-full group/switch">
                    <span>{isLogin ? "Not a registered member?" : "Already within the circle?"}</span>
                    <span className="text-brand-black font-black text-sm italic font-serif underline underline-offset-8 decoration-brand-secondary/40 group-hover/switch:decoration-brand-secondary transition-all decoration-2">{isLogin ? "Apply for Eligibility" : "Return to Authenticator"}</span>
                  </button>
                </div>
              </form>
            )}

            {authStage === "email_otp" && (
              <form onSubmit={handleVerifyEmailOtp} className="space-y-12 animate-fade-in py-8">
                <div className="space-y-6">
                  <div className="flex justify-center gap-4">
                    <Input
                      placeholder="CODE"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      className="text-center text-4xl h-24 bg-white/40 border-brand-primary/10 rounded-[2.5rem] font-serif font-black italic tracking-[0.5em] focus:bg-white transition-all shadow-inner focus:border-brand-secondary/40"
                      maxLength={6}
                    />
                  </div>
                  <p className="text-[10px] text-brand-grey/40 font-black uppercase tracking-[0.3em]">Check your secure transmission channel</p>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-16 bg-brand-black text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl shadow-xl hover:bg-brand-secondary hover:text-brand-black transition-all">
                  {isLoading ? "Verifying..." : "Commit Authorization"}
                </Button>
                <button type="button" onClick={() => setAuthStage("credentials")} className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black transition-all">
                  Switch Transmission Target
                </button>
              </form>
            )}

            {authStage === "forgot_password" && (
              <form onSubmit={handleForgotPassword} className="space-y-8 text-left animate-fade-in py-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 ml-2">Registry Email</Label>
                  <div className="relative group/field">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey/40 group-focus-within/field:text-brand-black transition-colors" />
                    <Input
                      type="email"
                      placeholder="YOU@DOMAIN.COM"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-16 h-16 bg-white/40 border-brand-primary/10 rounded-2xl focus:bg-white transition-all focus:border-brand-primary/40 text-sm font-bold"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading} className="w-full h-16 bg-brand-black text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl shadow-xl hover:bg-brand-secondary hover:text-brand-black transition-all">
                  {isLoading ? "Dispatching..." : "Request Recovery Link"}
                </Button>
                <button type="button" onClick={() => setAuthStage("credentials")} className="w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-brand-grey hover:text-brand-black flex items-center justify-center gap-3 py-4">
                  <ChevronLeft className="w-5 h-5" /> Return to Archives
                </button>
              </form>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center gap-4 text-brand-black/40 group/secure">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] group-hover/secure:text-brand-black transition-colors">Quantum Encrypted Session Active</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
