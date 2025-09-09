
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="py-6 bg-secondary/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          AI Photo Editor
        </h1>
        <p className="mt-2 text-lg text-text-secondary">
          Bring your creative visions to life with the magic of Nana Banana AI.
        </p>
      </div>
    </header>
  );
};

export default Header;
