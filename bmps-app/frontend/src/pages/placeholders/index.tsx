import {
  Briefcase, ClipboardList, FileCheck2, UserSearch, CalendarClock, Stethoscope,
  BadgeCheck, Plane, HardHat, Gavel, Handshake, FolderLock, Mail, BarChart3, Settings,
} from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const JobDemandsPage = () => (
  <ModulePlaceholder
    title="Job Demand"
    description="Client recruitment requests — position, quantity, permit type, deadline."
    icon={Briefcase}
    features={["Job Demand Intake", "Quantity & Fulfilment Tracking", "Permit Type & Requirements", "Priority & Deadline Alerts", "Linked Applications", "Recruiter Assignment"]}
  />
);

export const JobsPage = () => (
  <ModulePlaceholder
    title="Recruitment / Jobs"
    description="Sourcing and shortlisting pipeline against open job demand."
    icon={ClipboardList}
    features={["Sourcing Pipeline", "Shortlist Management", "Interview Scheduling Handoff", "Source Attribution", "Recruiter Workload", "Status Kanban"]}
  />
);

export const ApplicationsPage = () => (
  <ModulePlaceholder
    title="Applications"
    description="End-to-end application workflow from submission to active worker."
    icon={FileCheck2}
    features={["Status Workflow Engine", "Status Timeline", "IPA & Medical Handoff", "Cancellation Tracking", "Document Linking", "Recruiter & Agent Attribution"]}
  />
);

export const CandidatesPage = () => (
  <ModulePlaceholder
    title="Candidates"
    description="Candidate profiles across sourcing, screening, and deployment."
    icon={UserSearch}
    features={["Candidate Profiles", "Skills & Experience", "Passport & Medical History", "Agent Attribution", "Application History", "Document Linking"]}
  />
);

export const InterviewPage = () => (
  <ModulePlaceholder
    title="Interview"
    description="Interview scheduling, trade tests, and employer feedback."
    icon={CalendarClock}
    features={["Interview Scheduling", "Trade Test Tracking", "Employer Feedback & Rating", "Calendar View", "Panel Assignment", "Result Handoff to Applications"]}
  />
);

export const MedicalPage = () => (
  <ModulePlaceholder
    title="Medical"
    description="Medical appointments, results, and re-medical tracking."
    icon={Stethoscope}
    features={["Appointment Scheduling", "Fit/Unfit Result Tracking", "Re-Medical Workflow", "Expiry Reminders", "Medical Centre Directory", "Document Linking"]}
  />
);

export const WorkPassPage = () => (
  <ModulePlaceholder
    title="IPA & Work Pass"
    description="IPA validity, work permit issuance, renewal, and cancellation history."
    icon={BadgeCheck}
    features={["IPA Validity Tracking", "Work Permit Issuance", "Renewal Workflow", "Dependant Pass Tracking", "Cancellation History", "Expiry Reminders"]}
  />
);

export const DeploymentPage = () => (
  <ModulePlaceholder
    title="Deployment"
    description="Travel arrangements, flight changes, and arrival tracking."
    icon={Plane}
    features={["Ticket & Flight Tracking", "Travel Change History", "Arrival & Joining Status", "Accommodation Arrangement", "Immigration Status", "Employer Joining Confirmation"]}
  />
);

export const WorkersPage = () => (
  <ModulePlaceholder
    title="Worker Management"
    description="Active workforce with full salary, transfer, and status history."
    icon={HardHat}
    features={["Worker Profiles", "Salary History", "Transfer History", "Occupation History", "Status & Special Pass History", "Cancellation History"]}
  />
);

export const CasesPage = () => (
  <ModulePlaceholder
    title="Case Management"
    description="Complaints, disputes, and disciplinary case tracking."
    icon={Gavel}
    features={["Case Intake", "Priority & Escalation", "Resolution Tracking", "Linked Worker/Client/Company", "Case Timeline", "Overdue Alerts"]}
  />
);

export const AgentsPage = () => (
  <ModulePlaceholder
    title="Agents & Sub-Agents"
    description="Overseas recruiting agents and their sub-agents."
    icon={Handshake}
    features={["Agent Directory", "Sub-Agent Hierarchy", "Country Coverage", "Performance Stats", "Candidate Source Attribution", "Document Linking"]}
  />
);

export const DocumentsPage = () => (
  <ModulePlaceholder
    title="Document Management"
    description="Central document library linked across every module."
    icon={FolderLock}
    features={["Central Document Library", "Expiry Reminders", "Version History", "Confidential Access Control", "Linked Record Browsing", "Bulk Upload"]}
  />
);

export const EmailPage = () => (
  <ModulePlaceholder
    title="Email Center"
    description="Unified inbox synced across company and candidate accounts."
    icon={Mail}
    features={["Unified Inbox", "Account Vault", "Linked Record Tagging", "Read/Unread Tracking", "Access Logs", "Sync Status"]}
  />
);

export const ReportsPage = () => (
  <ModulePlaceholder
    title="Reports"
    description="Cross-module reporting and exports."
    icon={BarChart3}
    features={["Recruitment Pipeline Reports", "Compliance Reports", "Worker Headcount Reports", "Case Load Reports", "Saved Filters", "CSV / PDF Export"]}
  />
);

export const SettingsPage = () => (
  <ModulePlaceholder
    title="Team & Settings"
    description="Users, roles, permissions, and system configuration."
    icon={Settings}
    features={["User Management", "Role & Permission Matrix", "Login History", "Audit Log Viewer", "Master Data Configuration", "Security Settings"]}
  />
);
