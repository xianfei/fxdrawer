"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IContextMenuService = exports.IContextViewService = void 0;

const instantiation_1 = require("../../instantiation/common/instantiation");

exports.IContextViewService = instantiation_1.createDecorator('contextViewService');
exports.IContextMenuService = instantiation_1.createDecorator('contextMenuService');