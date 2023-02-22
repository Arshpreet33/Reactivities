import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button, Icon, Item, Label, Segment } from 'semantic-ui-react';
import { Activity } from '../../../app/models/activity';
import ActivityListItemAttendee from './ActivityListItemAttendee';

interface Props {
	activity: Activity;
}

export default function ActivityListItem({ activity }: Props) {
	const { id: ID, title, venue, date, description, attendees } = activity;

	return (
		<Segment.Group>
			<Segment>
				{activity.isCancelled && (
					<Label
						attached='top'
						color='red'
						content='Cancelled'
						style={{ textAlign: 'center' }}
					/>
				)}
				<Item.Group>
					<Item>
						<Item.Image
							size='tiny'
							circular
							src={activity.host?.image || '/assets/user.png'}
							style={{ marginBottom: 5 }}
						/>
						<Item.Content>
							<Item.Header as={Link} to={`/activities/${ID}`}>
								{title}
							</Item.Header>
							<Item.Description>
								Hosted By{' '}
								<Link to={`/profiles/${activity.hostUsername}`}>
									{activity.host?.displayName}
								</Link>
							</Item.Description>
							{activity.isHost && (
								<Item.Description>
									<Label basic color='orange'>
										You are hosting this activity
									</Label>
								</Item.Description>
							)}

							{!activity.isHost && activity.isGoing && (
								<Item.Description>
									<Label basic color='green'>
										You are going to this activity
									</Label>
								</Item.Description>
							)}
						</Item.Content>
					</Item>
				</Item.Group>
			</Segment>
			<Segment>
				<span>
					<Icon name='clock' /> {format(date!, 'dd MMM yyyy h:mm aa')}
					<Icon name='marker' /> {venue}
				</span>
			</Segment>
			<Segment secondary>
				<ActivityListItemAttendee attendees={attendees!} />
			</Segment>
			<Segment clearing>
				<span>{description}</span>
				<Button
					as={Link}
					to={`/activities/${ID}`}
					color='teal'
					floated='right'
					content='View'
				/>
			</Segment>
		</Segment.Group>
	);
}
