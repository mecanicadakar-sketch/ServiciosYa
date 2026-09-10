import { ALL_PARAGUAY_CITIES, PARAGUAY_DEPARTMENTS } from '../data/paraguayData';
import { ServiceProfessional } from '../types';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula in kilometers.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Resolves coordinates for a professional.
 * 1. Checks explicit p.lat and p.lng
 * 2. Matches professional's zone or coverageAreas with ALL_PARAGUAY_CITIES
 * 3. Fallbacks to Encarnación center (-27.3306, -55.8667)
 */
export function getProfessionalCoordinates(p: ServiceProfessional): { lat: number; lng: number } {
  if (
    typeof p.lat === 'number' &&
    typeof p.lng === 'number' &&
    !isNaN(p.lat) &&
    !isNaN(p.lng) &&
    p.lat !== 0 &&
    p.lng !== 0
  ) {
    return { lat: p.lat, lng: p.lng };
  }

  const pZone = (p.zone || '').toLowerCase().trim();
  
  // Try exact match or inclusion
  let matched = ALL_PARAGUAY_CITIES.find(c => {
    const cName = c.name.toLowerCase();
    return cName === pZone || pZone.includes(cName) || cName.includes(pZone);
  });

  // Try coverage areas
  if (!matched && p.coverageAreas && p.coverageAreas.length > 0) {
    for (const area of p.coverageAreas) {
      const aName = area.toLowerCase().trim();
      const m = ALL_PARAGUAY_CITIES.find(c => {
        const cName = c.name.toLowerCase();
        return cName === aName || aName.includes(cName) || cName.includes(aName);
      });
      if (m) {
        matched = m;
        break;
      }
    }
  }

  if (matched) {
    return { lat: matched.lat, lng: matched.lng };
  }

  // Default coordinate: Encarnación
  return { lat: -27.3306, lng: -55.8667 };
}

/**
 * Formats kilometers into readable string (e.g., "650 m", "3.2 km", "45 km")
 */
export function formatDistanceKm(km: number): string {
  if (km < 1) {
    const meters = Math.max(50, Math.round(km * 1000));
    return `${meters} m`;
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

/**
 * Identifies the nearest known city name to given coordinates
 */
export function getNearestCityName(lat: number, lng: number): string {
  if (!ALL_PARAGUAY_CITIES || ALL_PARAGUAY_CITIES.length === 0) {
    return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }

  let nearestCity = ALL_PARAGUAY_CITIES[0];
  let minDistance = Infinity;

  for (const city of ALL_PARAGUAY_CITIES) {
    const dist = calculateHaversineDistanceKm(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestCity = city;
    }
  }

  if (minDistance <= 40 && nearestCity) {
    return `${nearestCity.name} (${nearestCity.departmentName})`;
  }
  return `${lat.toFixed(3)}, ${lng.toFixed(3)}`;
}

/**
 * Quick reference sample cities for user simulation or if GPS is blocked
 */
export const SAMPLE_USER_LOCATIONS: { name: string; dept: string; lat: number; lng: number }[] = [
  { name: 'Encarnación', dept: 'Itapúa', lat: -27.3306, lng: -55.8667 },
  { name: 'Cambyretá', dept: 'Itapúa', lat: -27.3167, lng: -55.8167 },
  { name: 'Capitán Miranda', dept: 'Itapúa', lat: -27.2000, lng: -55.8000 },
  { name: 'Hohenau', dept: 'Itapúa', lat: -27.0833, lng: -55.6500 },
  { name: 'Coronel Bogado', dept: 'Itapúa', lat: -27.1667, lng: -56.2500 },
  { name: 'Asunción', dept: 'Capital', lat: -25.2867, lng: -57.6470 },
  { name: 'San Lorenzo', dept: 'Central', lat: -25.3389, lng: -57.5097 },
  { name: 'Ciudad del Este', dept: 'Alto Paraná', lat: -25.5097, lng: -54.6111 }
];

/**
 * Checks if a professional matches a location filter (department or city).
 * Supports direct match, coverage areas, and department-wide matching.
 */
export function matchesLocationFilter(
  professionalZone: string,
  coverageAreas: string[] = [],
  filterZone: string
): boolean {
  if (!filterZone || filterZone === 'all' || filterZone === 'Todas las zonas' || filterZone === 'Todo el Paraguay (Todas las zonas)') {
    return true;
  }
  const fZone = filterZone.toLowerCase().trim();
  const pZone = (professionalZone || '').toLowerCase().trim();

  // 1. Direct match with city/zone
  if (pZone === fZone || pZone.includes(fZone) || fZone.includes(pZone)) {
    return true;
  }

  // 2. Coverage areas match
  if (coverageAreas && coverageAreas.length > 0) {
    if (coverageAreas.some(area => {
      const a = area.toLowerCase().trim();
      return a === fZone || a.includes(fZone) || fZone.includes(a);
    })) {
      return true;
    }
  }

  // 3. Department matching: check if filterZone is a department name or ID
  const matchedDept = PARAGUAY_DEPARTMENTS.find(d => 
    d.name.toLowerCase().includes(fZone) || 
    fZone.includes(d.name.toLowerCase()) || 
    d.id.toLowerCase() === fZone
  );

  if (matchedDept) {
    // Check if the professional's zone is in any city of that department
    const inDept = matchedDept.cities.some(city => {
      const c = city.name.toLowerCase().trim();
      return pZone === c || pZone.includes(c) || c.includes(pZone) ||
        (coverageAreas && coverageAreas.some(area => {
          const a = area.toLowerCase().trim();
          return a === c || a.includes(c) || c.includes(a);
        }));
    });
    if (inDept) return true;
  }

  return false;
}

