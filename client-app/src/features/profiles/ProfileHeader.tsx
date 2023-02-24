import { observer } from 'mobx-react-lite';
import { Divider, Grid, Header, Item, Segment, Statistic } from 'semantic-ui-react';
import { Profile } from '../../app/models/profile';
import FollowButton from './FollowButton';

interface Props {
	profile: Profile;
}

function ProfileHeader({ profile }: Props) {
	const { displayName, image, followersCount, followingCount } = profile;

	return (
		<Segment>
			<Grid>
				<Grid.Column width={12}>
					<Item.Group>
						<Item>
							<Item.Image avatar size='small' src={image || '/assets/user/png'} />
							<Item.Content verticalAlign='middle'>
								<Header as='h1' content={displayName} />
							</Item.Content>
						</Item>
					</Item.Group>
				</Grid.Column>
				<Grid.Column width={4}>
					<Statistic.Group widths={2}>
						<Statistic label='Followers' value={followersCount} />
						<Statistic label='Following' value={followingCount} />
					</Statistic.Group>
					<Divider />
					<FollowButton profile={profile} />
				</Grid.Column>
			</Grid>
		</Segment>
	);
}

export default observer(ProfileHeader);
