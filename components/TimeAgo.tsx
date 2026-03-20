'use client';
import React, { useState, useEffect } from 'react';

interface TimeAgoProps {
  timestamp: number;
}

export default function TimeAgo({ timestamp }: TimeAgoProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const now = Date.now();
      const diffInSeconds = Math.floor((now - timestamp) / 1000);

      if (diffInSeconds < 60) {
        return 'hace unos segundos';
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return `hace ${diffInMinutes} min`;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
      }

      const diffInDays = Math.floor(diffInHours / 24);
      return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    };

    setTimeAgo(calculateTimeAgo());

    const intervalId = setInterval(() => {
      setTimeAgo(calculateTimeAgo());
    }, 60000); // Actualizar cada minuto

    return () => clearInterval(intervalId);
  }, [timestamp]);

  return <span>{timeAgo}</span>;
}
