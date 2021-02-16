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

/* eslint-disable react/forbid-prop-types */

import React from "react";

export const ViewersDescription = () => (
  <p>
    <b>Can </b>
    view but
    <b> cannot </b>
    edit or delete this resource
  </p>
);

export const EditorsDescription = () => (
  <p>
    <b>Can </b>
    view, edit and delete this resource
  </p>
);

export const BlockedDescription = () => (
  <p>
    <b>Cannot </b>
    view this resource
  </p>
);

export const ViewAndAddDescription = () => (
  <p>
    <b>Can </b>
    view and add new content but
    <b> cannot </b>
    edit or delete existing content
  </p>
);

export const EditOnlyDescription = () => (
  <p>
    <b>Can </b>
    edit existing content but
    <b> cannot </b>
    view or delete existing content
  </p>
);

export const AddOnlyDescription = () => (
  <p>
    <b>Can </b>
    add new content but
    <b> cannot </b>
    view, edit or delete existing content
  </p>
);
