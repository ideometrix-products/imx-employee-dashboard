import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layouts/Layouts';
import Dashboard from './Pages/Dashboard/Dashboard';
import Leaves from './Pages/Leaves/Leaves';
import Attendance from './Pages/Attendance/Attendance';
import Notice from './Pages/Notice/Notice';
import SignIn from './Pages/Signin/Signin';
import Finance from './Pages/Finance/Finance';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoutes/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path='/' element={<SignIn />} />
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='attendance' element={<Attendance />} />
          <Route path='leaves' element={<Leaves />} />
          <Route path='notice' element={<Notice />} />
          <Route path='finance' element={<Finance />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
