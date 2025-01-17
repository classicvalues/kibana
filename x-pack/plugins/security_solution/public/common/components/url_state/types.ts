/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as H from 'history';
import { ActionCreator } from 'typescript-fsa';
import {
  Filter,
  FilterManager,
  IIndexPattern,
  Query,
  SavedQueryService,
} from 'src/plugins/data/public';

import { UrlInputsModel } from '../../store/inputs/model';
import { TimelineUrl } from '../../../timelines/store/timeline/model';
import { RouteSpyState } from '../../utils/route/types';
import { DispatchUpdateTimeline } from '../../../timelines/components/open_timeline/types';
import { SecurityNav } from '../navigation/types';

import { CONSTANTS, UrlStateType } from './constants';
import { SourcererScopePatterns } from '../../store/sourcerer/model';

export const ALL_URL_STATE_KEYS: KeyUrlState[] = [
  CONSTANTS.appQuery,
  CONSTANTS.filters,
  CONSTANTS.savedQuery,
  CONSTANTS.sourcerer,
  CONSTANTS.timerange,
  CONSTANTS.timeline,
];

export const URL_STATE_KEYS: Record<UrlStateType, KeyUrlState[]> = {
  alerts: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
  rules: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
  exceptions: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
  host: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
  ueba: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
  administration: [],
  network: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
  overview: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
  timeline: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
  case: [
    CONSTANTS.appQuery,
    CONSTANTS.filters,
    CONSTANTS.savedQuery,
    CONSTANTS.sourcerer,
    CONSTANTS.timerange,
    CONSTANTS.timeline,
  ],
};

export type LocationTypes =
  | CONSTANTS.caseDetails
  | CONSTANTS.casePage
  | CONSTANTS.alertsPage
  | CONSTANTS.hostsDetails
  | CONSTANTS.hostsPage
  | CONSTANTS.networkDetails
  | CONSTANTS.networkPage
  | CONSTANTS.overviewPage
  | CONSTANTS.timelinePage
  | CONSTANTS.unknown;

export interface UrlState {
  [CONSTANTS.appQuery]?: Query;
  [CONSTANTS.filters]?: Filter[];
  [CONSTANTS.savedQuery]?: string;
  [CONSTANTS.sourcerer]: SourcererScopePatterns;
  [CONSTANTS.timerange]: UrlInputsModel;
  [CONSTANTS.timeline]: TimelineUrl;
}
export type KeyUrlState = keyof UrlState;

export interface UrlStateProps {
  navTabs: SecurityNav;
  indexPattern?: IIndexPattern;
  mapToUrlState?: (value: string) => UrlState;
  onChange?: (urlState: UrlState, previousUrlState: UrlState) => void;
  onInitialize?: (urlState: UrlState) => void;
}

export interface UrlStateStateToPropsType {
  urlState: UrlState;
}

export interface UpdateTimelineIsLoading {
  id: string;
  isLoading: boolean;
}

export interface UrlStateDispatchToPropsType {
  setInitialStateFromUrl: DispatchSetInitialStateFromUrl;
  updateTimeline: DispatchUpdateTimeline;
  updateTimelineIsLoading: ActionCreator<UpdateTimelineIsLoading>;
}

export type UrlStateContainerPropTypes = RouteSpyState &
  UrlStateStateToPropsType &
  UrlStateDispatchToPropsType &
  UrlStateProps;

export interface PreviousLocationUrlState {
  pathName: string | undefined;
  pageName: string | undefined;
  urlState: UrlState;
}

export interface UrlStateToRedux {
  urlKey: KeyUrlState;
  newUrlStateString: string;
}

export interface SetInitialStateFromUrl<TCache> {
  detailName: string | undefined;
  filterManager: FilterManager;
  indexPattern: IIndexPattern | undefined;
  pageName: string;
  savedQueries: SavedQueryService;
  updateTimeline: DispatchUpdateTimeline;
  updateTimelineIsLoading: ActionCreator<UpdateTimelineIsLoading>;
  urlStateToUpdate: UrlStateToRedux[];
}

export type DispatchSetInitialStateFromUrl = <TCache>({
  detailName,
  indexPattern,
  pageName,
  updateTimeline,
  updateTimelineIsLoading,
  urlStateToUpdate,
}: SetInitialStateFromUrl<TCache>) => () => void;

export interface ReplaceStateInLocation<T> {
  history?: H.History;
  urlStateToReplace: T;
  urlStateKey: string;
  pathName: string;
  search: string;
}

export interface UpdateUrlStateString {
  isInitializing: boolean;
  history?: H.History;
  newUrlStateString: string;
  pathName: string;
  search: string;
  updateTimerange: boolean;
  urlKey: KeyUrlState;
}
