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
  const lightPrimaryColor = "#F1EDFF"; // TODO: THIS MUST BE MOVED TO PRISM
  return {
    "group-list-header": {
      alignItems: "center",
      display: "flex",
      marginBottom: theme.spacing(1),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(1.6, 2.4, 1.2, 2.4),
      },
    },
    "group-list-header__title": {
      ...theme.typography.h5,
      flexGrow: 1,
    },
    "group-list": {
      listStyle: "none",
      margin: 0,
      padding: 0,
    },
    "group-list__item": {},
    "group-list__link": {
      color: theme.palette.text.primary,
      display: "block",
      borderLeft: `solid 3px transparent`,
      textDecoration: "none",
      padding: theme.spacing(1.6, 0),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(1.6, 2.4),
      },
    },
    "group-list__link--selected": {
      [theme.breakpoints.up("sm")]: {
        background: lightPrimaryColor,
        borderColor: theme.palette.primary.dark,
        color: theme.palette.primary.main,
        fontWeight: theme.typography.fontWeightBold,
      },
    },
    "group-list__icon": {
      fontSize: "0.8125rem",
    },
    "group-list__icon--selected": {
      [theme.breakpoints.up("sm")]: theme.icons.iconColor(
        theme.palette.primary.main
      ),
    },
    "group-list__text": {
      paddingLeft: theme.spacing(1.4),
    },
  };
}
