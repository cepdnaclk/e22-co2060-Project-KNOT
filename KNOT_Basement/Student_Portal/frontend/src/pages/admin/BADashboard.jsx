import { useOutletContext } from 'react-router-dom';
import { DashboardOverview } from './BookingViews';

export default function BADashboard() {
  const { stats, autoBookingEnabled, setAutoBookingEnabled } = useOutletContext();
  return <DashboardOverview stats={stats} autoBookingEnabled={autoBookingEnabled} setAutoBookingEnabled={setAutoBookingEnabled} />;
}
