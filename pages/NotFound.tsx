import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
    <h1 className="text-8xl font-bold text-brand-orange mb-4">404</h1>
    <p className="text-xl text-gray-400 mb-6">Page not found</p>
    <Link to="/" className="px-6 py-3 bg-brand-orange hover:bg-orange-600 rounded-lg text-white font-medium">
      Go Home
    </Link>
  </div>
);

export default NotFound;
