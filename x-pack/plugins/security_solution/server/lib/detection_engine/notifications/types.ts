/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  RulesClient,
  PartialAlert,
  AlertType,
  AlertTypeParams,
  AlertTypeState,
  AlertInstanceState,
  AlertInstanceContext,
  AlertExecutorOptions,
} from '../../../../../alerting/server';
import { Alert } from '../../../../../alerting/common';
import { NOTIFICATIONS_ID } from '../../../../common/constants';
import { RuleAlertAction } from '../../../../common/detection_engine/types';

export interface RuleNotificationAlertTypeParams extends AlertTypeParams {
  ruleAlertId: string;
}
export type RuleNotificationAlertType = Alert<RuleNotificationAlertTypeParams>;

export interface FindNotificationParams {
  rulesClient: RulesClient;
  perPage?: number;
  page?: number;
  sortField?: string;
  filter?: string;
  fields?: string[];
  sortOrder?: 'asc' | 'desc';
}

export interface FindNotificationsRequestParams {
  per_page: number;
  page: number;
  search?: string;
  sort_field?: string;
  filter?: string;
  fields?: string[];
  sort_order?: 'asc' | 'desc';
}

export interface Clients {
  rulesClient: RulesClient;
}

export type UpdateNotificationParams = Omit<
  NotificationAlertParams,
  'interval' | 'actions' | 'tags'
> & {
  actions: RuleAlertAction[];
  interval: string | null | undefined;
  ruleAlertId: string;
} & Clients;

export type DeleteNotificationParams = Clients & {
  id?: string;
  ruleAlertId?: string;
};

export interface NotificationAlertParams {
  actions: RuleAlertAction[];
  enabled: boolean;
  ruleAlertId: string;
  interval: string;
  name: string;
}

export type CreateNotificationParams = NotificationAlertParams & Clients;

export interface ReadNotificationParams {
  rulesClient: RulesClient;
  id?: string | null;
  ruleAlertId?: string | null;
}

export const isAlertTypes = (
  partialAlert: Array<PartialAlert<AlertTypeParams>>
): partialAlert is RuleNotificationAlertType[] => {
  return partialAlert.every((rule) => isAlertType(rule));
};

export const isAlertType = (
  partialAlert: PartialAlert<AlertTypeParams>
): partialAlert is RuleNotificationAlertType => {
  return partialAlert.alertTypeId === NOTIFICATIONS_ID;
};

export type NotificationExecutorOptions = AlertExecutorOptions<
  RuleNotificationAlertTypeParams,
  AlertTypeState,
  AlertInstanceState,
  AlertInstanceContext
>;

// This returns true because by default a NotificationAlertTypeDefinition is an AlertType
// since we are only increasing the strictness of params.
export const isNotificationAlertExecutor = (
  obj: NotificationAlertTypeDefinition
): obj is AlertType<
  AlertTypeParams,
  AlertTypeParams,
  AlertTypeState,
  AlertInstanceState,
  AlertInstanceContext
> => {
  return true;
};

export type NotificationAlertTypeDefinition = Omit<
  AlertType<
    AlertTypeParams,
    AlertTypeParams,
    AlertTypeState,
    AlertInstanceState,
    AlertInstanceContext,
    'default'
  >,
  'executor'
> & {
  executor: ({
    services,
    params,
    state,
  }: NotificationExecutorOptions) => Promise<AlertTypeState | void>;
};
