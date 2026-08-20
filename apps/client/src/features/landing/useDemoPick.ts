import { useMutation } from '@tanstack/react-query';
import { demo } from '../../services/api/demo';
import type {
  PickRequest,
  RecommendationResult,
} from '../../services/api/households';

export function useDemoPick() {
  return useMutation<RecommendationResult, Error, PickRequest>({
    mutationFn: body => demo.pick(body),
  });
}
