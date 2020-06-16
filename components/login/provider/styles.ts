import { StyleRules } from "@material-ui/styles";
import {
  PrismTheme,
  button,
} from "../../../lib/prism/node_modules/prism-patterns";

const styles = (theme: PrismTheme): StyleRules =>
  button.styles(theme) as StyleRules;

export default styles;
