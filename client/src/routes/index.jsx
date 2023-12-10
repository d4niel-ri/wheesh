import MainLayout from '@layouts/MainLayout';
import CreatePassenger from '@pages/CreatePassenger';

import Home from '@pages/Home';
import Login from '@pages/Login';
import Me from '@pages/Me';
import MyPassengers from '@pages/MyPassengers';
import MyTickets from '@pages/MyTickets';
import NotFound from '@pages/NotFound';
import Passenger from '@pages/Passenger';
import Profile from '@pages/Profile';
import Register from '@pages/Register';
import ChangePassword from '@pages/ChangePassword';
import ChangeEmail from '@pages/ChangeEmail';
import Test from '@pages/Test';

const routes = [
  {
    path: '/',
    name: 'Home',
    protected: false,
    component: Home,
    layout: MainLayout,
  },
  {
    path: '/my-tickets',
    name: 'My Tickets',
    protected: false,
    component: MyTickets,
    layout: MainLayout,
  },
  {
    path: '/me',
    name: 'Me',
    protected: false,
    component: Me,
    layout: MainLayout,
  },
  {
    path: '/login',
    name: 'Login',
    protected: false,
    component: Login,
    layout: MainLayout,
  },
  {
    path: '/register',
    name: 'Register',
    protected: false,
    component: Register,
    layout: MainLayout,
  },
  {
    path: '/myPassengers',
    name: 'My Passengers',
    protected: true,
    component: MyPassengers,
    layout: MainLayout,
  },
  {
    path: '/createPassenger',
    name: 'Create Passenger',
    protected: true,
    component: CreatePassenger,
    layout: MainLayout,
  },
  {
    path: '/passenger/:passengerId',
    name: 'Passenger',
    protected: true,
    component: Passenger,
    layout: MainLayout,
  },
  {
    path: '/profile',
    name: 'Profile',
    protected: true,
    component: Profile,
    layout: MainLayout,
  },
  {
    path: '/changePassword',
    name: 'Change Password',
    protected: true,
    component: ChangePassword,
    layout: MainLayout,
  },
  {
    path: '/changeEmail',
    name: 'Change Email',
    protected: true,
    component: ChangeEmail,
    layout: MainLayout,
  },
  {
    path: '/test',
    name: 'Test',
    protected: false,
    component: Test,
    layout: MainLayout,
  },
  { path: '*', name: 'Not Found', component: NotFound, layout: MainLayout, protected: false },
];

export default routes;
