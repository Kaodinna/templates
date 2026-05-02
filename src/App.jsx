import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CredentialTracker from "./pages/CredentialTracker";
import EmergencyContact from "./pages/EmergencyContact";
import DCFChecklist from "./pages/DCFChecklist";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CredentialTracker />} />
        <Route path="/credential-tracker" element={<CredentialTracker />} />
        <Route path="/emergency-contact" element={<EmergencyContact />} />
        <Route path="/dcf-checklist" element={<DCFChecklist />} />
      </Routes>
    </BrowserRouter>
  );
}
