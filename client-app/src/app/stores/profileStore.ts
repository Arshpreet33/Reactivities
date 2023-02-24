import { makeAutoObservable, reaction, runInAction } from 'mobx';
import agent from '../api/agent';
import { Photo, Profile, UserActivity } from '../models/profile';
import { store } from './store';

export default class ProfileStore {
	profile: Profile | null = null;
	loadingProfile = false;
	uploading = false;
	loading = false;
	loadingFollowings = false;
	followings: Profile[] = [];
	activeTab = 0;
	userActivities: UserActivity[] = [];
	loadingActivities = false;

	constructor() {
		makeAutoObservable(this);

		reaction(
			() => this.activeTab,
			(activeTab: number) => {
				if (activeTab === 3 || activeTab === 4) {
					const predicate = activeTab === 3 ? 'followers' : 'following';
					this.loadFollowings(predicate);
				} else {
					this.followings = [];
				}
			}
		);
	}

	setActiveTab = (activeTab: any) => {
		this.activeTab = activeTab;
	};

	get isCurrentUser() {
		if (store.userStore.user && this.profile) {
			return store.userStore.user.userName === this.profile.username;
		}
		return false;
	}

	setLoadingProfile = (value: boolean) => {
		this.loadingProfile = value;
	};

	setUploading = (value: boolean) => {
		this.uploading = value;
	};

	setLoading = (value: boolean) => {
		this.loading = value;
	};

	loadProfile = async (username: string) => {
		this.setLoadingProfile(true);
		try {
			const profile = await agent.Profiles.get(username);
			runInAction(() => {
				this.profile = profile;
				this.setLoadingProfile(false);
			});
		} catch (error) {
			console.log(error);
			runInAction(() => {
				this.setLoadingProfile(false);
			});
		}
	};

	editProfile = async (profile: Partial<Profile>) => {
		this.setLoading(true);
		try {
			await agent.Profiles.edit(profile);
			runInAction(() => {
				this.profile!.displayName = profile.displayName!;
				this.profile!.bio = profile.bio;

				store.userStore.setDisplayName(profile.displayName!);
				this.setLoading(false);
			});
		} catch (error) {
			console.log(error);
			runInAction(() => {
				this.setLoading(false);
			});
		}
	};

	uploadPhoto = async (file: Blob) => {
		this.setUploading(true);
		try {
			const response = await agent.Profiles.uploadPhoto(file);
			const photo = response.data;
			runInAction(() => {
				if (this.profile) {
					this.profile.photos?.push(photo);
					if (photo.isMain && store.userStore.user) {
						store.userStore.setImage(photo.url);
						this.profile.image = photo.url;
					}
				}

				this.setUploading(false);
			});
		} catch (error) {
			console.log(error);
			runInAction(() => this.setUploading(false));
		}
	};

	setMainPhoto = async (photo: Photo) => {
		this.setLoading(true);
		try {
			await agent.Profiles.setMainPhoto(photo.id);
			store.userStore.setImage(photo.url);
			runInAction(() => {
				if (this.profile && this.profile.photos) {
					this.profile.photos.find((p) => p.isMain)!.isMain = false;
					this.profile.photos.find((p) => p.id === photo.id)!.isMain = true;
					this.profile.image = photo.url;
				}

				this.setLoading(false);
			});
		} catch (error) {
			console.log(error);
			runInAction(() => this.setLoading(false));
		}
	};

	deletePhoto = async (photo: Photo) => {
		this.setLoading(true);
		try {
			await agent.Profiles.deletePhoto(photo.id);
			runInAction(() => {
				if (this.profile)
					this.profile.photos = this.profile.photos?.filter((p) => p.id !== photo.id);

				this.setLoading(false);
			});
		} catch (error) {
			console.log(error);
			runInAction(() => this.setLoading(false));
		}
	};

	updateFollowing = async (username: string, following: boolean) => {
		this.setLoading(true);
		try {
			await agent.Profiles.updateFollowing(username);
			store.activityStore.updateAttendeeFollowing(username);
			runInAction(() => {
				if (
					this.profile &&
					this.profile.username !== store.userStore.user?.userName &&
					this.profile.username === username
				) {
					following ? this.profile.followersCount++ : this.profile.followersCount--;
					this.profile.following = !this.profile.following;
				}
				if (this.profile && this.profile?.username === store.userStore.user?.userName) {
					following ? this.profile.followingCount++ : this.profile.followingCount--;
				}
				this.followings.forEach((profile) => {
					if (profile.username === username) {
						profile.following ? profile.followersCount-- : profile.followersCount++;
						profile.following = !profile.following;
					}
				});
				this.setLoading(false);
			});
		} catch (error) {
			console.log(error);
			runInAction(() => this.setLoading(false));
		}
	};

	loadFollowings = async (predicate: string) => {
		this.loadingFollowings = true;
		try {
			var followings = await agent.Profiles.listFollowings(this.profile!.username, predicate);
			runInAction(() => {
				this.followings = followings;
				this.loadingFollowings = false;
			});
		} catch (error) {
			console.log(error);
			runInAction(() => (this.loadingFollowings = false));
		}
	};

	loadUserActivities = async (username: string, predicate?: string) => {
		this.loadingActivities = true;
		try {
			var activities = await agent.Profiles.listActivities(username, predicate!);
			runInAction(() => {
				console.log(activities);
				this.userActivities = activities;
				this.loadingActivities = false;
			});
		} catch (error) {
			console.log(error);
			runInAction(() => (this.loadingActivities = false));
		}
	};
}
