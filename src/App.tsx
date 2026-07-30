import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import OrganizerPage from './pages/OrganizerPage';
import AttendeePage from './pages/AttendeePage';
import SponsorPage from './pages/SponsorPage';
import EventPage from './pages/EventPage';
import CheckInPage from './pages/CheckInPage';
import RewardsPage from './pages/RewardsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/organizer" element={<OrganizerPage />} />
        <Route path="/attendee" element={<AttendeePage />} />
        <Route path="/sponsor" element={<SponsorPage />} />
        <Route path="/event" element={<EventPage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
      </Route>
    </Routes>
  );
}
