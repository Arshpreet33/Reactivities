import { format } from 'date-fns';
import { makeAutoObservable, reaction, runInAction } from 'mobx';
import agent from '../api/agent';
import { Activity, ActivityFormValues } from '../models/activity';
import { Pagination, PagingParams } from '../models/pagination';
import { Profile } from '../models/profile';
import { store } from './store';

export default class ActivityStore {
	activityRegistry = new Map<string, Activity>();
	selectedActivity: Activity | undefined = undefined;
	loadingInitial = false;
	submitting = false;
	pagination: Pagination | null = null;
	pagingParams = new PagingParams();
	predicate = new Map().set('all', true);

	constructor() {
		makeAutoObservable(this);

		reaction(
			() => this.predicate.keys(),
			() => {
				this.pagingParams = new PagingParams();
				this.activityRegistry.clear();
				this.loadActivities();
			}
		);
	}

	get activitiesByDate() {
		return Array.from(this.activityRegistry.values()).sort(
			(a, b) => a.date!.getTime() - b.date!.getTime()
		);
	}

	get groupedActivitiesByDate() {
		return Object.entries(
			this.activitiesByDate.reduce((activities, activity) => {
				const date = format(activity.date!, 'dd MMM yyyy');
				activities[date] = activities[date] ? [...activities[date], activity] : [activity];
				return activities;
			}, {} as { [key: string]: Activity[] })
		);
	}

	get axiosParams() {
		const params = new URLSearchParams();
		params.append('pageNumber', this.pagingParams.pageNumber.toString());
		params.append('pageSize', this.pagingParams.pageSize.toString());
		this.predicate.forEach((value, key) => {
			if (key === 'startDate') {
				params.append(key, (value as Date).toISOString());
			} else {
				params.append(key, value);
			}
		});
		return params;
	}

	setPredicate = (predicate: string, value: string | Date) => {
		const resetPredicate = () => {
			this.predicate.forEach((value, key) => {
				if (key !== 'startDate') this.predicate.delete(key);
			});
		};

		switch (predicate) {
			case 'all':
				resetPredicate();
				this.predicate.set('all', true);
				break;
			case 'isGoing':
				resetPredicate();
				this.predicate.set('isGoing', true);
				break;
			case 'isHost':
				resetPredicate();
				this.predicate.set('isHost', true);
				break;
			case 'startDate':
				this.predicate.delete('startDate');
				this.predicate.set('startDate', value);
				break;
		}
	};

	setPagingparams = (pagingParams: PagingParams) => {
		this.pagingParams = pagingParams;
	};

	loadActivitybyID = async (id: string) => {
		let activity = this.getActivityById(id);
		if (activity) {
			this.selectedActivity = activity;
			return activity;
		} else {
			this.setLoadingInitial(true);
			try {
				activity = await agent.Activities.details(id);
				this.setActivity(activity);
				runInAction(() => {
					this.selectedActivity = activity;
				});
				this.setLoadingInitial(false);
				return activity;
			} catch (error) {
				console.log(error);
				this.setLoadingInitial(false);
			}
		}
	};

	private getActivityById = (id: string) => this.activityRegistry.get(id);

	private setActivity = (activity: Activity) => {
		const user = store.userStore.user;
		if (user) {
			activity.isGoing = activity.attendees!.some((a) => a.username === user.userName);
			activity.isHost = activity.hostUsername === user.userName;
			activity.host = activity.attendees?.find((a) => a.username === activity.hostUsername);
		}

		activity.date = new Date(activity.date!);
		this.activityRegistry.set(activity.id, activity);
	};

	loadActivities = async () => {
		this.setLoadingInitial(true);
		try {
			const result = await agent.Activities.list(this.axiosParams);
			result.data.forEach((a) => {
				this.setActivity(a);
			});
			this.setPagination(result.pagination);
			this.setLoadingInitial(false);
		} catch (error) {
			console.log(error);
			this.setLoadingInitial(false);
		}
	};

	setPagination = (pagination: Pagination) => {
		this.pagination = pagination;
	};

	setLoadingInitial = (value: boolean) => {
		this.loadingInitial = value;
	};

	setSubmitting = (value: boolean) => {
		this.submitting = value;
	};

	editActivity = async (activity: ActivityFormValues) => {
		try {
			await agent.Activities.edit(activity);
			runInAction(() => {
				if (activity.id) {
					let updatedActivity = {
						...this.getActivityById(activity.id),
						...activity,
					};

					this.activityRegistry.set(activity.id, updatedActivity as Activity);
					this.selectedActivity = updatedActivity as Activity;
				}
			});
		} catch (error) {
			console.log(error);
		}
	};

	createActivity = async (activity: ActivityFormValues) => {
		const user = store.userStore.user;
		const attendee = new Profile(user!);
		try {
			await agent.Activities.create(activity);
			const newActivity = new Activity(activity);
			newActivity.hostUsername = user!.userName;
			newActivity.attendees = [attendee];
			this.setActivity(newActivity);

			runInAction(() => {
				// this.activityRegistry.set(newActivity.id, newActivity);
				this.selectedActivity = newActivity;
			});
		} catch (error) {
			console.log(error);
		}
	};

	deleteActivity = async (id: string) => {
		this.setSubmitting(true);
		try {
			await agent.Activities.delete(id);
			runInAction(() => {
				this.activityRegistry.delete(id);
				this.setSubmitting(false);
			});
		} catch (error) {
			console.log(error);
			this.setSubmitting(false);
		}
	};

	updateAttendance = async () => {
		const user = store.userStore.user;
		this.setSubmitting(true);
		try {
			await agent.Activities.attend(this.selectedActivity!.id);
			runInAction(() => {
				if (this.selectedActivity?.isGoing) {
					this.selectedActivity.attendees = this.selectedActivity.attendees?.filter(
						(a) => a.username !== user?.userName
					);
					this.selectedActivity!.isGoing = false;
				} else {
					const attendee = new Profile(user!);
					this.selectedActivity?.attendees?.push(attendee);
					this.selectedActivity!.isGoing = true;
				}

				this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
			});
		} catch (error) {
			console.log(error);
		} finally {
			this.setSubmitting(false);
		}
	};

	cancelActivityToggle = async () => {
		this.setSubmitting(true);
		try {
			await agent.Activities.attend(this.selectedActivity!.id);

			runInAction(() => {
				this.selectedActivity!.isCancelled = !this.selectedActivity?.isCancelled;

				this.activityRegistry.set(this.selectedActivity!.id, this.selectedActivity!);
			});
		} catch (error) {
			console.log(error);
		} finally {
			this.setSubmitting(false);
		}
	};

	clearSelectedActivity = () => {
		this.selectedActivity = undefined;
	};

	updateAttendeeFollowing = (username: string) => {
		this.activityRegistry.forEach((activity) => {
			activity.attendees?.forEach((attendee) => {
				if (attendee.username === username) {
					attendee.following ? attendee.followersCount-- : attendee.followersCount++;
					attendee.following = !attendee.following;
				}
			});
		});
	};
}
