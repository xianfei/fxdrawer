"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getExtensionForMimeType = exports.getMediaMime = exports.isUnspecific = exports.guessMimeTypes = exports.clearTextMimes = exports.registerTextMime = exports.MIME_UNKNOWN = exports.MIME_BINARY = exports.MIME_TEXT = void 0;

const path_1 = require("./path");

const strings_1 = require("./strings");

const glob_1 = require("./glob");

const network_1 = require("./network");

const resources_1 = require("./resources");

exports.MIME_TEXT = 'text/plain';
exports.MIME_BINARY = 'application/octet-stream';
exports.MIME_UNKNOWN = 'application/unknown';
let registeredAssociations = [];
let nonUserRegisteredAssociations = [];
let userRegisteredAssociations = [];
/**
 * Associate a text mime to the registry.
 */

function registerTextMime(association, warnOnOverwrite = false) {
  // Register
  const associationItem = toTextMimeAssociationItem(association);
  registeredAssociations.push(associationItem);

  if (!associationItem.userConfigured) {
    nonUserRegisteredAssociations.push(associationItem);
  } else {
    userRegisteredAssociations.push(associationItem);
  } // Check for conflicts unless this is a user configured association


  if (warnOnOverwrite && !associationItem.userConfigured) {
    registeredAssociations.forEach(a => {
      if (a.mime === associationItem.mime || a.userConfigured) {
        return; // same mime or userConfigured is ok
      }

      if (associationItem.extension && a.extension === associationItem.extension) {
        console.warn(`Overwriting extension <<${associationItem.extension}>> to now point to mime <<${associationItem.mime}>>`);
      }

      if (associationItem.filename && a.filename === associationItem.filename) {
        console.warn(`Overwriting filename <<${associationItem.filename}>> to now point to mime <<${associationItem.mime}>>`);
      }

      if (associationItem.filepattern && a.filepattern === associationItem.filepattern) {
        console.warn(`Overwriting filepattern <<${associationItem.filepattern}>> to now point to mime <<${associationItem.mime}>>`);
      }

      if (associationItem.firstline && a.firstline === associationItem.firstline) {
        console.warn(`Overwriting firstline <<${associationItem.firstline}>> to now point to mime <<${associationItem.mime}>>`);
      }
    });
  }
}

exports.registerTextMime = registerTextMime;

function toTextMimeAssociationItem(association) {
  return {
    id: association.id,
    mime: association.mime,
    filename: association.filename,
    extension: association.extension,
    filepattern: association.filepattern,
    firstline: association.firstline,
    userConfigured: association.userConfigured,
    filenameLowercase: association.filename ? association.filename.toLowerCase() : undefined,
    extensionLowercase: association.extension ? association.extension.toLowerCase() : undefined,
    filepatternLowercase: association.filepattern ? association.filepattern.toLowerCase() : undefined,
    filepatternOnPath: association.filepattern ? association.filepattern.indexOf(path_1.posix.sep) >= 0 : false
  };
}
/**
 * Clear text mimes from the registry.
 */


function clearTextMimes(onlyUserConfigured) {
  if (!onlyUserConfigured) {
    registeredAssociations = [];
    nonUserRegisteredAssociations = [];
    userRegisteredAssociations = [];
  } else {
    registeredAssociations = registeredAssociations.filter(a => !a.userConfigured);
    userRegisteredAssociations = [];
  }
}

exports.clearTextMimes = clearTextMimes;
/**
 * Given a file, return the best matching mime type for it
 */

function guessMimeTypes(resource, firstLine) {
  let path;

  if (resource) {
    switch (resource.scheme) {
      case network_1.Schemas.file:
        path = resource.fsPath;
        break;

      case network_1.Schemas.data:
        const metadata = resources_1.DataUri.parseMetaData(resource);
        path = metadata.get(resources_1.DataUri.META_DATA_LABEL);
        break;

      default:
        path = resource.path;
    }
  }

  if (!path) {
    return [exports.MIME_UNKNOWN];
  }

  path = path.toLowerCase();
  const filename = path_1.basename(path); // 1.) User configured mappings have highest priority

  const configuredMime = guessMimeTypeByPath(path, filename, userRegisteredAssociations);

  if (configuredMime) {
    return [configuredMime, exports.MIME_TEXT];
  } // 2.) Registered mappings have middle priority


  const registeredMime = guessMimeTypeByPath(path, filename, nonUserRegisteredAssociations);

  if (registeredMime) {
    return [registeredMime, exports.MIME_TEXT];
  } // 3.) Firstline has lowest priority


  if (firstLine) {
    const firstlineMime = guessMimeTypeByFirstline(firstLine);

    if (firstlineMime) {
      return [firstlineMime, exports.MIME_TEXT];
    }
  }

  return [exports.MIME_UNKNOWN];
}

exports.guessMimeTypes = guessMimeTypes;

function guessMimeTypeByPath(path, filename, associations) {
  let filenameMatch = null;
  let patternMatch = null;
  let extensionMatch = null; // We want to prioritize associations based on the order they are registered so that the last registered
  // association wins over all other. This is for https://github.com/microsoft/vscode/issues/20074

  for (let i = associations.length - 1; i >= 0; i--) {
    const association = associations[i]; // First exact name match

    if (filename === association.filenameLowercase) {
      filenameMatch = association;
      break; // take it!
    } // Longest pattern match


    if (association.filepattern) {
      if (!patternMatch || association.filepattern.length > patternMatch.filepattern.length) {
        const target = association.filepatternOnPath ? path : filename; // match on full path if pattern contains path separator

        if (glob_1.match(association.filepatternLowercase, target)) {
          patternMatch = association;
        }
      }
    } // Longest extension match


    if (association.extension) {
      if (!extensionMatch || association.extension.length > extensionMatch.extension.length) {
        if (filename.endsWith(association.extensionLowercase)) {
          extensionMatch = association;
        }
      }
    }
  } // 1.) Exact name match has second highest prio


  if (filenameMatch) {
    return filenameMatch.mime;
  } // 2.) Match on pattern


  if (patternMatch) {
    return patternMatch.mime;
  } // 3.) Match on extension comes next


  if (extensionMatch) {
    return extensionMatch.mime;
  }

  return null;
}

function guessMimeTypeByFirstline(firstLine) {
  if (strings_1.startsWithUTF8BOM(firstLine)) {
    firstLine = firstLine.substr(1);
  }

  if (firstLine.length > 0) {
    // We want to prioritize associations based on the order they are registered so that the last registered
    // association wins over all other. This is for https://github.com/microsoft/vscode/issues/20074
    for (let i = registeredAssociations.length - 1; i >= 0; i--) {
      const association = registeredAssociations[i];

      if (!association.firstline) {
        continue;
      }

      const matches = firstLine.match(association.firstline);

      if (matches && matches.length > 0) {
        return association.mime;
      }
    }
  }

  return null;
}

function isUnspecific(mime) {
  if (!mime) {
    return true;
  }

  if (typeof mime === 'string') {
    return mime === exports.MIME_BINARY || mime === exports.MIME_TEXT || mime === exports.MIME_UNKNOWN;
  }

  return mime.length === 1 && isUnspecific(mime[0]);
}

exports.isUnspecific = isUnspecific; // Known media mimes that we can handle

const mapExtToMediaMimes = {
  '.aac': 'audio/x-aac',
  '.avi': 'video/x-msvideo',
  '.bmp': 'image/bmp',
  '.flv': 'video/x-flv',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.jpe': 'image/jpg',
  '.jpeg': 'image/jpg',
  '.jpg': 'image/jpg',
  '.m1v': 'video/mpeg',
  '.m2a': 'audio/mpeg',
  '.m2v': 'video/mpeg',
  '.m3a': 'audio/mpeg',
  '.mid': 'audio/midi',
  '.midi': 'audio/midi',
  '.mk3d': 'video/x-matroska',
  '.mks': 'video/x-matroska',
  '.mkv': 'video/x-matroska',
  '.mov': 'video/quicktime',
  '.movie': 'video/x-sgi-movie',
  '.mp2': 'audio/mpeg',
  '.mp2a': 'audio/mpeg',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.mp4a': 'audio/mp4',
  '.mp4v': 'video/mp4',
  '.mpe': 'video/mpeg',
  '.mpeg': 'video/mpeg',
  '.mpg': 'video/mpeg',
  '.mpg4': 'video/mp4',
  '.mpga': 'audio/mpeg',
  '.oga': 'audio/ogg',
  '.ogg': 'audio/ogg',
  '.ogv': 'video/ogg',
  '.png': 'image/png',
  '.psd': 'image/vnd.adobe.photoshop',
  '.qt': 'video/quicktime',
  '.spx': 'audio/ogg',
  '.svg': 'image/svg+xml',
  '.tga': 'image/x-tga',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.wav': 'audio/x-wav',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.wma': 'audio/x-ms-wma',
  '.wmv': 'video/x-ms-wmv',
  '.woff': 'application/font-woff'
};

function getMediaMime(path) {
  const ext = path_1.extname(path);
  return mapExtToMediaMimes[ext.toLowerCase()];
}

exports.getMediaMime = getMediaMime;

function getExtensionForMimeType(mimeType) {
  for (const extension in mapExtToMediaMimes) {
    if (mapExtToMediaMimes[extension] === mimeType) {
      return extension;
    }
  }

  return undefined;
}

exports.getExtensionForMimeType = getExtensionForMimeType;