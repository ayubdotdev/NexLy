"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Sparkles, Brain, Activity, BotIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Hide button on certain pages
  const isHidden = pathname === "/chat" || pathname === "/depression";

  useEffect(() => {
    if (isHidden) setIsOpen(false);
  }, [isHidden]);

  const handleNavigation = (path: string) => {
    window.location.href = path;
    setIsOpen(false);
  };

  if (isHidden) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-b from-cyan-400 via-blue-500 to-indigo-500 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center group hover:scale-110 "
        aria-label="Open mental health support"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
        )}
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="text-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
            <div className=" bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-blue-500 p-6 text-white">
                <div className="flex flex-col items-center text-center gap-3">
                  <div>
                    <h3 className="font-semibold text-xl">NexlyAI</h3>
                    <p className="text-xs text-white/80">Mental Wellness Platform</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>


              {/* Content */}
              <div className="p-6 text-center">
                <h4 className="font-semibold text-xl mb-3 text-gray-900 dark:text-gray-100">
                  How can we support you today? 💙
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                  Choose the service that best fits your needs
                </p>

                {/* Options */}
                <div className="space-y-4">
                  {/* Reusable card style */}
                  {[
                    {
                      title: "AI Assistant",
                      desc: "Chat with our empathetic AI for emotional support and guidance",
                      icon: <BotIcon className="w-6 h-6 text-white" />,
                      path: "/chat",
                    },
                    {
                      title: "Depression Tracker",
                      desc: "Take a quick assessment to understand your mental wellness",
                      icon: <Activity className="w-6 h-6 text-white" />,
                      path: "/depression",
                    },
                  ].map((option, i) => (
                    <button
                      key={i}
                      onClick={() => handleNavigation(option.path)}
                      className="w-full bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 text-white rounded-xl p-5 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] text-left group relative overflow-hidden"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          {option.icon}
                        </div>
                        <div>
                          <h5 className="font-semibold text-lg mb-1">{option.title}</h5>
                          <p className="text-sm text-white/90">{option.desc}</p>
                        </div>
                      </div>
                      {/* Glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
