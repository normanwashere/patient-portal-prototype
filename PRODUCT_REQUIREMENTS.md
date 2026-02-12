# Patient Portal PWA - Product Requirements Document (PRD)

## 1. Executive Summary
The **Patient Portal PWA** is a unified, mobile-first digital front door for healthcare patients. It allows users to manage their healthcare journey across multiple tenant types (Hospitals, Clinics, Wellness) from a single application. The current implementation focuses on a seamless, app-like experience with features for appointment booking, queue management, medical records, and teleconsultation.

## 2. User Roles
*   **Patient (Authenticated):** Primary user. Can book appointments, view records, join queues, and manage profile.
*   **Guest (Unauthenticated):** Limited access. Can view landing pages, marketing banners, and facility info.

## 3. Core Features & Implementation Status

### 3.1 Authentication & Onboarding
*   **Login Flow:**
    *   Single sign-on capable design (mocked).
    *   "Sign Out" functionality clears session and redirects to login.
    *   **Status:** Implemented (`Login.tsx`, `Profile.tsx`).

### 3.2 Dashboard (The "Hub")
*   **Personalization:** Displays patient name and tailored greeting.
*   **Dynamic Marketing Banner:** Carousel of health campaigns/promos (`BannerCarousel.tsx`).
*   **Quick Actions:** 4-column grid for high-frequency tasks (Find Doctor, Teleconsult, Lab Results, Bills).
*   **Queue Status (Real-time):**
    *   **Single Check-In Button:** Context-aware (Check In vs Walk In).
    *   **Live Status:** Shows queue number (e.g., P-039) and destination (e.g., Room 105).
    *   **Simulation Mode:** Floating FAB to simulate patient journey stages (Waiting -> Triage -> Vitals -> Consult -> Complete).
    *   **Status:** Implemented (`Dashboard.tsx`, `CheckInCard.tsx`).

### 3.3 Queue Management
*   **Digital Check-In:**
    *   Priority queue for appointments.
    *   Walk-in queue for unplanned visits.
*   **Visual Journey Tracker:** Phase-specific status indicators (Waiting, Triage, Vitals, Consult).
*   **Status:** Implemented (`Queue.tsx`, `CheckInCard.tsx`).

### 3.4 Care & Teleconsultation
*   **Teleconsult Landing:**
    *   "Consult Now" (Queue-based, 24/7 GP).
    *   "Consult Later" (Scheduled, Specialists).
    *   Feature-flagged availability based on tenant config.
*   **Doctor Search:** Filtering by specialty and availability.
*   **Status:** Implemented (`TeleconsultLanding.tsx`, `ConsultNow.tsx`, `AppointmentBooking.tsx`).

### 3.5 Medical Records (Health Passport)
*   **Unified Records:** Centralized view of all health data.
*   **Lab Results:** List view with detailed result pages (`Results.tsx`, `ResultDetail.tsx`).
*   **Prescriptions:** Digital script simulacrum.
*   **Immunizations:** Vaccine history tracking.
*   **Status:** Implemented.

### 3.6 Financials
*   **Billing History:** View past invoices and payment status.
*   **HMO/Insurance:** Management of coverage details.
*   **Status:** Implemented (`Financial.tsx`, `Billing.tsx`).

### 3.7 Wellness & Community
*   **Events:** Health seminars and wellness activities (`Events.tsx`).
*   **Community:** Support groups and health forums (`Community.tsx`).
*   **Status:** Implemented.

### 3.8 Facility & Network
*   **Multi-Location Support:**
    *   "Branches" page for hospital networks showing capabilities of each site.
    *   Distance calculation (mocked) and "Get Directions".
*   **Tenant Configuration:**
    *   Theme engine supporting different brand colors/logos (Metro Hospital, Metro Super Clinic, HealthFirst).
    *   Feature flags (toggle Admission, Queue, Teleconsult features per tenant).
*   **Status:** Implemented (`Branches.tsx`, `tenantConfig.ts`).

## 4. Technical Architecture

### 4.1 Tech Stack
*   **Framework:** React 19 + TypeScript
*   **Build Tool:** Vite
*   **Styling:**
    *   CSS Variables for theming (Tenant colors).
    *   Mobile-first responsive CSS.
    *   Lucide React for iconography.
*   **Routing:** React Router DOM v7.
*   **State Management:** React Context (Auth, Theme, Data, Toast).

### 4.2 Key Considerations
*   **PWA-Ready:** Manifest and service worker ready structure.
*   **Performance:** Code-split route loading (via Vite).
*   **Responsiveness:** optimized for mobile viewports (375px-430px) but functional on desktop.

## 5. Future Roadmap (Out of Scope for current MVP)
*   Backend Integration (Replace mock data with API calls).
*   Push Notifications for queue updates.
*   Real-time WebSockets for queue position.
*   Biometric Login integration.
