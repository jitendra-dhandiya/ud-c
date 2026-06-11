'use client';
import { useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { setGender, type GenderType } from '../../store/slices/genderSlice';

export default function GenderInitializer() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    const saved = localStorage.getItem('ud_gender') as GenderType | null;
<<<<<<< HEAD
    // Restore MEN preference; WOMEN is already the slice default so no dispatch needed
    if (saved === 'MEN') dispatch(setGender('MEN'));
    else if (!saved) localStorage.setItem('ud_gender', 'WOMEN');
=======
    if (saved === 'MEN' || saved === 'WOMEN') dispatch(setGender(saved));
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654
  }, [dispatch]);
  return null;
}
