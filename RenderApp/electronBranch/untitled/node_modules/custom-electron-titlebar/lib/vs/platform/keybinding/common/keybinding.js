"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IKeybindingService = void 0;

const instantiation_1 = require("../../instantiation/common/instantiation");

exports.IKeybindingService = instantiation_1.createDecorator('keybindingService');