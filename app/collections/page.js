'use client';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const runtime = 'nodejs';
export const revalidate = 0;

export function generateStaticParams() {
  return [];
}

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

