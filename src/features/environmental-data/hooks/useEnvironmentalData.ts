import { useQuery } from '@tanstack/react-query';
import { environmentalService } from '../services/environmentalService';
import type { EnvironmentalRequest } from '../types';

export function useEnvironmentalData(request: EnvironmentalRequest | null) {
  return useQuery({
    queryKey: ['environmental', request?.lat, request?.lng, request?.incidentTime],
    queryFn: () => environmentalService.fetchEnvironmentalData(request!),
    enabled: !!request && request.lat !== undefined && request.lng !== undefined,
    staleTime: 5 * 60 * 1000,
  });
}
