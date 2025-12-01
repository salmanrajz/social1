'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
export const revalidate = 0;

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '../components/Header';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="container">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container">
      <Header />
      <AnalyticsDashboard />
    </div>
  );
}
