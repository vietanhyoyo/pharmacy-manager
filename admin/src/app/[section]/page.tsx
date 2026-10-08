import { notFound } from 'next/navigation';
import { AdminApp } from '@/components/admin-app';
import { Section, sections } from '@/lib/types';

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.includes(section as Section)) notFound();
  return <AdminApp section={section as Section} />;
}
