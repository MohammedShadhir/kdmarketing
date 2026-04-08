import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = {
    value: string;
    onChange: (val: string) => void;
    color?: "emerald" | "blue" | "purple";
};

export function PasswordInput({ value, onChange, color = "emerald" }: Props) {
    const [show, setShow] = useState(false);

    const focusColor = {
        emerald: "focus:ring-emerald-500 focus:border-emerald-500",
        blue: "focus:ring-blue-500 focus:border-blue-500",
        purple: "focus:ring-purple-500 focus:border-purple-500",
    };

    return (
        <div className="relative">
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg ${focusColor[color]}`}
                placeholder="••••••••"
                required
            />
            <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2"
            >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    );
}