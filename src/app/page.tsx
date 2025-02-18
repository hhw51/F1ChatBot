import Chat from "@/components/Chat";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-4xl font-bold text-white">
                🏁 F1 Racing Chatbot
            </h1>
            <p className="text-gray-400 text-lg">Ask me anything about Formula 1!</p>
            <Chat />
        </div>
    );
}
