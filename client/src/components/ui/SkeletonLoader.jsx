
export function Spinner() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full absolute top-0 animate-spin"></div>
            </div>
        </div>
    );
}