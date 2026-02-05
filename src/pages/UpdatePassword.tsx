import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Logging utility for password reset flow
const logPasswordResetAction = (action: string, details: any) => {
    const log = {
        timestamp: new Date().toISOString(),
        action,
        details,
        route: window.location.pathname,
        hash: window.location.hash,
        search: window.location.search
    };

    console.group(`[PASSWORD RESET] ${action}`);
    console.log('Timestamp:', log.timestamp);
    console.log('Route:', log.route);
    console.log('Hash:', log.hash);
    console.log('Details:', details);
    console.groupEnd();

    // Store in localStorage for debugging
    try {
        const existingLogs = JSON.parse(localStorage.getItem("password_reset_logs") || "[]");
        localStorage.setItem("password_reset_logs", JSON.stringify([log, ...existingLogs].slice(0, 50)));
    } catch (error) {
        console.error("[PASSWORD RESET] Failed to log action:", error);
    }

    return log;
};

const UpdatePassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [sessionChecking, setSessionChecking] = useState(true);

    useEffect(() => {
        // Log page access
        logPasswordResetAction("PAGE_ACCESSED", {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
            fullUrl: window.location.href
        });

        // Check for errors in URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorDescription = hashParams.get("error_description");
        const error = hashParams.get("error");
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        // Log URL parameters
        logPasswordResetAction("URL_PARAMS_PARSED", {
            error,
            errorDescription,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
            type,
            allParams: Object.fromEntries(hashParams.entries())
        });

        if (error || errorDescription) {
            const msg = errorDescription
                ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
                : "Invalid or expired link.";

            logPasswordResetAction("ERROR_IN_URL", {
                error,
                errorDescription,
                decodedMessage: msg
            });

            toast.error(msg);

            setTimeout(() => {
                navigate("/auth");
            }, 3000);
            return;
        }

        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            logPasswordResetAction("AUTH_STATE_CHANGE", {
                event,
                hasSession: !!session,
                sessionUser: session?.user?.email || null
            });

            if (session || event === 'PASSWORD_RECOVERY') {
                setSessionChecking(false);

                if (event === 'PASSWORD_RECOVERY') {
                    logPasswordResetAction("PASSWORD_RECOVERY_EVENT", {
                        userEmail: session?.user?.email,
                        sessionId: session?.access_token?.substring(0, 20) + "..."
                    });
                }
            }
        });

        // Check current session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                logPasswordResetAction("SESSION_CHECK_ERROR", {
                    error: error.message,
                    errorCode: error.status
                });
            }

            if (session) {
                logPasswordResetAction("SESSION_FOUND", {
                    userEmail: session.user?.email,
                    expiresAt: session.expires_at
                });
                setSessionChecking(false);
            } else {
                logPasswordResetAction("NO_SESSION_FOUND", {
                    message: "User may need to click reset link again"
                });

                // If no session after 5 seconds, show error
                setTimeout(() => {
                    if (sessionChecking) {
                        logPasswordResetAction("SESSION_TIMEOUT", {
                            message: "No valid session found after 5 seconds"
                        });
                        toast.error("Invalid or expired reset link. Please request a new one.");
                        navigate("/auth");
                    }
                }, 5000);
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate, location]);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        logPasswordResetAction("FORM_SUBMITTED", {
            passwordLength: password.length,
            passwordsMatch: password === confirmPassword
        });

        // Validation: Passwords match
        if (password !== confirmPassword) {
            logPasswordResetAction("VALIDATION_ERROR", {
                error: "Passwords do not match"
            });
            toast.error("Credentials mismatch.");
            return;
        }

        // Validation: Minimum length
        if (password.length < 6) {
            logPasswordResetAction("VALIDATION_ERROR", {
                error: "Password too short",
                length: password.length
            });
            toast.error("Security key must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            logPasswordResetAction("UPDATE_PASSWORD_REQUEST", {
                message: "Sending password update request to Supabase"
            });

            const { data, error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) {
                logPasswordResetAction("UPDATE_PASSWORD_ERROR", {
                    error: error.message,
                    errorCode: error.status,
                    errorName: error.name
                });
                throw error;
            }

            logPasswordResetAction("UPDATE_PASSWORD_SUCCESS", {
                userEmail: data?.user?.email,
                userId: data?.user?.id
            });

            toast.success("Security credentials updated. Re-authenticating...");

            setTimeout(() => {
                logPasswordResetAction("REDIRECTING_TO_AUTH", {
                    message: "Password updated successfully, redirecting to login"
                });
                navigate("/auth");
            }, 2000);

        } catch (error: any) {
            logPasswordResetAction("UPDATE_PASSWORD_EXCEPTION", {
                error: error.message || "Unknown error",
                errorCode: error.status || "UNKNOWN",
                errorStack: error.stack?.substring(0, 200)
            });

            toast.error(error.message || "Failed to update credentials.");
        } finally {
            setLoading(false);
        }
    };

    if (sessionChecking) {
        return (
            <div className="min-h-screen bg-brand-light flex flex-col font-sans">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-10">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 border-4 border-brand-primary/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey animate-pulse">Verifying Security Session...</span>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-light flex flex-col font-sans selection:bg-brand-black selection:text-white">
            <Header />
            <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden bg-[#FEF7EB]">
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

                <div className="w-full max-w-[480px] space-y-12 relative z-10 animate-fade-in">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-brand-black rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl transform rotate-12 hover:rotate-0 transition-all duration-700 group">
                            <Lock className="w-10 h-10 text-brand-secondary" />
                        </div>
                        <h1 className="text-5xl font-serif font-black italic text-brand-black mb-4 tracking-tighter">Secure <span className="text-brand-secondary">Recall</span></h1>
                        <p className="text-brand-grey font-black uppercase tracking-[0.3em] text-[10px]">Configure your new literary access credentials</p>
                    </div>

                    <div className="bg-white/70 backdrop-blur-2xl border border-brand-primary/10 rounded-[3.5rem] p-10 md:p-14 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.1)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-bl-[4rem] group-hover:scale-150 transition-transform duration-1000" />

                        <form onSubmit={handleUpdatePassword} className="space-y-8 relative z-10">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 pl-2">New Access Key</Label>
                                <div className="relative group/field">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey/30 group-focus-within/field:text-brand-black transition-colors" />
                                    <Input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="MIN. 6 CHARACTERS"
                                        className="pl-16 h-16 bg-white/50 border-brand-primary/10 rounded-2xl font-bold focus:bg-white focus:border-brand-primary/40 transition-all shadow-sm placeholder:text-brand-grey/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-grey/50 pl-2">Confirm Authorization</Label>
                                <div className="relative group/field">
                                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-grey/30 group-focus-within/field:text-brand-black transition-colors" />
                                    <Input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="REPEAT ACCESS KEY"
                                        className="pl-16 h-16 bg-white/50 border-brand-primary/10 rounded-2xl font-bold focus:bg-white focus:border-brand-primary/40 transition-all shadow-sm placeholder:text-brand-grey/20"
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[10px] bg-brand-black text-white shadow-2xl hover:bg-brand-secondary hover:text-brand-black transition-all hover:-translate-y-1 active:translate-y-0"
                                disabled={loading}
                            >
                                {loading ? "Synchronizing..." : "Update Credentials"}
                            </Button>
                        </form>
                    </div>

                    <div className="flex items-center justify-center gap-4 text-brand-black/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.5em]">Quantum Encrypted Session</span>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default UpdatePassword;
