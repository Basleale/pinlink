import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Support from '../pages/shared/Support';
import PatientOnboarding from '../pages/auth/PatientOnboarding';
import ProtectedRoute from '../routes/ProtectedRoute';
import RoleRoute from "../routes/RoleRoute";
import PatientDashboard from '../pages/patient/PatientDashboard';
import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import PatientLayout from '../layout/PatientLayout';
import Profile from '../pages/patient/Profile';
import Appointments from '../pages/patient/Appointments';

function AppRoutes() {
  return (
    <Routes>
      {/** public routes */}
      <Route path="/" element={<Navigate to="/login" replace />} /> {/** fallback route */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/support" element={<Support />} />

      {/**Protected routes */}
      <Route element={<ProtectedRoute />}> 
        <Route path="/onboarding" element={ <PatientOnboarding />} />
      </Route>


      {/**Patient routes */}
      <Route element={<RoleRoute allowedRoles={["Patient"]} />}>
        <Route element={<PatientLayout />}>
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<Appointments />} />
          <Route path="/patient/profile" element={<Profile />} />
        </Route>
      </Route>


      {/** Doctor routes */}
      <Route element={<RoleRoute allowedRoles={["Doctor"]} />}>
        <Route path="/doctor" element={<DoctorDashboard />} />
      </Route>


      {/**Admin routes */}
      <Route element={<RoleRoute allowedRoles={["Admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}


export default AppRoutes;
