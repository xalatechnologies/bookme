import { useTranslation } from 'react-i18next';
import { ActivityType, ActorType } from '../types';

/**
 * Actor type multiplier mapping
 */
const ACTOR_MULTIPLIERS: Record<ActorType | '', number> = {
  '': 1.0,
  'private-person': 1.0,
  'lag-foreninger': 0.8,
  'paraply': 0.7,
  'private-firma': 1.2,
  'kommunale-enheter': 0.5
};

/**
 * Activity type adjustment mapping
 */
const ACTIVITY_ADJUSTMENTS: Record<ActivityType | '', number> = {
  '': 0,
  'sport': 0,
  'kultur': -50,
  'møte': 100,
  'arrangement': 200,
  'trening': 0,
  'annet': 0
};

/**
 * Get actor type multiplier
 */
export const getActorMultiplier = (actorType: ActorType | ''): number => {
  return ACTOR_MULTIPLIERS[actorType] ?? 1.0;
};

/**
 * Get activity type adjustment
 */
export const getActivityAdjustment = (activityType: ActivityType | ''): number => {
  return ACTIVITY_ADJUSTMENTS[activityType] ?? 0;
};

/**
 * Hook for pricing display utilities
 */
export const usePricingDisplay = () => {
  const { t } = useTranslation(['booking']);

  /**
   * Get actor type description with pricing info
   */
  const getActorDescription = (actorType: ActorType | ''): string => {
    if (!actorType) return t('booking:form.actor_type_placeholder', 'Velg aktør type');

    const multiplier = getActorMultiplier(actorType);
    const discount = (1 - multiplier) * 100;
    const surcharge = (multiplier - 1) * 100;

    if (multiplier < 1) {
      return `${t(`booking:actor_types.${actorType.replace('-', '_')}`, actorType)} (${discount}% rabatt)`;
    } else if (multiplier > 1) {
      return `${t(`booking:actor_types.${actorType.replace('-', '_')}`, actorType)} (${surcharge}% tillegg)`;
    }
    return t(`booking:actor_types.${actorType.replace('-', '_')}`, 'Privatperson');
  };

  /**
   * Get activity type description with pricing info
   */
  const getActivityDescription = (activityType: ActivityType | ''): string => {
    if (!activityType) return t('booking:form.activity_type_placeholder', 'Velg aktivitetstype');

    const adjustment = getActivityAdjustment(activityType);

    if (adjustment < 0) {
      return `${t(`booking:activity_types.${activityType}`, activityType)} (${Math.abs(adjustment)} kr rabatt)`;
    } else if (adjustment > 0) {
      return `${t(`booking:activity_types.${activityType}`, activityType)} (${adjustment} kr tillegg)`;
    }
    return t(`booking:activity_types.${activityType}`, 'Aktivitet');
  };

  return {
    getActorMultiplier,
    getActivityAdjustment,
    getActorDescription,
    getActivityDescription
  };
};
