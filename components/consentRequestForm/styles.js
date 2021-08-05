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

export default function styles(theme) {
  return {
    "request-container": {
      flexGrow: 1,
      flexDirection: "column",
      margin: theme.spacing(1, 0),
      alignItems: "center",
      display: "flex",
      gap: "1rem",
    },
    "request-container__content": {
      border: "solid 1px",
      borderColor: theme.palette.grey["200"],
      borderRadius: 8,
      boxShadow: "0 4px 12px 1px rgba(208,208,208,0.22)",
      display: "block",
      padding: theme.spacing(2.4),
      width: "100%",
      maxWidth: 600,
      minHeight: 50,
    },

    "request-container__section": {
      padding: 0,
      border: 0,
      width: "100%",
      borderRadius: 4,
      display: "flex",
      flexGrow: 1,
      margin: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "1rem",
    },

    "request-container__section--box": {
      width: "100%",
      border: "solid 1px",
      borderColor: theme.palette.grey["200"],
      padding: theme.spacing(0.6, 1.2, 0.6, 1.2),
    },

    box__content: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      fontWeight: "normal",
      marginLeft: 0,
      paddingLeft: "1rem",
      boxSizing: "border-box",
    },

    "request-container__section-header": {
      display: "flex",
    },

    "request-container__button--small": {
      fontSize: "0.8rem",
      textTransform: "capitalize",
      padding: theme.spacing(0.6),
      whiteSpace: "nowrap",
    },

    "request-container__header-text": {
      display: "flex",
      flexDirection: "row",
      alignItems: "baseline",
      fontSize: "1.4rem",
      margin: 0,
      width: "100%",
    },

    header__content: {
      flexGrow: 1,
    },

    "request-container__header-text--small": {
      fontSize: "0.8125rem",
      fontFamily: theme.typography.body2.fontFamily,
    },

    "request-container__header-text--center": {
      textAlign: "center",
    },

    "icon-small": {
      ...theme.icons.iconColor(theme.palette.info.main),
      fontSize: "1rem",
      marginRight: "0.5rem",
    },

    "icon-small--primary": {
      color: theme.palette.primary.main,
    },

    "icon-small--padded": {
      marginLeft: "0.5rem",
    },

    "dropdown-caret": {
      border: "none",
      background: "transparent",
      cursor: "pointer",
    },

    "full-width": {
      display: "block",
      width: "100%",
    },

    "full-width--padded-left": {
      paddingLeft: "1.5rem",
    },

    form__controls: {
      display: "flex",
      justifyContent: "space-between",
      [theme.breakpoints.down("md")]: {
        flexDirection: "column-reverse",
      },
    },

    heading__uppercase: {
      textTransform: "uppercase",
      marginBottom: theme.spacing(1),
    },

    footer__links: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: theme.spacing(2),
    },

    avatar: {
      textAlign: "center",
      width: "30px",
      height: "30px",
      padding: theme.spacing(1),
      borderRadius: "50%",
      marginRight: theme.spacing(0.4),
      fontSize: theme.typography.h6.fontSize,
      color: theme.palette.primary.main,
      backgroundColor: "#F1EDFF",
      display: "inline-block",
      position: "relative",
      left: 0,
      top: 0,
    },
  };
}
