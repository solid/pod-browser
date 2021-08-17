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

    "request-container__button--full-width": {
      display: "flex",
      position: "relative",
      flexGrow: 1,
      margin: "1rem",
      flexDirection: "column",
      alignItems: "center",
      "&:before": {
        display: "block",
        content: '""',
        position: "absolute",
        width: "100%",
        height: 1,
        bottom: "3rem",
        backgroundColor: theme.palette.grey["300"],
      },
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

    "icon-small--dark": {
      ...theme.icons.iconColor("#0D6796"),
    },

    "icon-small--primary": {
      color: theme.palette.primary.main,
      margin: 0,
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
      flexDirection: "column-reverse",
      justifyContent: "space-between",
      [theme.breakpoints.up("sm")]: {
        flexDirection: "row",
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
    "agent-name": {
      display: "flex",
      justifyContent: "center",
    },
    purpose: {
      display: "flex",
      justifyContent: "flex-start",
      padding: "1rem",
    },

    "date-container": {
      display: "flex",
      padding: theme.spacing(0.7, 1.2),
      border: `1px solid ${theme.palette.grey.A100}`,
      borderRadius: 10,
      height: "2.5rem",
      marginBottom: "1rem",
      marginTop: "0.5rem",
      position: "relative",
      maxWidth: 300,
    },

    "date-input": {
      fontSize: "1rem",
      width: "100%",
      font: "inherit",
      fontWeight: 500,
      color: theme.palette.primary.text,
    },

    "date-button": {
      padding: 0,
    },

    "date-picker": {
      maxWidth: 320,
      borderRadius: 4,
      boxShadow: `0 4px 8px 0 ${theme.palette.grey[500]}`,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      position: "absolute",
      left: 0,
      top: "calc(100% + 0.5rem)",
      zIndex: 2,
      backgroundColor: "white",
    },

    "date-picker__container": {
      padding: "1rem",
      overflow: "hidden",
    },
  };
}
