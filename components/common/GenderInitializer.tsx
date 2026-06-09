'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { setGender, type GenderType } from '../../store/slices/genderSlice';

export default function GenderInitializer() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const saved = localStorage.getItem('ud_gender') as GenderType | null;
    if (saved === 'MEN' || saved === 'WOMEN') dispatch(setGender(saved));
  }, [dispatch]);
  return null;
}
