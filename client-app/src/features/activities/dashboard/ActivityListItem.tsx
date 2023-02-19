import { Link } from 'react-router-dom';
import { Button, Icon, Item, Segment } from 'semantic-ui-react';
import { Activity } from '../../../app/models/activity';

interface Props {
	activity: Activity;
}

export default function ActivityListItem({ activity }: Props) {
	const { id: ID, title, venue, date, description } = activity;

	return (
		<Segment.Group>
			<Segment>
				<Item.Group>
					<Item>
						<Item.Image size='tiny' circular src='/assets/user.png' />
						<Item.Content>
							<Item.Header as={Link} to={`/activities/${ID}`}>
								{title}
							</Item.Header>
							<Item.Description>Hosted By John Doe</Item.Description>
						</Item.Content>
					</Item>
				</Item.Group>
			</Segment>
			<Segment>
				<span>
					<Icon name='clock' /> {date}
					<Icon name='marker' /> {venue}
				</span>
			</Segment>
			<Segment secondary>Attendees go here</Segment>
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
