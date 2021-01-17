"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SelectActionViewItem = exports.ActionViewItem = exports.BaseActionViewItem = void 0;

require("../../../../css!./actionbar");

const platform = require("../../../common/platform");

const nls = require("../../../../nls");

const lifecycle_1 = require("../../../common/lifecycle");

const selectBox_1 = require("../selectBox/selectBox");

const actions_1 = require("../../../common/actions");

const types = require("../../../common/types");

const touch_1 = require("../../touch");

const dnd_1 = require("../../dnd");

const browser_1 = require("../../browser");

const dom_1 = require("../../dom");

class BaseActionViewItem extends lifecycle_1.Disposable {
  constructor(context, action, options = {}) {
    super();
    this.options = options;
    this._context = context || this;
    this._action = action;

    if (action instanceof actions_1.Action) {
      this._register(action.onDidChange(event => {
        if (!this.element) {
          // we have not been rendered yet, so there
          // is no point in updating the UI
          return;
        }

        this.handleActionChangeEvent(event);
      }));
    }
  }

  handleActionChangeEvent(event) {
    if (event.enabled !== undefined) {
      this.updateEnabled();
    }

    if (event.checked !== undefined) {
      this.updateChecked();
    }

    if (event.class !== undefined) {
      this.updateClass();
    }

    if (event.label !== undefined) {
      this.updateLabel();
      this.updateTooltip();
    }

    if (event.tooltip !== undefined) {
      this.updateTooltip();
    }
  }

  get actionRunner() {
    if (!this._actionRunner) {
      this._actionRunner = this._register(new actions_1.ActionRunner());
    }

    return this._actionRunner;
  }

  set actionRunner(actionRunner) {
    this._actionRunner = actionRunner;
  }

  getAction() {
    return this._action;
  }

  isEnabled() {
    return this._action.enabled;
  }

  setActionContext(newContext) {
    this._context = newContext;
  }

  render(container) {
    const element = this.element = container;

    this._register(touch_1.Gesture.addTarget(container));

    const enableDragging = this.options && this.options.draggable;

    if (enableDragging) {
      container.draggable = true;

      if (browser_1.isFirefox) {
        // Firefox: requires to set a text data transfer to get going
        this._register(dom_1.addDisposableListener(container, dom_1.EventType.DRAG_START, e => {
          var _a;

          return (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData(dnd_1.DataTransfers.TEXT, this._action.label);
        }));
      }
    }

    this._register(dom_1.addDisposableListener(element, touch_1.EventType.Tap, e => this.onClick(e)));

    this._register(dom_1.addDisposableListener(element, dom_1.EventType.MOUSE_DOWN, e => {
      if (!enableDragging) {
        dom_1.EventHelper.stop(e, true); // do not run when dragging is on because that would disable it
      }

      if (this._action.enabled && e.button === 0) {
        element.classList.add('active');
      }
    }));

    if (platform.isMacintosh) {
      // macOS: allow to trigger the button when holding Ctrl+key and pressing the
      // main mouse button. This is for scenarios where e.g. some interaction forces
      // the Ctrl+key to be pressed and hold but the user still wants to interact
      // with the actions (for example quick access in quick navigation mode).
      this._register(dom_1.addDisposableListener(element, dom_1.EventType.CONTEXT_MENU, e => {
        if (e.button === 0 && e.ctrlKey === true) {
          this.onClick(e);
        }
      }));
    }

    this._register(dom_1.addDisposableListener(element, dom_1.EventType.CLICK, e => {
      dom_1.EventHelper.stop(e, true); // menus do not use the click event

      if (!(this.options && this.options.isMenu)) {
        platform.setImmediate(() => this.onClick(e));
      }
    }));

    this._register(dom_1.addDisposableListener(element, dom_1.EventType.DBLCLICK, e => {
      dom_1.EventHelper.stop(e, true);
    }));

    [dom_1.EventType.MOUSE_UP, dom_1.EventType.MOUSE_OUT].forEach(event => {
      this._register(dom_1.addDisposableListener(element, event, e => {
        dom_1.EventHelper.stop(e);
        element.classList.remove('active');
      }));
    });
  }

  onClick(event) {
    var _a;

    dom_1.EventHelper.stop(event, true);
    const context = types.isUndefinedOrNull(this._context) ? ((_a = this.options) === null || _a === void 0 ? void 0 : _a.useEventAsContext) ? event : undefined : this._context;
    this.actionRunner.run(this._action, context);
  }

  focus() {
    if (this.element) {
      this.element.focus();
      this.element.classList.add('focused');
    }
  }

  blur() {
    if (this.element) {
      this.element.blur();
      this.element.classList.remove('focused');
    }
  }

  updateEnabled() {// implement in subclass
  }

  updateLabel() {// implement in subclass
  }

  updateTooltip() {// implement in subclass
  }

  updateClass() {// implement in subclass
  }

  updateChecked() {// implement in subclass
  }

  dispose() {
    if (this.element) {
      this.element.remove();
      this.element = undefined;
    }

    super.dispose();
  }

}

exports.BaseActionViewItem = BaseActionViewItem;

class ActionViewItem extends BaseActionViewItem {
  constructor(context, action, options = {}) {
    super(context, action, options);
    this.options = options;
    this.options.icon = options.icon !== undefined ? options.icon : false;
    this.options.label = options.label !== undefined ? options.label : true;
    this.cssClass = '';
  }

  render(container) {
    super.render(container);

    if (this.element) {
      this.label = dom_1.append(this.element, dom_1.$('a.action-label'));
    }

    if (this.label) {
      if (this._action.id === actions_1.Separator.ID) {
        this.label.setAttribute('role', 'presentation'); // A separator is a presentation item
      } else {
        if (this.options.isMenu) {
          this.label.setAttribute('role', 'menuitem');
        } else {
          this.label.setAttribute('role', 'button');
        }
      }
    }

    if (this.options.label && this.options.keybinding && this.element) {
      dom_1.append(this.element, dom_1.$('span.keybinding')).textContent = this.options.keybinding;
    }

    this.updateClass();
    this.updateLabel();
    this.updateTooltip();
    this.updateEnabled();
    this.updateChecked();
  }

  focus() {
    super.focus();

    if (this.label) {
      this.label.focus();
    }
  }

  updateLabel() {
    if (this.options.label && this.label) {
      this.label.textContent = this.getAction().label;
    }
  }

  updateTooltip() {
    let title = null;

    if (this.getAction().tooltip) {
      title = this.getAction().tooltip;
    } else if (!this.options.label && this.getAction().label && this.options.icon) {
      title = this.getAction().label;

      if (this.options.keybinding) {
        title = nls.localize({
          key: 'titleLabel',
          comment: ['action title', 'action keybinding']
        }, "{0} ({1})", title, this.options.keybinding);
      }
    }

    if (title && this.label) {
      this.label.title = title;
    }
  }

  updateClass() {
    if (this.cssClass && this.label) {
      this.label.classList.remove(...this.cssClass.split(' '));
    }

    if (this.options.icon) {
      this.cssClass = this.getAction().class;

      if (this.label) {
        this.label.classList.add('codicon');

        if (this.cssClass) {
          this.label.classList.add(...this.cssClass.split(' '));
        }
      }

      this.updateEnabled();
    } else {
      if (this.label) {
        this.label.classList.remove('codicon');
      }
    }
  }

  updateEnabled() {
    if (this.getAction().enabled) {
      if (this.label) {
        this.label.removeAttribute('aria-disabled');
        this.label.classList.remove('disabled');
        this.label.tabIndex = 0;
      }

      if (this.element) {
        this.element.classList.remove('disabled');
      }
    } else {
      if (this.label) {
        this.label.setAttribute('aria-disabled', 'true');
        this.label.classList.add('disabled');
        dom_1.removeTabIndexAndUpdateFocus(this.label);
      }

      if (this.element) {
        this.element.classList.add('disabled');
      }
    }
  }

  updateChecked() {
    if (this.label) {
      if (this.getAction().checked) {
        this.label.classList.add('checked');
      } else {
        this.label.classList.remove('checked');
      }
    }
  }

}

exports.ActionViewItem = ActionViewItem;

class SelectActionViewItem extends BaseActionViewItem {
  constructor(ctx, action, options, selected, contextViewProvider, selectBoxOptions) {
    super(ctx, action);
    this.selectBox = new selectBox_1.SelectBox(options, selected, contextViewProvider, undefined, selectBoxOptions);

    this._register(this.selectBox);

    this.registerListeners();
  }

  setOptions(options, selected) {
    this.selectBox.setOptions(options, selected);
  }

  select(index) {
    this.selectBox.select(index);
  }

  registerListeners() {
    this._register(this.selectBox.onDidSelect(e => {
      this.actionRunner.run(this._action, this.getActionContext(e.selected, e.index));
    }));
  }

  getActionContext(option, index) {
    return option;
  }

  focus() {
    if (this.selectBox) {
      this.selectBox.focus();
    }
  }

  blur() {
    if (this.selectBox) {
      this.selectBox.blur();
    }
  }

  render(container) {
    this.selectBox.render(container);
  }

}

exports.SelectActionViewItem = SelectActionViewItem;