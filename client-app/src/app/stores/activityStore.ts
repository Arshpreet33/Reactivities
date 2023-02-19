import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../api/agent';
import { Activity } from '../models/activity';
import { v4 as uuid } from 'uuid';

export default class ActivityStore {
	activityRegistry = new Map<string, Activity>();
	selectedActivity: Activity | undefined = undefined;
	editMode = false;
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

	loadActivities = async () => {
		try {
			const activities = await agent.Activities.list();
			activities.forEach((a) => {
				a.date = a.date.split('T')[0];
				this.activityRegistry.set(a.id, a);
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

	setEditMode = (value: boolean) => {
		this.editMode = value;
	};

	setSubmitting = (value: boolean) => {
		this.submitting = value;
	};

	selectActivity = (id: string) => {
		this.selectedActivity = this.activityRegistry.get(id);
		this.setEditMode(false);
	};

	cancelSelectActivity = () => {
		this.selectedActivity = undefined;
	};

	openForm = (id?: string) => {
		id ? this.selectActivity(id) : this.cancelSelectActivity();
		this.setEditMode(true);
	};

	closeForm = () => {
		this.setEditMode(false);
	};

	createOrEditActivity = async (activity: Activity) => {
		this.setSubmitting(true);
		try {
			if (activity.id) {
				await agent.Activities.edit(activity);

				runInAction(() => {
					this.activityRegistry.set(activity.id, activity);
					this.setEditMode(false);
					this.selectedActivity = activity;
					this.setSubmitting(false);
				});
			} else {
				const newActivity = { ...activity, id: uuid() };
				await agent.Activities.create(newActivity);

				runInAction(() => {
					this.activityRegistry.set(newActivity.id, newActivity);
					this.setEditMode(false);
					this.selectedActivity = newActivity;
					this.setSubmitting(false);
				});
			}
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
				if (this.selectedActivity?.id === id) this.cancelSelectActivity();
			});
		} catch (error) {
			console.log(error);
			this.setSubmitting(false);
		}
	};
}
