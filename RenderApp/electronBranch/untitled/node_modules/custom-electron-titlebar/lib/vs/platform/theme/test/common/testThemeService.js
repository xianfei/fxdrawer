"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TestThemeService = exports.TestFileIconTheme = exports.TestColorTheme = void 0;

const event_1 = require("../../../../base/common/event");

const color_1 = require("../../../../base/common/color");

const theme_1 = require("../../common/theme");

class TestColorTheme {
  constructor(colors = {}, type = theme_1.ColorScheme.DARK) {
    this.colors = colors;
    this.type = type;
    this.label = 'test';
    this.semanticHighlighting = false;
  }

  getColor(color, useDefault) {
    let value = this.colors[color];

    if (value) {
      return color_1.Color.fromHex(value);
    }

    return undefined;
  }

  defines(color) {
    throw new Error('Method not implemented.');
  }

  getTokenStyleMetadata(type, modifiers, modelLanguage) {
    return undefined;
  }

  get tokenColorMap() {
    return [];
  }

}

exports.TestColorTheme = TestColorTheme;

class TestFileIconTheme {
  constructor() {
    this.hasFileIcons = false;
    this.hasFolderIcons = false;
    this.hidesExplorerArrows = false;
  }

}

exports.TestFileIconTheme = TestFileIconTheme;

class TestThemeService {
  constructor(theme = new TestColorTheme(), iconTheme = new TestFileIconTheme()) {
    this._onThemeChange = new event_1.Emitter();
    this._onFileIconThemeChange = new event_1.Emitter();
    this._colorTheme = theme;
    this._fileIconTheme = iconTheme;
  }

  getColorTheme() {
    return this._colorTheme;
  }

  setTheme(theme) {
    this._colorTheme = theme;
    this.fireThemeChange();
  }

  fireThemeChange() {
    this._onThemeChange.fire(this._colorTheme);
  }

  get onDidColorThemeChange() {
    return this._onThemeChange.event;
  }

  getFileIconTheme() {
    return this._fileIconTheme;
  }

  get onDidFileIconThemeChange() {
    return this._onFileIconThemeChange.event;
  }

}

exports.TestThemeService = TestThemeService;