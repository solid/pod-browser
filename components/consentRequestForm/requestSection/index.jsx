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
import styles from "../styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function RequestSection(props) {
  const { agentName, sectionDetails } = props;
  const bem = useBem(useStyles());

  const [requestModes, setRequestModes] = useState([]);

  const buildModeString = (modeArray, conjunction) => {
    const l = modeArray.length;
    let arrayCopy = modeArray;
    if (l < 2) return arrayCopy[0];
    if (l < 3) return arrayCopy.join(` ${conjunction} `);
    arrayCopy = arrayCopy.slice();
    arrayCopy[l - 1] = `${conjunction} ${arrayCopy[l - 1]}`;
    return arrayCopy.join(", ");
  };

  useEffect(() => {
    if (sectionDetails) {
      setRequestModes(
        buildModeString(sectionDetails.mode, "and ").toLowerCase()
      );
    }
  }, [sectionDetails]);

  return (
    <>
      <FormControl
        component="fieldset"
        className={bem("request-container__section")}
      >
        <legend className={bem("request-container__header-text", "small")}>
          <span>
            <Icons name="edit" className={bem("icon-small")} />
            {`${agentName} wants to ${requestModes}`}
          </span>
          <Button
            variant="secondary"
            type="button"
            className={bem("request-container__button", "small")}
          >
            <Typography component="span" variant="body2">
              Select all
            </Typography>
          </Button>
        </legend>
        <FormGroup
          aria-label="position"
          row
          className={bem("request-container__section", "box")}
        >
          <FormControlLabel
            value="start"
            control={<Switch color="primary" />}
            label={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <Typography variant="body2">
                <Icons name="app" className={bem("icon-small")} />
                Your Pod
              </Typography>
            }
            labelPlacement="start"
            className={bem("box__content")}
          />
        </FormGroup>
      </FormControl>
    </>
  );
}

RequestSection.propTypes = {
  agentName: T.string.isRequired,
  sectionDetails: T.objectOf(T.string).isRequired,
};
