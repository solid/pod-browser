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

/* eslint react/jsx-props-no-spreading:off, react/forbid-prop-types:off */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Checkbox } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";
import useContactFull from "../../../src/hooks/useContactFull";
import { UNREGISTERED_CONTACT } from "../../../src/models/contact/unregistered";

export const TESTCAFE_ID_WEBID_CHECKBOX = "webid-checkbox";

export default function MemberCheckbox({
  selected,
  disabled,
  onChange,
  ...props
}) {
  const { data: contactFull, isValidating } = useContactFull({
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });
  const value = contactFull?.type?.getOriginalUrl(contactFull);
  const [checked, setChecked] = useState(
    contactFull?.type === UNREGISTERED_CONTACT || selected[value] !== undefined
  );

  if (isValidating) return <Skeleton variant="rect" width={28} height={28} />;

  const handleChange = (event) => {
    setChecked(event.target.checked);
    onChange(event, contactFull);
  };

  return (
    <Checkbox
      inputProps={{ "data-testid": TESTCAFE_ID_WEBID_CHECKBOX }}
      type="checkbox"
      color="primary"
      size="medium"
      value={value}
      checked={checked}
      disabled={disabled.includes(value)}
      onChange={handleChange}
      {...props}
    />
  );
}

MemberCheckbox.propTypes = {
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.object.isRequired,
  disabled: PropTypes.arrayOf(PropTypes.string),
};

MemberCheckbox.defaultProps = {
  disabled: [],
};
