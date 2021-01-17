"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeAccents = exports.normalizeNFD = exports.normalizeNFC = exports.canNormalize = void 0;

const map_1 = require("./map");
/**
 * The normalize() method returns the Unicode Normalization Form of a given string. The form will be
 * the Normalization Form Canonical Composition.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize}
 */


exports.canNormalize = typeof String.prototype
/* standalone editor compilation */
.normalize === 'function';
const nfcCache = new map_1.LRUCache(10000); // bounded to 10000 elements

function normalizeNFC(str) {
  return normalize(str, 'NFC', nfcCache);
}

exports.normalizeNFC = normalizeNFC;
const nfdCache = new map_1.LRUCache(10000); // bounded to 10000 elements

function normalizeNFD(str) {
  return normalize(str, 'NFD', nfdCache);
}

exports.normalizeNFD = normalizeNFD;
const nonAsciiCharactersPattern = /[^\u0000-\u0080]/;

function normalize(str, form, normalizedCache) {
  if (!exports.canNormalize || !str) {
    return str;
  }

  const cached = normalizedCache.get(str);

  if (cached) {
    return cached;
  }

  let res;

  if (nonAsciiCharactersPattern.test(str)) {
    res = str.normalize(form);
  } else {
    res = str;
  } // Use the cache for fast lookup


  normalizedCache.set(str, res);
  return res;
}

exports.removeAccents = function () {
  if (!exports.canNormalize) {
    // no ES6 features...
    return function (str) {
      return str;
    };
  } else {
    // transform into NFD form and remove accents
    // see: https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript/37511463#37511463
    const regex = /[\u0300-\u036f]/g;
    return function (str) {
      return normalizeNFD(str).replace(regex, '');
    };
  }
}();