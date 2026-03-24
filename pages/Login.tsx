import React, { useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Volume2, HelpCircle, ArrowLeft } from "lucide-react";
import { AudioOrbIntro } from "@/components/AudioOrbIntro";
import FAQ from "@/components/FAQ";
import Footer from "@/components/login/Footer";
import ImageCarousel from "@/components/login/ImageCarousel";

const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Julee&family=Rock+Salt&display=swap');
  .custom-heading { font-family: 'Caveat', cursive; font-weight: 700; }
`;

const Login = () => {
  const [showAudioModal, setShowAudioModal] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  return (
    <>
      <style>{fontStyle}</style>
      <div className="min-h-screen bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-semibold julee-regular gradient-text">
              Runa
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFAQ((v) => !v)}
                className="flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700/50 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all hover:scale-105"
              >
                {showFAQ ? (
                  <><ArrowLeft className="w-4 h-4" /><span className="text-sm font-medium">Back</span></>
                ) : (
                  <><HelpCircle className="w-4 h-4" /><span className="text-sm font-medium">FAQ</span></>
                )}
              </button>
              <button
                onClick={() => setShowAudioModal(true)}
                className="flex items-center gap-2 bg-brand-orange/10 hover:bg-brand-orange/20 border border-brand-orange/30 text-brand-orange px-4 py-2 rounded-lg transition-all hover:scale-105"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-sm font-medium">Intro</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content using Grid */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12 lg:py-12 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
          
          {/* Text & Buttons Section */}
          <div className="flex-1 flex flex-col justify-center text-center lg:text-left">
            <h2 className="custom-heading text-4xl md:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              AI-Powered Fitness Tracker
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto lg:mx-0 leading-relaxed mb-6 lg:mb-8">
              For those who truly want to track their runs, analyze performance, and get intelligent insights.
            </p>
            
            <div className="flex flex-row gap-3 w-full lg:max-w-md mx-auto lg:mx-0">
              <SignInButton mode="modal">
                <button className="flex-1 bg-brand-orange hover:bg-orange-600 text-white font-semibold lg:font-medium px-5 lg:px-8 py-2.5 lg:py-3 rounded-lg transition-all hover:scale-105 lg:hover:scale-100 text-sm lg:text-base">
                  Get Started
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-semibold lg:font-medium px-5 lg:px-8 py-2.5 lg:py-3 rounded-lg transition-all hover:scale-105 lg:hover:scale-100 text-sm lg:text-base">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </div>

          {/* Media / FAQ Section */}
          <div className="flex-1 w-full max-w-5xl mx-auto lg:mx-0">
            {showFAQ ? (
              <div className="w-full overflow-y-auto max-h-[55vh] lg:max-h-[60vh] pr-1 lg:pr-2 rounded-xl lg:rounded-lg">
                <FAQ />
              </div>
            ) : (
              <div className="w-full">
                <ImageCarousel />
              </div>
            )}
          </div>

        </main>

        {showAudioModal && (
          <AudioOrbIntro
            audioSrc={`${import.meta.env.BASE_URL}audio/RunaIntro.wav`}
            onComplete={() => setShowAudioModal(false)}
            onCancel={() => setShowAudioModal(false)}
          />
        )}

        <Footer />
      </div>
    </>
  );
};

export default Login;
