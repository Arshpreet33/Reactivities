import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Button, Grid, Header, Tab } from 'semantic-ui-react';
import { Profile } from '../../app/models/profile';
import { useStore } from '../../app/stores/store';
import ProfileEdit from './ProfileEdit';

interface Props {
	profile: Profile;
}

function ProfileAbout({ profile }: Props) {
	const [editProfileMode, setEditProfileMode] = useState(false);
	const {
		profileStore: { isCurrentUser, editProfile },
	} = useStore();

	function handleProfileEdit(displayName: string, bio?: string) {
		editProfile({ displayName, bio });
		setEditProfileMode(false);
	}

	return (
		<Tab.Pane>
			<Grid>
				<Grid.Column width={16}>
					<Header floated='left' icon='user' content={`About ${profile.displayName}`} />
					{isCurrentUser && (
						<Button
							basic
							floated='right'
							content={editProfileMode ? 'Cancel' : 'Edit Profile'}
							onClick={() => {
								setEditProfileMode(!editProfileMode);
							}}
						/>
					)}
				</Grid.Column>
				<Grid.Column width={16}>
					{editProfileMode ? (
						<ProfileEdit
							handleProfileEdit={handleProfileEdit}
							displayName={profile.displayName}
							bio={profile.bio}
						/>
					) : (
						<Grid.Row>
							<Header floated='left' content={profile.bio} style={{ 'white-space': 'pre-line' }} />
						</Grid.Row>
					)}
				</Grid.Column>
			</Grid>
		</Tab.Pane>
	);
}

export default observer(ProfileAbout);
