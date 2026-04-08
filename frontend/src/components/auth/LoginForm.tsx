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

        // Trim whitespaces
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            setLocalError("Please enter a valid email address.");
            return;
        }

        // Password length check
        if (trimmedPassword.length < 6) {
            setLocalError("Password must be at least 6 characters long.");
            return;
        }

        // Clear previous error and call parent onSubmit
        setLocalError(null);
        onSubmit(e);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <h2 className="mb-6 text-2xl font-bold text-gray-800">{title}</h2>

            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === ' ') e.preventDefault(); // Prevent space
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="email@example.com"
            />

            <PasswordInput
                value={password}
                onChange={(val) => setPassword(val.replace(/\s/g, ''))} // remove ALL spaces while typing
                color={color}
            />

            {/* Show validation or server error */}
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