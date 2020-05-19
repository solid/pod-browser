import { shallow } from 'enzyme';
import { shallowToJson } from 'enzyme-to-json';
import Router from 'next/router';
import { logout } from '../../lib/solid-auth-fetcher/dist';

import LogOutButton from './index';


jest.mock('next/router');
jest.mock('../../lib/solid-auth-fetcher/dist');

describe('Logout button', () => {
  test('Renders a logout button', () => {
    const tree = shallow(<LogOutButton />);
    expect(shallowToJson(tree)).toMatchSnapshot();
  });

  test('Calls logout and redirects on click', () => {
    const tree = shallow(<LogOutButton />);
    tree.simulate('click', { preventDefault: () => {} });

    expect(Router.push).toHaveBeenCalledWith('/login');
    expect(logout).toHaveBeenCalled();
  });
});
