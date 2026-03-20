'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FamilyRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    // The registration form is a modal on the basic-info page
    router.replace('/dashboard/institutional/family/basic-info?openModal=true');
  }, [router]);
  return null;
}
