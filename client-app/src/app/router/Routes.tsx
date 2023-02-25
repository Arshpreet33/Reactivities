import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import ActivityDetails from '../../features/activities/details/ActivityDetails';
import ActivityForm from '../../features/activities/form/ActivityForm';
import NotFound from '../../features/errors/NotFound';
import ServerError from '../../features/errors/ServerError';
import TestErrors from '../../features/errors/TestErrors';
import ProfilePage from '../../features/profiles/ProfilePage';
import App from '../layout/App';
import RequireAuth from './RequireAuth';

export const Routes: RouteObject[] = [
	{
		path: '/',
		element: <App />,
		children: [
			{
				element: <RequireAuth />,
				children: [
					{ path: 'activities', element: <ActivityDashboard /> },
					{ path: 'activities/:id', element: <ActivityDetails /> },
					{ path: 'createActivity', element: <ActivityForm key='create' /> },
					{ path: 'editActivity/:id', element: <ActivityForm key='edit' /> },
					{ path: 'profiles/:username', element: <ProfilePage /> },
					{ path: 'errors', element: <TestErrors /> },
				],
			},

			{ path: 'not-found', element: <NotFound /> },
			{ path: 'server-error', element: <ServerError /> },
			{ path: '*', element: <Navigate replace to='/not-found' /> },
		],
	},
];

export const Router = createBrowserRouter(Routes);
