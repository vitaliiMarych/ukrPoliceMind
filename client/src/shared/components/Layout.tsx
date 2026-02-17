import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      {/* Full height minus navbar height (80px) with top padding */}
      <main className="pt-20 h-screen overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
