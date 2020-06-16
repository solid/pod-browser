import { StyleRules } from "@material-ui/styles";
import {
  PrismTheme,
  button,
  content,
} from "../../lib/prism/node_modules/prism-patterns";

const styles = (theme: PrismTheme): StyleRules => ({
  ...button.styles(theme),
  ...content.styles(theme),
  "login-form": {
    background: theme.palette.background.default,
    borderRadius: theme.shape.borderRadius,
    boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.3)",
    padding: theme.spacing(5),
    minWidth: 420,
    textAlign: "center",
  },
  "login-form__what-is-solid": {
    margin: 0,
  },
  "login-form__sub-title": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    letterSpacing: 1.2,
    margin: "30px 0",
    position: "relative",
    textTransform: "none",
    "& span": {
      padding: "0 5px",
    },
    "&::before, &::after": {
      width: "32%",
      content: '""',
      background: theme.palette.text.secondary,
      height: 1,
      boxSizing: "border-box",
      left: 0,
      top: "50%",
    },
    "&::before:": {
      right: 0,
    },
  },
});

export default styles;
