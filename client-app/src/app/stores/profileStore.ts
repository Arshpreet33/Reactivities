import { makeAutoObservable, runInAction } from 'mobx';
import agent from '../api/agent';
import { Photo, Profile } from '../models/profile';
import { store } from './store';

export default class ProfileStore {
	profile: Profile | null = null;
	loadingProfile = false;
	uploading = false;
	loading = false;

	constructor() {
		makeAutoObservable(this);
	}

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
}
