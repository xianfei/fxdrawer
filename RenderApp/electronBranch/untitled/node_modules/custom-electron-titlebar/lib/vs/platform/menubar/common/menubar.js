"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMenubarMenuItemAction = exports.isMenubarMenuItemUriAction = exports.isMenubarMenuItemSeparator = exports.isMenubarMenuItemSubmenu = void 0;

function isMenubarMenuItemSubmenu(menuItem) {
  return menuItem.submenu !== undefined;
}

exports.isMenubarMenuItemSubmenu = isMenubarMenuItemSubmenu;

function isMenubarMenuItemSeparator(menuItem) {
  return menuItem.id === 'vscode.menubar.separator';
}

exports.isMenubarMenuItemSeparator = isMenubarMenuItemSeparator;

function isMenubarMenuItemUriAction(menuItem) {
  return menuItem.uri !== undefined;
}

exports.isMenubarMenuItemUriAction = isMenubarMenuItemUriAction;

function isMenubarMenuItemAction(menuItem) {
  return !isMenubarMenuItemSubmenu(menuItem) && !isMenubarMenuItemSeparator(menuItem) && !isMenubarMenuItemUriAction(menuItem);
}

exports.isMenubarMenuItemAction = isMenubarMenuItemAction;