import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-100 p-4">
        <h1 className="text-xl font-bold">FitLife</h1>
      </header>
      <main className="p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;