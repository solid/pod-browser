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
    nameAndAvatarContainer: {
      padding: theme.spacing(0.8, 1.6),
      color: "#000",
      width: "100%",
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
    },
    avatar: {
      marginRight: theme.spacing(1.6),
      width: "1.875rem",
      height: "1.875rem",
    },
    detailText: {
      overflowWrap: "anywhere",
      fontWeight: 500,
      display: "flex",
      fontSize: "1rem",
      fontFamily: "inherit",
      textAlign: "left",
      justifyContent: "space-between",
      alignItems: "center",
      flexGrow: 1,
      flexDirection: "row",
    },
    shareText: {
      whiteSpace: "nowrap",
      padding: theme.spacing(0.5),
      color: theme.palette.text.secondary,
      fontSize: "0.8125rem",
      fontWeight: 500,
    },
  };
}
