'use client';

import ModernHeader from '../components/ModernHeader';
import { AlertsManager } from '../components/TrendAlerts';

export default function AlertsPage() {
  return (
    <div className="container">
      <ModernHeader />
      <main className="main-content">
        <AlertsManager />
      </main>
    </div>
  );
}

