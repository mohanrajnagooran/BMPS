import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ClientsList from "@/pages/clients/ClientsList";
import ClientProfile from "@/pages/clients/ClientProfile";
import CompaniesList from "@/pages/companies/CompaniesList";
import CompanyProfile from "@/pages/companies/CompanyProfile";
import Tasks from "@/pages/Tasks";
import Contacts from "@/pages/Contacts";
import {
  JobDemandsPage, JobsPage, ApplicationsPage, CandidatesPage, InterviewPage,
  MedicalPage, WorkPassPage, DeploymentPage, WorkersPage, CasesPage,
  AgentsPage, DocumentsPage, EmailPage, ReportsPage, SettingsPage,
} from "@/pages/placeholders";

function RequireGuest({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<ClientsList />} />
              <Route path="clients/:id" element={<ClientProfile />} />
              <Route path="companies" element={<CompaniesList />} />
              <Route path="companies/:id" element={<CompanyProfile />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="job-demands" element={<JobDemandsPage />} />
              <Route path="jobs" element={<JobsPage />} />
              <Route path="applications" element={<ApplicationsPage />} />
              <Route path="candidates" element={<CandidatesPage />} />
              <Route path="interview" element={<InterviewPage />} />
              <Route path="medical" element={<MedicalPage />} />
              <Route path="work-pass" element={<WorkPassPage />} />
              <Route path="deployment" element={<DeploymentPage />} />
              <Route path="workers" element={<WorkersPage />} />
              <Route path="cases" element={<CasesPage />} />
              <Route path="agents" element={<AgentsPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              <Route path="email" element={<EmailPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
