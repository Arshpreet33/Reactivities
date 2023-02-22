import { observer } from 'mobx-react-lite';
import { SyntheticEvent, useState } from 'react';
import { Button, Card, Grid, Header, Image, Tab } from 'semantic-ui-react';
import PhotoUploadWidget from '../../app/common/imageUpload/PhotoUploadWidget';
import { Photo, Profile } from '../../app/models/profile';
import { useStore } from '../../app/stores/store';

interface Props {
	profile: Profile;
}

function ProfilePhotos({ profile }: Props) {
	const {
		profileStore: { isCurrentUser, uploadPhoto, uploading, setMainPhoto, loading, deletePhoto },
	} = useStore();
	const [addPhotoMode, setAddPhotoMode] = useState(false);
	const [target, setTarget] = useState('');

	function handleSetNamePhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
		setTarget(e.currentTarget.name);
		setMainPhoto(photo);
	}

	function handleDeletePhoto(photo: Photo, e: SyntheticEvent<HTMLButtonElement>) {
		setTarget(e.currentTarget.name);
		deletePhoto(photo);
	}

	function handlePhotoUpload(file: Blob) {
		uploadPhoto(file).then(() => {
			setAddPhotoMode(false);
		});
	}

	return (
		<Tab.Pane>
			<Grid>
				<Grid.Column width={16}>
					<Header floated='left' icon='image' content='Photos' />
					{isCurrentUser && (
						<Button
							basic
							floated='right'
							content={addPhotoMode ? 'Cancel' : 'Add Photo'}
							onClick={() => {
								setAddPhotoMode(!addPhotoMode);
							}}
						/>
					)}
				</Grid.Column>
				<Grid.Column width={16}>
					{addPhotoMode ? (
						<PhotoUploadWidget uploadPhoto={handlePhotoUpload} loading={uploading} />
					) : (
						<Card.Group itemsPerRow={5}>
							{profile.photos?.map((photo) => (
								<Card key={photo.id}>
									<Image src={photo.url} />
									{isCurrentUser && (
										<Button.Group fluid width={2}>
											<Button
												basic
												color='green'
												content='Main'
												name={photo.id}
												disabled={photo.isMain}
												loading={target === photo.id && loading}
												onClick={(e) => handleSetNamePhoto(photo, e)}
											/>
											<Button
												basic
												color='red'
												icon='trash'
												name={`del-${photo.id}`}
												disabled={photo.isMain}
												loading={target === `del-${photo.id}` && loading}
												onClick={(e) => handleDeletePhoto(photo, e)}
											/>
										</Button.Group>
									)}
								</Card>
							))}
						</Card.Group>
					)}
				</Grid.Column>
			</Grid>
		</Tab.Pane>
	);
}

export default observer(ProfilePhotos);
