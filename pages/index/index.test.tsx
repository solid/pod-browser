import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';

import { useRedirectIfLoggedOut } from '../../src/effects/auth';
import IndexPage from './index';

jest.mock('../../src/effects/auth');

describe('Index page', () => {
  test('Renders a logout button', () => {
    const tree = shallow(<IndexPage />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test('Redirects if the user is logged out', () => {
    shallow(<IndexPage />);
    expect(useRedirectIfLoggedOut).toHaveBeenCalled();
  });
});
