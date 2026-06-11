import { createSlice, PayloadAction } from '@reduxjs/toolkit';

<<<<<<< HEAD
export type GenderType = 'MEN' | 'WOMEN';

const genderSlice = createSlice({
  name: 'gender',
  initialState: { selected: 'WOMEN' as GenderType },
=======
export type GenderType = 'MEN' | 'WOMEN' | null;

const genderSlice = createSlice({
  name: 'gender',
  initialState: { selected: null as GenderType },
>>>>>>> 229fe5e6cb635d434839f462a2ae52b8a641a654
  reducers: {
    setGender(state, action: PayloadAction<GenderType>) {
      state.selected = action.payload;
    },
  },
});

export const { setGender } = genderSlice.actions;
export default genderSlice.reducer;
