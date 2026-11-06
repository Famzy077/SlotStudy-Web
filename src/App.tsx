import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { AppShell, ThemeController } from './components/layout';
import LandingPage from './pages/landing/LandingPage';
import {
  LoginPage,
  RegisterPage,
  TermsPage,
  VerifyOtpPage,
  ForgotPasswordPage,
  AcademicSetupPage,
} from './pages/auth';
import {
  DashboardPage,
  CoursesPage,
  CourseDetailPage,
  UploadMaterialPage,
  MaterialsPage,
  SummaryDetailPage,
  StudyRoomPage,
  StudyBuddyPage,
  QuizzesPage,
  QuizRunnerPage,
  QuizResultPage,
  ProgressPage,
  NotificationsPage,
  ProfilePage,
  SettingsPage,
  SubscriptionPage,
  HelpPage,
} from './pages/dashboard';

function ProtectedRoute() {
  const token = useAuth((state) => state.accessToken);
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <>
      <ThemeController />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ForgotPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding/academic-setup" element={<AcademicSetupPage />} />
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/materials/upload" element={<UploadMaterialPage />} />
            <Route path="/ai" element={<MaterialsPage />} />
            <Route path="/summaries/:id" element={<SummaryDetailPage />} />
            <Route path="/study-room" element={<StudyRoomPage />} />
            <Route path="/study-room/:id" element={<StudyRoomPage />} />
            <Route path="/study-buddy" element={<StudyBuddyPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/quizzes/:id" element={<QuizRunnerPage />} />
            <Route path="/quizzes/:id/result" element={<QuizResultPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;
