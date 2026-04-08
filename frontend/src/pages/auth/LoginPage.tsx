import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { LoginSelector } from "@/components/auth/LoginSelector";
import { LoginForm } from "@/components/auth/LoginForm";
import { BackButton } from "@/components/auth/BackButton";

type LoginMode = "choose" | "sales" | "subcontractor" | "admin";

export function LoginPage() {
    const navigate = useNavigate();
    const { user, loginSales, loginSubContractor, error, clearError } =
        useAuthStore();
    const [mode, setMode] = useState<LoginMode>("choose");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) navigate("/");
    }, [user]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === "sales") {
                await loginSales({ email, password });
                navigate("/sales/sub-contractors");
            } else if (mode === "subcontractor") {
                await loginSubContractor({ email, password });
                navigate("/sub-contractor/profile");
            } else if (mode === "admin") {
                await loginSales({ email, password });
                navigate("/admin");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setMode("choose");
        setEmail("");
        setPassword("");
        clearError();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-emerald-700">
            <div className="w-full max-w-md p-4">
                <AuthHeader />

                <div className="p-8 bg-white rounded-2xl">
                    {mode === "choose" ? (
                        <LoginSelector setMode={setMode} />
                    ) : (
                        <>
                            <BackButton onClick={handleBack} />

                            <LoginForm
                                title={`${mode} Login`}
                                email={email}
                                password={password}
                                setEmail={setEmail}
                                setPassword={setPassword}
                                onSubmit={handleLogin}
                                loading={loading}
                                error={error}
                                color={
                                    mode === "sales"
                                        ? "emerald"
                                        : mode === "subcontractor"
                                            ? "blue"
                                            : "purple"
                                }
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}