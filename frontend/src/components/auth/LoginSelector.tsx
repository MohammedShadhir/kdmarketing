type Props = {
    setMode: (mode: "admin" | "sales" | "subcontractor") => void;
};

export function LoginSelector({ setMode }: Props) {
    return (
        <div className="space-y-4">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                Choose Login Type
            </h2>

            <button
                onClick={() => setMode("admin")}
                className="w-full py-4 text-white bg-purple-600 rounded-xl"
            >
                Admin Login
            </button>

            <button
                onClick={() => setMode("sales")}
                className="w-full py-4 text-white bg-emerald-600 rounded-xl"
            >
                Sales Login
            </button>

            <button
                onClick={() => setMode("subcontractor")}
                className="w-full py-4 text-white bg-blue-600 rounded-xl"
            >
                Sub-Contractor Login
            </button>
        </div>
    );
}