import React from "react";
import Card from "../components/Card";
import {
  Github,
  Mail,
  Globe,
  Instagram,
  Twitter,
  Linkedin,
  User,
  Code,
  Target,
  Shield,
} from "lucide-react";

const Info: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
        About & Developer Info
      </h1>

      {/* Developer Information */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src="https://github.com/codebysnorlax.png"
              alt="Ravi Ranjan Sharma"
              className="w-8 h-8 sm:w-6 sm:h-6 rounded-full"
            />
            <h2 className="text-lg sm:text-xl font-semibold text-white">Developer</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Ravi Ranjan Sharma
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                Tech enthusiast who loves building innovative projects and
                crafting problem-solving software with the latest technologies.
                Passionate about creating user-friendly applications that make a
                difference in people's lives.
              </p>

              <div className="space-y-2">
                <h4 className="text-white font-medium text-sm sm:text-base">Specializations:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Full-stack Web Development</li>
                  <li>• React & TypeScript Applications</li>
                  <li>• AI Integration & Modern UI/UX</li>
                  <li>• Problem-solving Software Solutions</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 lg:mt-0">
              <h4 className="text-white font-medium mb-3 text-sm sm:text-base">Connect</h4>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                <a
                  href="https://github.com/codebysnorlax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">GitHub</span>
                </a>
                <a
                  href="mailto:codebysnorlax@gmail.com"
                  className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                >
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Email</span>
                </a>
                <a
                  href="https://github.com/codebysnorlax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                >
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Portfolio</span>
                </a>
                <a
                  href="https://instagram.com/nr_snorlax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Instagram</span>
                </a>
                <a
                  href="https://twitter.com/codebysnorlax"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">Twitter</span>
                </a>
                <a
                  href="https://linkedin.com/in/ravi-ranjan-9b338b333"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-300 hover:text-brand-orange transition-colors"
                >
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Software Information */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Code className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              AI Fitness Tracker
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">Purpose</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                A modern, AI-powered fitness tracker designed to monitor your
                running progress, set personalized goals, and provide
                intelligent insights into your performance. Built with React and
                TypeScript for a seamless user experience.
              </p>
            </div>

            <div className="mt-4 md:mt-0">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Key Features
              </h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Track running sessions with detailed metrics</li>
                <li>• Set and monitor fitness goals</li>
                <li>• View analytics and performance trends</li>
                <li>• AI-powered insights and recommendations</li>
                <li>• Data backup and restore functionality</li>
                <li>• Local storage for privacy</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* How to Use */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">How to Use</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Getting Started
              </h3>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Login with any username and the provided password</li>
                <li>Set up your profile in Settings (age, height, weight)</li>
                <li>
                  Define your fitness goals (weekly distance, running days)
                </li>
                <li>Start adding your running sessions</li>
              </ol>
            </div>

            <div className="mt-4 md:mt-0">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2">
                Daily Usage
              </h3>
              <ol className="text-gray-300 text-sm space-y-2 list-decimal list-inside">
                <li>Add runs via "Add Run" with distance, time, and notes</li>
                <li>View your progress on the Dashboard</li>
                <li>Check Analytics for performance trends</li>
                <li>Get AI insights for improvement suggestions</li>
                <li>Backup your data regularly in Settings</li>
              </ol>
            </div>
          </div>
        </div>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
            <h2 className="text-lg sm:text-xl font-semibold text-white">
              Privacy & Security
            </h2>
          </div>

          <div className="text-gray-300 text-sm space-y-2">
            <p>
              • All your data is stored locally in your browser - no external
              servers
            </p>
            <p>• Your personal information never leaves your device</p>
            <p>• Use the backup feature to save your data as JSON files</p>
            <p>• Password protection ensures only authorized access</p>
            <p>• Open source approach for transparency and trust</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Info;
