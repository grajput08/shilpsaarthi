import data from '@/data/india-states-districts.json';

type IndiaLocationsData = {
  states: Array<{
    state: string;
    districts: string[];
  }>;
};

const locations = data as IndiaLocationsData;

const districtsByState = new Map<string, string[]>(
  locations.states.map(({ state, districts }) => [state, districts]),
);

export const INDIAN_STATES: string[] = locations.states.map(({ state }) => state);

function normalize(value: string): string {
  return value.trim();
}

export function getDistrictsForState(state: string): string[] {
  return districtsByState.get(normalize(state)) ?? [];
}

export function isValidStateDistrict(state: string, district: string): boolean {
  const districts = districtsByState.get(normalize(state));
  if (!districts) {
    return false;
  }

  const normalizedDistrict = normalize(district);
  return districts.includes(normalizedDistrict);
}
