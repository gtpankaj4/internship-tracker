import React from 'react';
import { Link } from 'react-router-dom';

// Home page: public landing page for Internship Tracker
function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-blue-700 leading-tight">
          Internship Tracker
        </h1>
        <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
          Track all your internship applications in one place. Add, edit, and manage your applications easily. Stay organized and never miss a deadline!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login">
            <button className="btn-primary w-full sm:w-auto">Login</button>
          </Link>
          <Link to="/signup">
            <button className="btn-secondary w-full sm:w-auto">Sign Up</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home; 