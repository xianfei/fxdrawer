"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.InputFocusedContext = exports.InputFocusedContextKey = exports.IsDevelopmentContext = exports.IsMacNativeContext = exports.IsWebContext = exports.IsWindowsContext = exports.IsLinuxContext = exports.IsMacContext = void 0;

const contextkey_1 = require("./contextkey");

const platform_1 = require("../../../base/common/platform");

exports.IsMacContext = new contextkey_1.RawContextKey('isMac', platform_1.isMacintosh);
exports.IsLinuxContext = new contextkey_1.RawContextKey('isLinux', platform_1.isLinux);
exports.IsWindowsContext = new contextkey_1.RawContextKey('isWindows', platform_1.isWindows);
exports.IsWebContext = new contextkey_1.RawContextKey('isWeb', platform_1.isWeb);
exports.IsMacNativeContext = new contextkey_1.RawContextKey('isMacNative', platform_1.isMacintosh && !platform_1.isWeb);
exports.IsDevelopmentContext = new contextkey_1.RawContextKey('isDevelopment', false);
exports.InputFocusedContextKey = 'inputFocus';
exports.InputFocusedContext = new contextkey_1.RawContextKey(exports.InputFocusedContextKey, false);