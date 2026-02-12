import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Benefits } from './pages/Benefits';
import { Forms } from './pages/Forms';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Results } from './pages/Results';
import { Medications } from './pages/Medications';
import { Queue } from './pages/Queue';
import { Billing } from './pages/Billing';
import { Immunization } from './pages/Immunization';
import { Events } from './pages/Events';
import { EventDetail } from './pages/EventDetail';
import { AppointmentBooking } from './pages/AppointmentBooking';
import { AppointmentHistory } from './pages/AppointmentHistory';
import { MedicalHistory } from './pages/MedicalHistory';
import { Community } from './pages/Community';
import { Notifications } from './pages/Notifications';
import { ResultDetail } from './pages/ResultDetail';
import { Visits } from './pages/Visits';
import { Health } from './pages/Health';
import { Financial } from './pages/Financial';
import { BookProcedure } from './pages/BookProcedure';
import { TeleconsultLanding } from './pages/TeleconsultLanding';
import { ConsultNow } from './pages/ConsultNow';
import { TeleconsultIntake } from './pages/intake/TeleconsultIntake';
import { Branches } from './pages/Branches';
import { Checkout } from './pages/Checkout';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { Dependents } from './pages/Dependents';
import { PhilHealthDetail } from './pages/PhilHealthDetail';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DemoControls } from './components/DemoControls';

import { ScrollToTop } from './components/ScrollToTop';

function App() {
  // Use HashRouter for single-file build (file:// protocol check)
  // @ts-ignore - Defined in vite.config.ts
  const isSingleFile = process.env.IS_SINGLE_FILE === true;
  const Router = isSingleFile ? HashRouter : BrowserRouter;

  return (
    <ThemeProvider>
      <ToastProvider>
        <DataProvider>
          <Router>
            <ScrollToTop />
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />

                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/appointments" element={<AppointmentHistory />} />
                  <Route path="/appointments/book" element={<AppointmentBooking />} />
                  <Route path="/medical-history" element={<MedicalHistory />} />
                  <Route path="/results" element={<Results />} />
                  <Route path="/results/:id" element={<ResultDetail />} />
                  <Route path="/medications" element={<Medications />} />
                  <Route path="/immunization" element={<Immunization />} />
                  <Route path="/coverage" element={<Financial />} />
                  <Route path="/benefits" element={<Benefits />} />
                  <Route path="/billing" element={<Billing />} />
                  <Route path="/checkout/:id" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/visits" element={<Visits />} />
                  <Route path="/visits/teleconsult" element={<TeleconsultLanding />} />
                  <Route path="/visits/consult-now" element={<ConsultNow />} />
                  <Route path="/visits/teleconsult-intake" element={<TeleconsultIntake />} />
                  <Route path="/visits/book-procedure" element={<BookProcedure />} />
                  <Route path="/visits/consult-later" element={<AppointmentBooking />} />
                  <Route path="/health" element={<Health />} />
                  <Route path="/community" element={<Community />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/dependents" element={<Dependents />} />
                  <Route path="/coverage/philhealth" element={<PhilHealthDetail />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/forms" element={<Forms />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/queue" element={<Queue />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
            <DemoControls />
          </Router>
        </DataProvider>
      </ToastProvider>
    </ThemeProvider >
  );
}

export default App;

