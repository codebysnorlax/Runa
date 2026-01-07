import React, { useState, useEffect, useRef } from "react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Volume2 } from "lucide-react";
import AudioLoader from "../components/AudioLoader";
const images = [
  "/Runa/images/1_image.png",
  "/Runa/images/2_image.png",
  "/Runa/images/3_image.png",
  "/Runa/images/4_image.png",
  "/Runa/images/5_image.png",
  "/Runa/images/6_image.png",
  "/Runa/images/7_image.png",
  "/Runa/images/8_image.png",
];

const Login: React.FC = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAudioPlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/Runa/audio/RunaIntro.wav');
      audioRef.current.addEventListener('ended', () => {
        setShowAudioModal(false);
        setAudioProgress(0);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
          setAudioProgress(Math.round(progress));
        }
      });
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setShowAudioModal(false);
        setAudioProgress(0);
      });
    }
    setShowAudioModal(true);
    setAudioProgress(0);
    audioRef.current.play().catch(err => {
      console.error('Play error:', err);
      setShowAudioModal(false);
    });
  };

  const handleCloseModal = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setShowAudioModal(false);
    setAudioProgress(0);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-white">
            <span className="text-brand-orange">Runa</span>
          </h1>
          <button
            onClick={handleAudioPlay}
            className="flex items-center gap-2 bg-brand-orange/10 hover:bg-brand-orange/20 border border-brand-orange/30 text-brand-orange px-4 py-2 rounded-lg transition-all hover:scale-105"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-sm font-medium">Intro</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:flex lg:items-center">
        <div className="w-full py-8 md:py-12 lg:py-12">
          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden flex flex-col gap-8 md:gap-10 max-w-5xl mx-auto">
            <div className="text-center">
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
                AI-Powered Fitness Tracker
              </h2>
              <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                For those who truly want to track their runs, analyze
                performance, and get intelligent insights.
              </p>
            </div>

            <div className="w-full">
              <div className="relative overflow-hidden rounded-xl shadow-2xl">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`App screenshot ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    width="400"
                    height="300"
                    className={`rounded-xl border-2 border-gray-700 w-full ${
                      index === currentImage ? "relative" : "absolute inset-0"
                    }`}
                    style={{
                      opacity: index === currentImage ? 1 : 0,
                      transform:
                        index === currentImage ? "scale(1)" : "scale(0.95)",
                      transition:
                        "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-center items-center gap-3 mt-6">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full transition-all duration-500 ${
                      index === currentImage
                        ? "bg-brand-orange shadow-lg shadow-brand-orange/50 scale-125"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                    style={{
                      transition:
                        "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="max-w-xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row gap-4">
                <SignInButton mode="modal">
                  <button className="w-full bg-brand-orange hover:bg-orange-600 text-white font-semibold px-10 py-4 rounded-xl transition-all hover:scale-105 text-lg">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full bg-gray-800 hover:bg-gray-700 border-2 border-gray-700 text-white font-semibold px-10 py-4 rounded-xl transition-all hover:scale-105 text-lg">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
            <div className="flex flex-col justify-center">
              <h2 className="text-5xl xl:text-6xl font-bold text-white mb-4">
                AI-Powered Fitness Tracker
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                For those who truly want to track their runs, analyze
                performance, and get intelligent insights.
              </p>
              <div className="max-w-lg flex gap-3">
                <SignInButton mode="modal">
                  <button className="flex-1 bg-brand-orange hover:bg-orange-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </div>
            </div>

            <div>
              <div className="relative overflow-hidden rounded-lg">
                {images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`App screenshot ${index + 1}`}
                    loading={index === 0 ? "eager" : "lazy"}
                    width="600"
                    height="400"
                    className={`rounded-lg border border-gray-800 shadow-2xl w-full ${
                      index === currentImage ? "relative" : "absolute inset-0"
                    }`}
                    style={{
                      opacity: index === currentImage ? 1 : 0,
                      transform:
                        index === currentImage ? "scale(1)" : "scale(0.95)",
                      transition:
                        "opacity 0.8s ease-in-out, transform 0.8s ease-in-out",
                    }}
                  />
                ))}
              </div>
              <div className="flex justify-center items-center gap-2 mt-6">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                      index === currentImage
                        ? "bg-brand-orange shadow-lg shadow-brand-orange/50"
                        : "bg-gray-600 hover:bg-gray-500"
                    }`}
                    style={{
                      transition:
                        "all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAudioModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={handleCloseModal}>
          <div className="bg-gray-800/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50" onClick={(e) => e.stopPropagation()}>
            <AudioLoader progress={audioProgress} />
            <p className="text-center text-gray-300 mt-4 text-sm">Playing Runa Intro...</p>
          </div>
        </div>
      )}

      <footer className="border-t border-gray-800 py-4 sm:py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://github.com/codebysnorlax.png"
                alt="Developer"
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-white font-semibold text-sm">
                  Ravi Ranjan Sharma
                </p>
                <p className="text-gray-400 text-xs">Tech enthusiast</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <a
                href="https://github.com/codebysnorlax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-orange transition-colors"
                title="GitHub"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="mailto:rr2436310@gmail.com"
                className="text-gray-400 hover:text-brand-orange transition-colors"
                title="Email"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </a>
              <a
                href="https://instagram.com/nr_snorlax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-orange transition-colors"
                title="Instagram"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://twitter.com/codebysnorlax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-orange transition-colors"
                title="Twitter"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/codebysnorlax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-brand-orange transition-colors"
                title="LinkedIn"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
