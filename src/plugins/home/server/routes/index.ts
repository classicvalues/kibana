/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { IRouter } from 'src/core/server';
import { registerHitsStatusRoute } from './fetch_es_hits_status';
import { registerNewInstanceStatusRoute } from './fetch_new_instance_status';

export const registerRoutes = (router: IRouter) => {
  registerHitsStatusRoute(router);
  registerNewInstanceStatusRoute(router);
};
