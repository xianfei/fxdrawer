"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitizeProcessEnvironment = void 0;
/**
 * Sanitizes a VS Code process environment by removing all Electron/VS Code-related values.
 */

function sanitizeProcessEnvironment(env, ...preserve) {
  const set = preserve.reduce((set, key) => {
    set[key] = true;
    return set;
  }, {});
  const keysToRemove = [/^ELECTRON_.+$/, /^GOOGLE_API_KEY$/, /^VSCODE_.+$/, /^SNAP(|_.*)$/];
  const envKeys = Object.keys(env);
  envKeys.filter(key => !set[key]).forEach(envKey => {
    for (let i = 0; i < keysToRemove.length; i++) {
      if (envKey.search(keysToRemove[i]) !== -1) {
        delete env[envKey];
        break;
      }
    }
  });
}

exports.sanitizeProcessEnvironment = sanitizeProcessEnvironment;