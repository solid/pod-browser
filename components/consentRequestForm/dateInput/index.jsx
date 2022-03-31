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

/* eslint-disable react/jsx-one-expression-per-line */

import React, { useRef, useState } from "react";
import { Button, Icons, useOutsideClick } from "@inrupt/prism-react-components";
import { format } from "date-fns";
import T from "prop-types";
import { DatePicker } from "@material-ui/pickers";
import { makeStyles } from "@material-ui/styles";
import { createStyles, IconButton, InputBase } from "@material-ui/core";
import { useBem } from "@solid/lit-prism-patterns";
import ConsentRequestContext from "../../../src/contexts/consentRequestContext";
import styles from "../styles";

export const TESTCAFE_ID_DATE_INPUT = "date-input-field";
export const TESTCAFE_ID_FOREVER_BUTTON = "forever-button";
export const TESTCAFE_ID_DATE_PICKER_CALENDAR_BUTTON =
  "date-picker-calendar-button";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function DateInput({ selectedDate, handleDateChange }) {
  const classes = useStyles();
  const bem = useBem(classes);
  // FIXME: we will later fetch the expiry date from the consent details
  const clickRef = useRef();

  const [datepickerOpen, setDatepickerOpen] = useState(false);

  useOutsideClick(clickRef, () => setDatepickerOpen(false));

  return (
    <div ref={clickRef} className={bem("date-container")}>
      <InputBase
        classes={{ root: bem("date-input") }}
        onClick={() => setDatepickerOpen(!datepickerOpen)}
        placeholder="Access request expiration date"
        value={
          selectedDate
            ? format(new Date(selectedDate), "MMMM' 'd', 'Y")
            : "Forever"
        }
        inputProps={{
          "data-testid": TESTCAFE_ID_DATE_INPUT,
          "aria-label": "Access request expiration date",
          readOnly: "readonly",
        }}
        endAdornment={
          <Icons
            name="calendar"
            className={bem("icon-small--primary-disabled")}
          />
        }
      />
      {datepickerOpen && (
        <div className={bem("date-picker")}>
          <DatePicker
            disableToolbar
            orientation="portrait"
            variant="static"
            disablePast
            format="MM/dd/yyyy"
            margin="normal"
            value={selectedDate}
            onChange={handleDateChange}
          />
          <Button
            type="button"
            variant="small"
            onClick={() => handleDateChange(null)}
            className={bem("request-container__button", "full-width")}
            data-testid={TESTCAFE_ID_FOREVER_BUTTON}
          >
            Forever
          </Button>
        </div>
      )}
    </div>
  );
}

DateInput.defaultProps = {
  selectedDate: null,
};

DateInput.propTypes = {
  selectedDate: T.instanceOf(Date),
  handleDateChange: T.func.isRequired,
};
