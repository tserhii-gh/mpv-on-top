/*
 * GNOME Shell Extension: MPV on top
 * Developer: tserhii-gh
 */

import Meta from 'gi://Meta';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

export default class MpvOnTop extends Extension
{
  enable()
  {
    this._lastWorkspace = null;
    this._windowAddedId = 0;
    this._windowRemovedId = 0;
    this._switchWorkspaceId = global.window_manager.connect_after(
      'switch-workspace', this._onSwitchWorkspace.bind(this));
    this._onSwitchWorkspace();
  }

  disable()
  {
    global.window_manager.disconnect(this._switchWorkspaceId);

    if (this._lastWorkspace) {
      this._lastWorkspace.disconnect(this._windowAddedId);
      this._lastWorkspace.disconnect(this._windowRemovedId);
    }

    this._lastWorkspace = null;
    this._switchWorkspaceId = 0;
    this._windowAddedId = 0;
    this._windowRemovedId = 0;

    let actors = global.get_window_actors();
    if (actors) {
      for (let actor of actors) {
        let window = actor.meta_window;
        if (!window) continue;

        if (window._isMpv) {
          if (window.above)
            window.unmake_above();
        }

        this._onWindowRemoved(null, window);
      }
    }
  }

  _onSwitchWorkspace()
  {
    let workspace = global.workspace_manager.get_active_workspace();
    let wsWindows = global.display.get_tab_list(Meta.TabList.NORMAL, workspace);

    if (this._lastWorkspace) {
      this._lastWorkspace.disconnect(this._windowAddedId);
      this._lastWorkspace.disconnect(this._windowRemovedId);
    }

    this._lastWorkspace = workspace;
    this._windowAddedId = this._lastWorkspace.connect(
      'window-added', this._onWindowAdded.bind(this));
    this._windowRemovedId = this._lastWorkspace.connect(
      'window-removed', this._onWindowRemoved.bind(this));

    /* Update state on already present windows */
    if (wsWindows) {
      for (let window of wsWindows)
        this._onWindowAdded(workspace, window);
    }
  }

  _onWindowAdded(workspace, window)
  {
    if (!window._notifyMpvTitleId) {
      window._notifyMpvTitleId = window.connect_after(
        'notify::title', this._checkTitle.bind(this));
    }
    this._checkTitle(window);
  }

  _onWindowRemoved(workspace, window)
  {
    if (window._notifyMpvTitleId) {
      window.disconnect(window._notifyMpvTitleId);
      window._notifyMpvTitleId = null;
    }
    if (window._isMpv)
      window._isMpv = null;
  }

  _checkTitle(window)
  {
    if (!window.title)
      return;
      let un = (window.wm_class == 'mpv') ? '' : 'un';
      window._isMpv = true;
      window[`${un}make_above`]();
  }
}
