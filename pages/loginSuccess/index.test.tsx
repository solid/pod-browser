import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import { useRedirectIfLoggedOut } from '../../src/effects/auth';
import LoginSuccessPage from './index';

jest.mock('../../src/effects/auth');

describe('LoginSuccess page', () => {
  // TODO test effect

  test('Renders a logout button', () => {
    const tree = shallow(<LoginSuccessPage />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test('Redirects if the user is logged out', () => {
    shallow(<LoginSuccessPage />);
    expect(useRedirectIfLoggedOut).toHaveBeenCalled();
  });
});
