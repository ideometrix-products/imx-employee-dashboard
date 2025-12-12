import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const baseClass = "flex items-center gap-3 w-full text-sm font-medium rounded-lg py-2.5 px-4 transition-colors";

  return (
    <aside className="w-64 h-full bg-[#f8fafc] p-6 border-r border-[#e2e8f0] relative">
      <nav className="space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? 'bg-[#d4d6dc] text-white shadow-sm' : ' hover:text-[#334557]'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg
                className={`w-5 h-5 ${isActive ? 'stroke-[#334557]' : 'text-[#222a36]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                ></path>
              </svg>
              <span className={isActive ? 'text-[#334557]' : 'text-[#222a36]'}>Dashboard</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/attendance"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? 'bg-[#d4d6dc] text-white shadow-sm' : ' hover:text-[#334557]'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg
                className={`w-5 h-5 ${isActive ? 'stroke-[#334557]' : 'text-[#222a36]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                ></path>
              </svg>
              <span className={isActive ? 'text-[#334557]' : 'text-[#222a36]'}>Attendance</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/leaves"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? 'bg-[#d4d6dc] text-white shadow-sm' : ' hover:text-[#334557]'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg
                className={`w-5 h-5 ${isActive ? 'stroke-[#334557]' : 'text-[#222a36]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
              <span className={isActive ? 'text-[#334557]' : 'text-[#222a36]'}>Leaves</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/notice"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? 'bg-[#d4d6dc] text-white shadow-sm' : ' hover:text-[#334557]'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg
                className={`w-5 h-5 ${isActive ? 'stroke-[#334557]' : 'text-[#222a36]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                ></path>
              </svg>
              <span className={isActive ? 'text-[#334557]' : 'text-[#222a36]'}>Notices</span>
            </>
          )}
        </NavLink>

        <NavLink
          to="/finance"
          className={({ isActive }) =>
            `${baseClass} ${isActive ? 'bg-[#d4d6dc] text-white shadow-sm' : 'hover:text-[#334557]'}`
          }
        >
          {({ isActive }) => (
            <>
              <svg
                className={`w-5 h-5 ${isActive ? 'stroke-[#334557]' : 'text-[#222a36]'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span className={isActive ? 'text-[#334557]' : 'text-[#222a36]'}>Finance</span>
            </>
          )}
        </NavLink>
      </nav>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="border-t border-[#e2e8f0] pt-4">
          <div className="flex items-center gap-3 text-[#64748b] hover:text-[#334557] hover:bg-[#e2e8f0] rounded-lg py-2.5 px-4 cursor-pointer transition-colors">
            <svg
              className="w-5 h-5 stroke-[#64748b]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-[#64748b]">Settings</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;