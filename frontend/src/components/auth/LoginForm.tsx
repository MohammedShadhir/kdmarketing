import { PasswordInput } from "./PasswordInput";
import { useState } from "react";

type Props = {
    title: string;
    email: string;
    password: string;
    setEmail: (val: string) => void;
    setPassword: (val: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error?: string | null;
    color: "emerald" | "blue" | "purple";
};

export function LoginForm({
    title,
    email,
    password,
    setEmail,
    setPassword,
    onSubmit,
    loading,
    error,
    color,
}: Props) {
    const [localError, setLocalError] = useState<string | null>(null);

    const btnColor = {
        emerald: "bg-emerald-600 hover:bg-emerald-700",
        blue: "bg-blue-600 hover:bg-blue-700",
        purple: "bg-purple-600 hover:bg-purple-700",
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setLocalError("Please enter a valid email address.");
            return;
        }

        if (trimmedPassword.length < 6) {
            setLocalError("Password must be at least 6 characters long.");
            return;
        }

        setLocalError(null);
        onSubmit(e);
    };

    const handleEmailChange = (val: string) => {
        setEmail(val.replace(/\s/g, "")); // remove spaces
    };

    const handlePasswordChange = (val: string) => {
        setPassword(val.replace(/\s/g, "")); // remove spaces
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <h2 className="mb-6 text-2xl font-bold text-gray-800">{title}</h2>

            <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onPaste={(e) => {
                    e.preventDefault();
                    handleEmailChange(e.clipboardData.getData("text").replace(/\s/g, ""));
                }}
                onKeyDown={(e) => {
                    if (e.key === " ") e.preventDefault(); // prevent spacebar
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="email@example.com"
                required
            />

            <PasswordInput
                value={password}
                onChange={handlePasswordChange}
                color={color}
            />

            {(localError || error) && (
                <div className="px-4 py-3 text-sm text-red-700 rounded-lg bg-red-50">
                    {localError || error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className={`w-full px-6 py-3 text-white rounded-lg ${btnColor[color]} disabled:opacity-50`}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>
    );
}