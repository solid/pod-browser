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
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { Tabs, Tab, createStyles } from "@material-ui/core";

import styles from "./styles";

export const TESTCAFE_ID_TAB = "agent-table-tabs";
export const TESTCAFE_ID_TAB_ALL = "agent-table-tabs-all";
export const TESTCAFE_ID_TAB_PEOPLE = "agent-table-tabs-people";
export const TESTCAFE_ID_TAB_GROUPS = "agent-table-tabs-groups";

const tabs = [
  {
    label: "All",
    testid: TESTCAFE_ID_TAB_ALL,
  },
  {
    label: "People",
    testid: TESTCAFE_ID_TAB_PEOPLE,
  },
  {
    label: "Groups",
    testid: TESTCAFE_ID_TAB_GROUPS,
  },
];

export default function AgentsTableTabs({
  handleTabChange,
  selectedTabValue,
  className,
  tabsValues,
}) {
  const useStyles = makeStyles((theme) => createStyles(styles(theme)));

  const classes = useStyles();

  return (
    <div
      className={clsx(classes.tabsContainer, className)}
      data-testid={TESTCAFE_ID_TAB}
    >
      <Tabs
        classes={{ indicator: classes.indicator }}
        value={selectedTabValue}
        onChange={handleTabChange}
        aria-label="Permissions Filter tabs"
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
            value={tabsValues[tab.label.toLowerCase()]}
          />
        ))}
      </Tabs>
    </div>
  );
}

AgentsTableTabs.propTypes = {
  handleTabChange: PropTypes.func.isRequired,
  selectedTabValue: PropTypes.oneOfType([PropTypes.shape(), PropTypes.string])
    .isRequired,
  tabsValues: PropTypes.shape().isRequired,
  className: PropTypes.string,
};

AgentsTableTabs.defaultProps = {
  className: null,
};
