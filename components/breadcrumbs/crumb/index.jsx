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
import { createStyles, makeStyles } from "@material-ui/styles";
import PropTypes from "prop-types";
import { useBem } from "@solid/lit-prism-patterns";
import Link from "next/link";
import clsx from "clsx";
import styles from "../styles";

const useStyles = makeStyles((theme) => createStyles(styles(theme)));

export default function Crumb({ crumb, isLink }) {
  const bem = useBem(useStyles());
  return (
    <li key={crumb.uri} className={bem("breadcrumb__crumb")}>
      <i
        className={clsx(
          bem("icon-caret-left"),
          bem("breadcrumb__caret", "small")
        )}
      />
      {isLink ? (
        <Link href="/resource/[iri]" as={crumb.uri}>
          <a className={bem("breadcrumb__link")}>
            <span className={bem("breadcrumb__prefix")}>Back to </span>
            {crumb.label}
          </a>
        </Link>
      ) : (
        crumb.label
      )}
      <i
        className={clsx(
          bem("icon-caret-right"),
          bem("breadcrumb__caret", "large")
        )}
      />
    </li>
  );
}

Crumb.defaultProps = {
  crumb: {},
};

Crumb.propTypes = {
  crumb: PropTypes.shape({ uri: PropTypes.string, label: PropTypes.string }),
  isLink: PropTypes.bool.isRequired,
};
