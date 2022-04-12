/**
 * Copyright 2020 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* eslint-disable react/jsx-filename-extension */

import {
  AddOnlyDescription,
  BlockedDescription,
  EditOnlyDescription,
  EditorsDescription,
  ViewAndAddDescription,
  ViewersDescription,
} from "../components/resourceDetails/resourceSharing/policiesDescriptions";

// Constants used for policies UI

// TODO: move these colors to Prism

const EDITORS_ICON_COLOR = "#4CAF50";
const EDITORS_ICON_BACKGROUND_COLOR = "#EDF7ED";
const VIEWERS_ICON_COLOR = "#2196F3";
const VIEWERS_ICON_BACKGROUND_COLOR = "#E8F4FD";
const BLOCKED_ICON_COLOR = "#F44336";
const BLOCKED_ICON_BACKGROUND_COLOR = "#FDECEA";
const SETTINGS_ICON_COLOR = "#404040";
const SETTINGS_BACKGROUND_COLOR = "#F5F5F5";

const customPolicyVariables = {
  header: "Advanced Sharing",
  title: "Advanced Sharing",
  editText: "Edit",
  saveText: "Save Sharing",
  icon: "icon-settings",
  iconColor: SETTINGS_ICON_COLOR,
  iconBackgroundColor: SETTINGS_BACKGROUND_COLOR,
  iconClassName: "iconSettings",
  titlePlural: "Advanced sharing",
  titleSingular: "Advanced Sharing",
  emptyStateText: "",
};

export const ACP_TYPE_MAP = {
  write: {
    name: "Edit",
    icon: "editor",
    description: "Can change, download or delete this resource",
  },
  read: {
    name: "View",
    icon: "view",
    description: "Can see this resource",
  },
  append: {
    name: "Add",
    icon: "add",
    description: "Can upload to this resource",
  },
  control: {
    name: "Share",
    icon: "user",
    description: "Can share this resource with others",
  },
  accessToAcr: {
    name: "View Sharing",
    icon: "users",
    description: "Can see who else has access to this resource",
  },
};

// eslint-disable-next-line import/prefer-default-export
export const POLICIES_TYPE_MAP = {
  custom: customPolicyVariables,
  editors: {
    name: "editors",
    header: "Edit Editors",
    title: "Editors",
    editText: "Edit Editors",
    saveText: "Save Editors",
    icon: "icon-editor",
    iconName: "edit",
    iconColor: EDITORS_ICON_COLOR,
    iconBackgroundColor: EDITORS_ICON_BACKGROUND_COLOR,
    iconClassName: "iconEditor",
    titlePlural: "Editors",
    titleSingular: "Editor",
    titleAccessGrant: "wants to create, edit, or delete",
    emptyStateText: "No editors",
    removeButtonLabel: "Remove Editors",
    DescriptionComponent: EditorsDescription,
  },
  viewers: {
    name: "viewers",
    header: "Edit Viewers",
    title: "Viewers",
    editText: "Edit Viewers",
    saveText: "Save Viewers",
    icon: "icon-view",
    iconName: "view",
    iconColor: VIEWERS_ICON_COLOR,
    iconBackgroundColor: VIEWERS_ICON_BACKGROUND_COLOR,
    iconClassName: "iconViewer",
    titlePlural: "Viewers",
    titleSingular: "Viewer",
    titleAccessGrant: "wants to see",
    emptyStateText: "No viewers",
    removeButtonLabel: "Remove Viewers",
    DescriptionComponent: ViewersDescription,
  },
  blocked: {
    name: "blocked",
    header: "Edit Blocked",
    title: "Blocked",
    editText: "Edit Blocked",
    saveText: "Save Blocked",
    icon: "icon-block",
    iconColor: BLOCKED_ICON_COLOR,
    iconBackgroundColor: BLOCKED_ICON_BACKGROUND_COLOR,
    iconClassName: "iconBlocked",
    titlePlural: "Blocked",
    titleSingular: "Blocked",
    emptyStateText: "No one is blocked",
    removeButtonLabel: "Remove Blocked",
    DescriptionComponent: BlockedDescription,
  },
  viewAndAdd: {
    ...customPolicyVariables,
    name: "viewAndAdd",
    title: "View & Add",
    titlePlural: "View & Add",
    titleSingular: "View & Add",
    titleAccessGrant: "wants to view and add",
    removeButtonLabel: "Remove View & Add",
    DescriptionComponent: ViewAndAddDescription,
  },
  editOnly: {
    ...customPolicyVariables,
    name: "editOnly",
    title: "Edit Only",
    titlePlural: "Edit Only",
    titleSingular: "Edit Only",
    titleAccessGrant: "wants to edit",
    iconName: "edit",
    removeButtonLabel: "Remove Edit Only",
    DescriptionComponent: EditOnlyDescription,
  },
  addOnly: {
    ...customPolicyVariables,
    name: "addOnly",
    title: "Add Only",
    titlePlural: "Add Only",
    titleSingular: "Add Only",
    titleAccessGrant: "wants to add to",
    iconName: "folder",
    removeButtonLabel: "Remove Add Only",
    DescriptionComponent: AddOnlyDescription,
  },
};

const { editors, viewers, blocked, viewAndAdd, editOnly, addOnly } =
  POLICIES_TYPE_MAP;

export const customPolicies = [viewAndAdd, editOnly, addOnly];

// TODO: add blocked to this list once we have deny policies
export const namedPolicies = [editors, viewers];
