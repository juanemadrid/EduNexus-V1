'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/institutional/people/students/basic-info?openModal=true');
  }, [router]);
  return null;
}
