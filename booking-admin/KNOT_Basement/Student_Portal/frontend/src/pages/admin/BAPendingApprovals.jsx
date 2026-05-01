import { useOutletContext } from 'react-router-dom';
import { PendingApprovals } from './BookingViews';

export default function BAPendingApprovals() {
  const { approvals, loadingId, handleAction } = useOutletContext();
  return <PendingApprovals approvals={approvals} loadingId={loadingId} handleAction={handleAction} />;
}
