/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import Path from 'path';

import { run, REPO_ROOT } from '@kbn/dev-utils';
import del from 'del';

import { RefOutputCache } from './ref_output_cache';
import { buildAllTsRefs } from './build_ts_refs';
import { updateRootRefsConfig, ROOT_REFS_CONFIG_PATH } from './root_refs_config';
import { Project } from './project';
import { PROJECT_CACHE } from './projects';
import { concurrentMap } from './concurrent_map';

const CACHE_WORKING_DIR = Path.resolve(REPO_ROOT, 'data/ts_refs_output_cache');

const TS_ERROR_REF = /\sTS\d{1,6}:\s/;

const isTypeFailure = (error: any) =>
  error.exitCode > 0 &&
  error.stderr === '' &&
  typeof error.stdout === 'string' &&
  TS_ERROR_REF.test(error.stdout);

export async function runBuildRefsCli() {
  run(
    async ({ log, flags, procRunner }) => {
      if (process.env.BUILD_TS_REFS_DISABLE === 'true' && !flags.force) {
        log.info(
          'Building ts refs is disabled because the BUILD_TS_REFS_DISABLE environment variable is set to "true". Pass `--force` to run the build anyway.'
        );
        return;
      }

      // if the tsconfig.refs.json file is not self-managed then make sure it has
      // a reference to every composite project in the repo
      await updateRootRefsConfig(log);

      // load all the projects referenced from the root refs config deeply, so we know all
      // the ts projects we are going to be cleaning or populating with caches
      const projects = Project.load(
        ROOT_REFS_CONFIG_PATH,
        {},
        {
          skipConfigValidation: true,
        }
      ).getProjectsDeep(PROJECT_CACHE);

      const cacheEnabled = process.env.BUILD_TS_REFS_CACHE_ENABLE !== 'false' && !!flags.cache;
      const doCapture = process.env.BUILD_TS_REFS_CACHE_CAPTURE === 'true';
      const doClean = !!flags.clean || doCapture;
      const doInitCache = cacheEnabled && !doCapture;

      if (doClean) {
        log.info('deleting', projects.outDirs.length, 'ts output directories');
        await concurrentMap(100, projects.outDirs, (outDir) => del(outDir));
      }

      let outputCache;
      if (cacheEnabled) {
        outputCache = await RefOutputCache.create({
          log,
          projects,
          repoRoot: REPO_ROOT,
          workingDir: CACHE_WORKING_DIR,
          upstreamUrl: 'https://github.com/elastic/kibana.git',
        });
      }

      if (outputCache && doInitCache) {
        await outputCache.initCaches();
      }

      try {
        await buildAllTsRefs({ log, procRunner, verbose: !!flags.verbose });
        log.success('ts refs build successfully');
      } catch (error) {
        const typeFailure = isTypeFailure(error);

        if (flags['ignore-type-failures'] && typeFailure) {
          log.warning(
            'tsc reported type errors but we are ignoring them for now, to see them please run `node scripts/type_check` or `node scripts/build_ts_refs` without the `--ignore-type-failures` flag.'
          );
        } else {
          throw error;
        }
      }

      if (outputCache && doCapture) {
        await outputCache.captureCache(Path.resolve(REPO_ROOT, 'target/ts_refs_cache'));
      }

      if (outputCache) {
        await outputCache.cleanup();
      }
    },
    {
      description: 'Build TypeScript projects',
      flags: {
        boolean: ['clean', 'force', 'cache', 'ignore-type-failures'],
        default: {
          cache: true,
        },
        help: `
          --force            Run the build even if the BUILD_TS_REFS_DISABLE is set to "true"
          --clean            Delete outDirs for each ts project before building
          --no-cache         Disable fetching/extracting outDir caches based on the mergeBase with upstream
          --ignore-type-failures  If tsc reports type errors, ignore them and just log a small warning
        `,
      },
      log: {
        defaultLevel: 'debug',
      },
    }
  );
}
