import { observer } from 'mobx-react-lite';
import { SyntheticEvent } from 'react';
import { Button, Reveal } from 'semantic-ui-react';
import { Profile } from '../../app/models/profile';
import { useStore } from '../../app/stores/store';

interface Props {
	profile: Profile;
}

function FollowButton({ profile }: Props) {
	const { userStore, profileStore } = useStore();
	const { loading, updateFollowing } = profileStore;

	if (userStore.user?.userName === profile.username) return null;

	const handleFollow = (e: SyntheticEvent, username: string) => {
		e.preventDefault();
		updateFollowing(username, !profile.following);
	};

	return (
		<Reveal animated='move'>
			<Reveal.Content visible style={{ width: '100%' }}>
				<Button fluid color='teal' content={profile.following ? 'Following' : 'Not Following'} />
			</Reveal.Content>
			<Reveal.Content hidden style={{ width: '100%' }}>
				<Button
					basic
					fluid
					color={profile.following ? 'red' : 'green'}
					content={profile.following ? 'Unfollow' : 'Follow'}
					loading={loading}
					onClick={(e) => handleFollow(e, profile.username)}
				/>
			</Reveal.Content>
		</Reveal>
	);
}

export default observer(FollowButton);
