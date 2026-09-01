import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RoleGuard from './components/RoleGuard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OrganizerPage from './pages/OrganizerPage';
import AttendeePage from './pages/AttendeePage';
import SponsorPage from './pages/SponsorPage';
import EventPage from './pages/EventPage';
import CheckInPage from './pages/CheckInPage';
import RewardsPage from './pages/RewardsPage';
import EventDetailPage from './pages/EventDetailPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route
          path="/organizer"
          element={
            <RoleGuard role="organizer">
              <OrganizerPage />
            </RoleGuard>
          }
        />
        <Route
          path="/attendee"
          element={
            <RoleGuard role="attendee">
              <AttendeePage />
            </RoleGuard>
          }
        />
        <Route
          path="/sponsor"
          element={
            <RoleGuard role="sponsor">
              <SponsorPage />
            </RoleGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
