'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
export const revalidate = 0;

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

