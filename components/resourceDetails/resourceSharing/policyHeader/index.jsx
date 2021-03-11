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

/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/jsx-one-expression-per-line */

import React from "react";
import PropTypes from "prop-types";
import { useBem } from "@solid/lit-prism-patterns";
import clsx from "clsx";
import { createStyles } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { POLICIES_TYPE_MAP } from "../../../../constants/policies";

import styles from "./styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function PolicyHeader({ children, type, isPolicyList }) {
  const bem = useBem(useStyles());

  const classes = useStyles();

  const {
    titlePlural,
    titleSingular,
    icon,
    iconClassName,
    DescriptionComponent,
  } = POLICIES_TYPE_MAP[type];

  return (
    <div className={classes.headerContainer}>
      <i className={clsx(bem(icon), bem("icon"), bem(iconClassName))} />
      <div className={classes.textContainer}>
        <div className={classes.titleAndButtonContainer}>
          <p className={classes.title}>
            {isPolicyList ? titlePlural : titleSingular}
          </p>
          {children}
        </div>
        <span className={classes.description}>
          <DescriptionComponent />
        </span>
      </div>
    </div>
  );
}

PolicyHeader.propTypes = {
  type: PropTypes.string.isRequired,
  isPolicyList: PropTypes.bool,
  children: PropTypes.node,
};

PolicyHeader.defaultProps = {
  isPolicyList: false,
  children: null,
};
