// app/ui/src/constants/google-maps.ts

export const GOOGLE_MAPS_LIBRARIES: ('places' | 'marker')[] = ['places', 'marker'] as const;

export const MARKER_SIZE = 34;
export const MARKER_COLORS = {
  DEFAULT: '#28a745',
  SELECTED: '#1e7e34',
  HOVER: '#218838',
} as const;

