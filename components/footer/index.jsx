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
import T from "prop-types";
import { Footer as PrismFooter } from "@inrupt/prism-react-components";
import { useTheme } from "@material-ui/core";

const TESTCAFE_ID_TOS_LINK = "tos-link";

export default function Footer({ atlassianFeedbackWidth }) {
  const theme = useTheme();
  const links = [
    {
      href: "https://inrupt.com/terms-of-service",
      text: "Terms of Service",
      rel: "noreferrer",
      target: "_blank",
      "data-testid": TESTCAFE_ID_TOS_LINK,
    },
  ];
  const texts = [{ text: "Copyright 2020 Inrupt, inc." }];
  const style = atlassianFeedbackWidth
    ? {
        paddingRight: atlassianFeedbackWidth + theme.spacing(1),
      }
    : {};
  return <PrismFooter texts={texts} links={links} style={style} />;
}

Footer.propTypes = {
  atlassianFeedbackWidth: T.number,
};

Footer.defaultProps = {
  atlassianFeedbackWidth: null,
};
