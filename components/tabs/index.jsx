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
import clsx from "clsx";
import { makeStyles } from "@mui/styles";
import { Tabs as MuiTabs, Tab, createStyles } from "@mui/core";

import styles from "./styles";

export default function Tabs({
  handleTabChange,
  selectedTabValue,
  className,
  tabs,
  children,
}) {
  const useStyles = makeStyles((theme) => createStyles(styles(theme)));
  const classes = useStyles();

  return (
    <div className={clsx(classes.tabsContainer, className)}>
      <MuiTabs
        classes={{ indicator: classes.indicator }}
        value={selectedTabValue}
        onChange={handleTabChange}
        aria-label="Filter tabs"
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.label}
            classes={{
              root: classes.tab,
              selected: classes.selected,
            }}
            label={tab.label}
            data-testid={tab.testid}
            value={tab.value}
          />
        ))}
      </MuiTabs>
      {children}
    </div>
  );
}

Tabs.propTypes = {
  handleTabChange: PropTypes.func.isRequired,
  selectedTabValue: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      testid: PropTypes.string,
      value: PropTypes.string,
    })
  ).isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
};

Tabs.defaultProps = {
  className: null,
  selectedTabValue: null,
  children: null,
};
