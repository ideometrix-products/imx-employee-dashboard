import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';

const Layout = () => {
  return (
    <div className="h-screen flex flex-col bg-[#f9f9f9]">
      {/* Navbar on top */}
      <Navbar />

      {/* Sidebar + Main content below */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
