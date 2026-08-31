import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/stores/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AdminRoute } from '@/routes/AdminRoute';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import SsoCallback from '@/pages/auth/SsoCallback';
import Landing from '@/pages/landing/Landing';
import Dashboard from '@/pages/dashboard/Dashboard';
import Practice from '@/pages/practice/Practice';
import PackageDetail from '@/pages/practice/PackageDetail';
import LatihanSoal from '@/pages/practice/LatihanSoal';
import LatihanKotoba from '@/pages/practice/LatihanKotoba';
import KotobaCategoryDetail from '@/pages/practice/KotobaCategoryDetail';
import KotobaQuiz from '@/pages/practice/KotobaQuiz';
import Reservasi from '@/pages/reservasi/Reservasi';
import AksesModul from '@/pages/modul/AksesModul';
import Quiz from '@/pages/quiz/Quiz';
import Result from '@/pages/result/Result';
import Review from '@/pages/result/Review';
import History from '@/pages/history/History';
import Progress from '@/pages/progress/Progress';
import Modules from '@/pages/modules/Modules';
import Subscription from '@/pages/subscription/Subscription';
import Payments from '@/pages/payments/Payments';
import Profile from '@/pages/profile/Profile';
import Payment from '@/pages/payment/Payment';
import PaymentModulePremium from '@/pages/payment/PaymentModulePremium';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPackages from '@/pages/admin/AdminPackages';
import AdminQuestions from '@/pages/admin/AdminQuestions';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminSubscribers from '@/pages/admin/AdminSubscribers';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminVouchers from '@/pages/admin/AdminVouchers';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminModules from '@/pages/admin/AdminModules';
import AdminKotobaCategories from '@/pages/admin/AdminKotobaCategories';
import AdminKotoba from '@/pages/admin/AdminKotoba';
import AdminKotobaTopics from '@/pages/admin/AdminKotobaTopics';
import UpgradeAkses from '@/pages/practice/UpgradeAkses';

function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Landing />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

function LoginRoute() {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <Login />;
}

function RegisterRoute() {
  const { user, isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <Register />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<RegisterRoute />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/sso" element={<SsoCallback />} />

      {/* Quiz uses its own full-screen layout — no sidebar/header. */}
      <Route
        path="/quiz/:attemptId"
        element={
          <ProtectedRoute>
            <Quiz />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/practice/:id" element={<PackageDetail />} />
        <Route path="/latihan-soal" element={<LatihanSoal />} />
        <Route path="/upgrade-akses" element={<UpgradeAkses />} />
        <Route path="/latihan-kotoba" element={<LatihanKotoba />} />
        <Route path="/latihan-kotoba/:categoryId" element={<KotobaCategoryDetail />} />
        <Route path="/latihan-kotoba/:categoryId/quiz" element={<KotobaQuiz />} />
        <Route path="/reservasi" element={<Reservasi />} />
        <Route path="/akses-modul" element={<AksesModul />} />
        <Route path="/results/:attemptId" element={<Result />} />
        <Route path="/results/:attemptId/review" element={<Review />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/modules" element={<Modules />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Payment page — standalone, no sidebar */}
      <Route
        path="/payment/:packageId"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment-module-premium"
        element={
          <ProtectedRoute>
            <PaymentModulePremium />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/modules" element={<AdminModules />} />
        <Route path="/admin/packages" element={<AdminPackages />} />
        <Route path="/admin/questions" element={<AdminQuestions />} />
        <Route path="/admin/kotoba-categories" element={<AdminKotobaCategories />} />
        <Route path="/admin/kotoba" element={<AdminKotoba />} />
        <Route path="/admin/kotoba-topics" element={<AdminKotobaTopics />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/subscribers" element={<AdminSubscribers />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/vouchers" element={<AdminVouchers />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
