import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import { useRedirectIfLoggedIn } from '../../src/effects/auth';
import LoginPage from './index';

jest.mock('../../src/effects/auth');

describe('Login page', () => {
  test('Renders a logout button', () => {
    const tree = shallow(<LoginPage />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test('Redirects if the user is logged out', () => {
    shallow(<LoginPage />);
    expect(useRedirectIfLoggedIn).toHaveBeenCalled();
  });
});
