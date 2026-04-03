'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeacherRegisterRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/institutional/people/teachers/basic-info?openModal=true');
  }, [router]);
  return null;
}
