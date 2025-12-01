'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';
export const revalidate = 0;

import ModernHeader from '../components/ModernHeader';
import { CollectionsManager } from '../components/Collections';

export default function CollectionsPage() {
  return (
    <div className="container">
      <ModernHeader />
      <main className="main-content">
        <CollectionsManager />
      </main>
    </div>
  );
}

