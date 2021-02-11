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

import React from "react";
import PropTypes from "prop-types";
import { createStyles, Switch } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));
const TESTCAFE_ID_CAN_SHARE_TOGGLE = "can-share-toggle";

export default function CanShareToggleSwitch({ canShare, toggleShare }) {
  const classes = useStyles();

  return (
    <Switch
      edge="end"
      data-testid={TESTCAFE_ID_CAN_SHARE_TOGGLE}
      classes={{
        root: classes.switchRoot,
        switchBase: classes.switchBase,
        checked: classes.switchChecked,
        track: classes.switchTrack,
        thumb: classes.switchThumb,
      }}
      checked={canShare}
      onChange={toggleShare}
      inputProps={{ "aria-label": "Can Share Toggle" }}
    />
  );
}

CanShareToggleSwitch.propTypes = {
  canShare: PropTypes.bool,
  toggleShare: PropTypes.func.isRequired,
};

CanShareToggleSwitch.defaultProps = {
  canShare: false,
};
