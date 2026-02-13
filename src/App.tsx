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
import { CarePlans } from './pages/CarePlans';
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

// Provider App imports
import { ProviderProvider } from './provider/context/ProviderContext';
import { ProviderLayout } from './provider/components/ProviderLayout';
import { ProviderDashboard } from './provider/pages/ProviderDashboard';
import { QueueManagement } from './provider/pages/QueueManagement';
import { SchedulingOps } from './provider/pages/SchedulingOps';
import { BillingRevenue } from './provider/pages/BillingRevenue';
import { LabImaging } from './provider/pages/LabImaging';
import { PharmacyOps } from './provider/pages/PharmacyOps';
import { NursingStation } from './provider/pages/NursingStation';
import { UserManagement } from './provider/pages/UserManagement';
import { HRStaff } from './provider/pages/HRStaff';
import { FacilityManagement } from './provider/pages/FacilityManagement';
import { Communications } from './provider/pages/Communications';
import { EventsManagement } from './provider/pages/EventsManagement';
import { Analytics } from './provider/pages/Analytics';
import { FormsManagement } from './provider/pages/FormsManagement';
import { Integrations } from './provider/pages/Integrations';
import { Architecture } from './provider/pages/Architecture';
import { TeleconsultQueue } from './provider/pages/TeleconsultQueue';
import { ProviderNotifications } from './provider/pages/ProviderNotifications';
import { ProviderProfile } from './provider/pages/ProviderProfile';
import { ProviderSettings } from './provider/pages/ProviderSettings';

// Doctor App imports
import { DoctorLayout } from './doctor/components/DoctorLayout';
import { DoctorDashboard } from './doctor/pages/DoctorDashboard';
import { DoctorQueue } from './doctor/pages/DoctorQueue';
import { PatientEncounter } from './doctor/pages/PatientEncounter';
import { DoctorTeleconsult } from './doctor/pages/DoctorTeleconsult';
import { DoctorResults } from './doctor/pages/DoctorResults';
import { DoctorSchedule } from './doctor/pages/DoctorSchedule';
import { DoctorPrescriptions } from './doctor/pages/DoctorPrescriptions';
import { DoctorTasks } from './doctor/pages/DoctorTasks';
import { DoctorMessages } from './doctor/pages/DoctorMessages';
import { ImmunizationManagement } from './doctor/pages/ImmunizationManagement';
import { LOAReview } from './doctor/pages/LOAReview';

// App Selector
import { AppSelector } from './pages/AppSelector';

function App() {
    // Use HashRouter for single-file build (file:// protocol check)
    // @ts-ignore - Defined in vite.config.ts
    const isSingleFile = process.env.IS_SINGLE_FILE === true;
    const Router = isSingleFile ? HashRouter : BrowserRouter;

    return (
        <ThemeProvider>
            <ToastProvider>
                <DataProvider>
                    <ProviderProvider>
                        <Router>
                            <ScrollToTop />
                            <ErrorBoundary>
                                <Routes>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/apps" element={<AppSelector />} />

                                    {/* Patient Portal Routes */}
                                    <Route path="/" element={<Navigate to="/apps" replace />} />

                                    <Route element={<Layout />}>
                                        <Route path="/dashboard" element={<Dashboard />} />
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
                                        <Route path="/health/care-plans" element={<CarePlans />} />
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

                                    {/* Provider App Routes */}
                                    <Route element={<ProviderLayout />}>
                                        <Route path="/provider" element={<ProviderDashboard />} />
                                        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
                                        <Route path="/provider/queue" element={<QueueManagement />} />
                                        <Route path="/provider/teleconsult-queue" element={<TeleconsultQueue />} />
                                        <Route path="/provider/scheduling" element={<SchedulingOps />} />
                                        <Route path="/provider/nursing" element={<NursingStation />} />
                                        <Route path="/provider/billing" element={<BillingRevenue />} />
                                        <Route path="/provider/lab-imaging" element={<LabImaging />} />
                                        <Route path="/provider/pharmacy" element={<PharmacyOps />} />
                                        <Route path="/provider/facility" element={<FacilityManagement />} />
                                        <Route path="/provider/communications" element={<Communications />} />
                                        <Route path="/provider/events" element={<EventsManagement />} />
                                        <Route path="/provider/users" element={<UserManagement />} />
                                        <Route path="/provider/hr" element={<HRStaff />} />
                                        <Route path="/provider/analytics" element={<Analytics />} />
                                        <Route path="/provider/integrations" element={<Integrations />} />
                                        <Route path="/provider/architecture" element={<Architecture />} />
                    <Route path="/provider/forms" element={<FormsManagement />} />
                    <Route path="/provider/notifications" element={<ProviderNotifications />} />
                    <Route path="/provider/profile" element={<ProviderProfile />} />
                    <Route path="/provider/settings" element={<ProviderSettings />} />
                  </Route>

                                    {/* Doctor App Routes */}
                                    <Route element={<DoctorLayout />}>
                                        <Route path="/doctor" element={<DoctorDashboard />} />
                                        <Route path="/doctor/queue" element={<DoctorQueue />} />
                                        <Route path="/doctor/encounter" element={<PatientEncounter />} />
                                        <Route path="/doctor/teleconsult" element={<DoctorTeleconsult />} />
                                        <Route path="/doctor/results" element={<DoctorResults />} />
                                        <Route path="/doctor/schedule" element={<DoctorSchedule />} />
                                        <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
                                        <Route path="/doctor/tasks" element={<DoctorTasks />} />
                                        <Route path="/doctor/messages" element={<DoctorMessages />} />
                                        <Route path="/doctor/immunizations" element={<ImmunizationManagement />} />
                                        <Route path="/doctor/loa" element={<LOAReview />} />
                                    </Route>

                                    <Route path="*" element={<Navigate to="/apps" replace />} />
                                </Routes>
                            </ErrorBoundary>
                            <DemoControls />
                        </Router>
                    </ProviderProvider>
                </DataProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
