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
import { render } from "@testing-library/react";
import T from "prop-types";
import { StylesProvider, ThemeProvider } from "@inrupt/prism-react-components";
import { FeatureProvider } from "../src/contexts/featureFlagsContext";
import defaultTheme from "../src/theme";

export default function WithTheme(props) {
  const { theme, children } = props;
  return (
    <StylesProvider generateClassName={(rule) => `PodBrowser-${rule.key}`}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </StylesProvider>
  );
}

WithTheme.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  theme: T.object,
  children: T.node.isRequired,
};

WithTheme.defaultProps = {
  theme: defaultTheme,
};

export const renderWithTheme = (children, theme = defaultTheme) => {
  return render(
    <FeatureProvider>
      <WithTheme theme={theme}>{children}</WithTheme>
    </FeatureProvider>
  );
};
