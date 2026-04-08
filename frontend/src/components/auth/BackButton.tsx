type Props = {
    onClick: () => void;
};

export function BackButton({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-800"
        >
            ← Back
        </button>
    );
}