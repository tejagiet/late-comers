import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Scanner from './components/Scanner';
import Dashboard from './components/Dashboard';
import { QrCode, LayoutDashboard } from 'lucide-react';

const MainLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="glass border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <QrCode className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white block">GIET <span className="text-primary">GatePass</span></span>
              </div>
            </div>

            <div className="flex gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${location.pathname === '/'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <QrCode className="w-4 h-4" />
                Scanner
              </Link>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${location.pathname === '/dashboard'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative">
        {/* Ambient background decoration */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Scanner />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
