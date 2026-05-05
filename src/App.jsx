import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import CredentialTracker   from './pages/CredentialTracker';
import EmergencyContact    from './pages/EmergencyContact';
import DCFChecklist        from './pages/DCFChecklist';
import EnrollmentChecklist from './pages/EnrollmentChecklist';
import ParentAuth          from './pages/ParentAuth';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                     element={<CredentialTracker />} />
        <Route path="/credential-tracker"   element={<CredentialTracker />} />
        <Route path="/emergency-contact"    element={<EmergencyContact />} />
        <Route path="/dcf-checklist"        element={<DCFChecklist />} />
        <Route path="/enrollment-checklist" element={<EnrollmentChecklist />} />
        <Route path="/parent-auth"          element={<ParentAuth />} />
      </Routes>
    </BrowserRouter>
  );
}
