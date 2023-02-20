import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { Activity } from '../models/activity';
import { Router } from '../router/Routes';
import { store } from '../stores/store';

// const sleep = (delay: number) =>
// 	new Promise((resolve) => setTimeout(resolve, delay));

axios.interceptors.response.use(
	async (response) => response,
	(error: AxiosError) => {
		const { data, status, config } = error.response as AxiosResponse;

		switch (status) {
			case 400:
				if (config.method === 'get' && data.errors.hasOwnProperty('id')) {
					Router.navigate('/not-found');
				}
				if (data.errors) {
					const modalStateErrors = [];
					for (const key in data.errors) {
						if (data.errors[key]) modalStateErrors.push(data.errors[key]);
					}
					throw modalStateErrors.flat();
				} else toast.error(data);
				break;
			case 401:
				toast.error('unauthorized');
				break;
			case 403:
				toast.error('forbidden');
				break;
			case 404:
				Router.navigate('/not-found');
				break;
			case 500:
				store.commonStore.setServerError(data);
				Router.navigate('/server-error');
				break;
		}

		return Promise.reject(error);
	}
);

axios.defaults.baseURL = 'http://localhost:5000/api';

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
	get: <T>(url: string) => axios.get<T>(url).then(responseBody),
	post: <T>(url: string, body: {}) =>
		axios.post<T>(url, body).then(responseBody),
	put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
	del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const activityURL = '/activities';
const Activities = {
	list: () => requests.get<Activity[]>(activityURL),
	details: (id: string) => requests.get<Activity>(activityURL + '/' + id),
	create: (activity: Activity) => requests.post<void>(activityURL, activity),
	edit: (activity: Activity) =>
		requests.put<void>(activityURL + '/' + activity.id, activity),
	delete: (id: string) => requests.del<void>(activityURL + '/' + id),
};

const agent = {
	Activities,
};

export default agent;
