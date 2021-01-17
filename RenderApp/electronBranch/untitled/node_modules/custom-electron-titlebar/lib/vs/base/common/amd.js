"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getUriFromAmdModule = exports.getPathFromAmdModule = void 0;

const uri_1 = require("./uri");
/**
 * @deprecated use `FileAccess.asFileUri(relativePath, requireFn).fsPath`
 */


function getPathFromAmdModule(requirefn, relativePath) {
  return getUriFromAmdModule(requirefn, relativePath).fsPath;
}

exports.getPathFromAmdModule = getPathFromAmdModule;
/**
 * @deprecated use `FileAccess.asFileUri()` for node.js contexts or `FileAccess.asBrowserUri` for browser contexts.
 */

function getUriFromAmdModule(requirefn, relativePath) {
  return uri_1.URI.parse(requirefn.toUrl(relativePath));
}

exports.getUriFromAmdModule = getUriFromAmdModule;