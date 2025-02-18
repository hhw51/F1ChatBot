import Chat from "@/components/Chat";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">🏎️ F1 Racing Chatbot</h1>
            
            {/* ✅ Chatbot UI */}
            <div className="mb-8 w-full max-w-3xl">
                <Chat />
            </div>

            <footer className="mt-8 text-gray-400 text-sm">
                Powered by Claude & Web Scraping 🚀🏎️
            </footer>
        </div>
    );
}
