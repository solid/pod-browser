import { StyleRules } from "@material-ui/styles";
import {
  content,
  PrismTheme,
} from "../../../lib/prism/node_modules/prism-patterns";

const styles = (theme: PrismTheme): StyleRules => ({
  ...content.styles(theme),
  "login-page": {
    background:
      "linear-gradient(135deg, rgb(124, 77, 255) 0%, rgb(24, 169, 230) 50%, rgb(1, 201, 234) 100%)",
    backgroundRepeat: "no-repeat",
    boxSizing: "border-box",
    height: "100%",
    position: "relative",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: "url('/background-pattern.svg')",
      filter: "opacity(30%)",
    },
  },
  "login-page__container": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  "login-page__title": {
    color: theme.palette.background.default,
    fontSize: "1.75rem",
    letterSpacing: 1.4,
    lineHeight: "40px",
    margin: theme.spacing(5, 0),
  },
});

export default styles;
