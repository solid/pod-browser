import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import Login, { swapLoginType, LOGIN_TYPES } from './index';

describe('Login form', () => {
  test('Renders a login form, with button bound to swapLoginType', () => {
    const tree = shallow(<Login />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });
});

describe('swap login type', () => {
  test('Sets the login type to provider if the current type is web id', () => {
    const fn = jest.fn();
    swapLoginType(LOGIN_TYPES.WEB_ID, fn);
    expect(fn).toHaveBeenCalledWith(LOGIN_TYPES.PROVIDER);
  });

  test('Sets the login type to web id if the current type is not web id', () => {
    const fn = jest.fn();
    swapLoginType(LOGIN_TYPES.PROVIDER, fn);
    expect(fn).toHaveBeenCalledWith(LOGIN_TYPES.WEB_ID);
  });
});
