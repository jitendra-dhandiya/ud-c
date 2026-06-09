import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type GenderType = 'MEN' | 'WOMEN' | null;

const genderSlice = createSlice({
  name: 'gender',
  initialState: { selected: null as GenderType },
  reducers: {
    setGender(state, action: PayloadAction<GenderType>) {
      state.selected = action.payload;
    },
  },
});

export const { setGender } = genderSlice.actions;
export default genderSlice.reducer;
