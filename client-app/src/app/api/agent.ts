import axios, { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { Activity, ActivityFormValues } from '../models/activity';
import { PaginatedResults } from '../models/pagination';
import { Photo, Profile, UserActivity } from '../models/profile';
import { User, UserFormValues } from '../models/user';
import { Router } from '../router/Routes';
import { store } from '../stores/store';

// const sleep = (delay: number) =>
// 	new Promise((resolve) => setTimeout(resolve, delay));

axios.defaults.baseURL = process.env.REACT_APP_API_URL;

axios.interceptors.request.use((config) => {
	const token = store.commonStore.token;
	if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

axios.interceptors.response.use(
	async (response) => {
		const pagination = response.headers['pagination'];
		if (pagination) {
			response.data = new PaginatedResults(response.data, JSON.parse(pagination));
			return response as AxiosResponse<PaginatedResults<any>>;
		}
		return response;
	},
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

const responseBody = <T>(response: AxiosResponse<T>) => response.data;

const requests = {
	get: <T>(url: string) => axios.get<T>(url).then(responseBody),
	post: <T>(url: string, body: {}) => axios.post<T>(url, body).then(responseBody),
	put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(responseBody),
	del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
};

const activityURL = '/activities';
const Activities = {
	list: (params: URLSearchParams) =>
		axios.get<PaginatedResults<Activity[]>>(activityURL, { params }).then(responseBody),
	details: (id: string) => requests.get<Activity>(activityURL + '/' + id),
	create: (activity: ActivityFormValues) => requests.post<void>(activityURL, activity),
	edit: (activity: ActivityFormValues) =>
		requests.put<void>(activityURL + '/' + activity.id, activity),
	delete: (id: string) => requests.del<void>(activityURL + '/' + id),
	attend: (id: string) => requests.post<void>(activityURL + '/' + id + '/attend', {}),
};

const accountURL = '/account';
const Account = {
	current: () => requests.get<User>(accountURL),
	login: (user: UserFormValues) => requests.post<User>(accountURL + '/login', user),
	register: (user: UserFormValues) => requests.post<User>(accountURL + '/register', user),
};

const profilesURL = '/profiles';
const photosURL = '/photos';
const followURL = '/follow';
const Profiles = {
	get: (username: string) => requests.get<Profile>(profilesURL + '/' + username),
	edit: (profile: Partial<Profile>) => requests.put(profilesURL, profile),
	uploadPhoto: (file: Blob) => {
		let formData = new FormData();
		formData.append('File', file);
		return axios.post<Photo>('photos', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},
	setMainPhoto: (id: string) => requests.post(photosURL + '/' + id + '/setmain', {}),
	deletePhoto: (id: string) => requests.del(photosURL + '/' + id),
	updateFollowing: (username: string) => requests.post(followURL + '/' + username, {}),
	listFollowings: (username: string, predicate: string) =>
		requests.get<Profile[]>(followURL + '/' + username + '?predicate=' + predicate),
	listActivities: (username: string, predicate: string) =>
		requests.get<UserActivity[]>(
			profilesURL + '/' + username + '/activities?predicate=' + predicate
		),
};

const agent = {
	Activities,
	Account,
	Profiles,
};

export default agent;
