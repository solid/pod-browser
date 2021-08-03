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

import React, { useEffect, useState } from "react";
import T from "prop-types";
import { Icons, Button } from "@inrupt/prism-react-components";
import { makeStyles } from "@material-ui/styles";
import {
  createStyles,
  Typography,
  Switch,
  FormGroup,
  FormControl,
  FormControlLabel,
} from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import { buildModeString } from "../../../src/stringHelpers";
import styles from "../styles";

export const TESTCAFE_ID_REQUEST_SELECT_ALL_BUTTON = "request-select-all";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function RequestSection(props) {
  const { agentName, sectionDetails } = props;
  const bem = useBem(useStyles());

  const [requestModes, setRequestModes] = useState([]);

  const [isChecked, setIsChecked] = useState(
    new Array(sectionDetails.forPersonalData.length).fill(false)
  );

  useEffect(() => {
    setRequestModes(buildModeString(sectionDetails.mode, "and").toLowerCase());
  }, [sectionDetails]);

  const toggleAllSwitches = () => {
    const updatedAllCheckedState = isChecked.map(() => true);

    setIsChecked(updatedAllCheckedState);
  };

  const handleOnChange = (position) => {
    const updatedCheckedState = isChecked.map((item, index) =>
      index === position ? !item : item
    );

    setIsChecked(updatedCheckedState);
  };

  return (
    <>
      <FormControl
        component="fieldset"
        className={bem("request-container__section")}
      >
        <legend className={bem("request-container__header-text", "small")}>
          <Icons name="edit" className={bem("icon-small")} />
          <span className={bem("header__content")}>
            {`${agentName} wants to ${requestModes}`}
          </span>
          <Button
            data-testid={TESTCAFE_ID_REQUEST_SELECT_ALL_BUTTON}
            variant="secondary"
            type="button"
            onClick={toggleAllSwitches}
            className={bem("request-container__button", "small")}
          >
            <Typography component="span" variant="caption">
              Select all
            </Typography>
          </Button>
        </legend>
        <FormGroup
          aria-label="position"
          row
          className={bem("request-container__section", "box")}
        >
          {sectionDetails.forPersonalData &&
            sectionDetails.forPersonalData.map((resource, index) => {
              return (
                <FormControlLabel
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  value="start"
                  // eslint-disable-next-line prettier/prettier
                  control={(
                    <Switch
                      checked={isChecked[index]}
                      onChange={() => handleOnChange(index)}
                      color="primary"
                    />
                    // eslint-disable-next-line prettier/prettier
                  )}
                  label={
                    // eslint-disable-next-line react/jsx-wrap-multilines
                    <Typography variant="body2">
                      <Icons name="app" className={bem("icon-small")} />
                      {resource}
                    </Typography>
                  }
                  labelPlacement="start"
                  className={bem("box__content")}
                />
              );
            })}
        </FormGroup>
      </FormControl>
    </>
  );
}

RequestSection.propTypes = {
  agentName: T.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  sectionDetails: T.object.isRequired,
};
