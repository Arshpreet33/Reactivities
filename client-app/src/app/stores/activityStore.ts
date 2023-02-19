import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../api/agent';
import { Activity } from '../models/activity';

export default class ActivityStore {
	activityRegistry = new Map<string, Activity>();
	selectedActivity: Activity | undefined = undefined;
	loadingInitial = true;
	submitting = false;

	constructor() {
		makeAutoObservable(this);
	}

	get activitiesByDate() {
		return Array.from(this.activityRegistry.values()).sort(
			(a, b) => Date.parse(a.date) - Date.parse(b.date)
		);
	}

	get groupedActivitiesByDate() {
		return Object.entries(
			this.activitiesByDate.reduce((activities, activity) => {
				const date = activity.date;
				activities[date] = activities[date]
					? [...activities[date], activity]
					: [activity];
				return activities;
			}, {} as { [key: string]: Activity[] })
		);
	}

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

	private setActivity = (a: Activity) => {
		a.date = a.date.split('T')[0];
		this.activityRegistry.set(a.id, a);
	};

	loadActivities = async () => {
		this.setLoadingInitial(true);
		try {
			const activities = await agent.Activities.list();
			activities.forEach((a) => {
				this.setActivity(a);
			});
			this.setLoadingInitial(false);
		} catch (error) {
			console.log(error);
			this.setLoadingInitial(false);
		}
	};

	setLoadingInitial = (value: boolean) => {
		this.loadingInitial = value;
	};

	setSubmitting = (value: boolean) => {
		this.submitting = value;
	};

	editActivity = async (activity: Activity) => {
		this.setSubmitting(true);
		try {
			await agent.Activities.edit(activity);
			runInAction(() => {
				this.activityRegistry.set(activity.id, activity);
				this.selectedActivity = activity;
				this.setSubmitting(false);
			});
		} catch (error) {
			console.log(error);
			this.setSubmitting(false);
		}
	};

	createActivity = async (activity: Activity) => {
		this.setSubmitting(true);
		try {
			await agent.Activities.create(activity);
			runInAction(() => {
				this.activityRegistry.set(activity.id, activity);
				this.selectedActivity = activity;
				this.setSubmitting(false);
			});
		} catch (error) {
			console.log(error);
			this.setSubmitting(false);
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
}
