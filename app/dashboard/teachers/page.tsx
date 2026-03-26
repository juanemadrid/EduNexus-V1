'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeachersRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/institutional/teachers/basic-info');
  }, [router]);

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
      <div className="loader-premium"></div>
    </div>
  );
}
