import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, Image } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';

function ActivityDetails() {
	const { activityStore } = useStore();
	const {
		selectedActivity: activity,
		loadActivitybyID,
		loadingInitial,
	} = activityStore;

	const { id } = useParams();

	useEffect(() => {
		if (id) loadActivitybyID(id);
	}, [id, loadActivitybyID]);

	if (loadingInitial || !activity) return <LoadingComponent />;
	return (
		<Card fluid>
			<Image src={`/assets/categoryImages/${activity.category}.jpg`} />
			<Card.Content>
				<Card.Header>{activity.title}</Card.Header>
				<Card.Meta>
					<span>{activity.date}</span>
				</Card.Meta>
				<Card.Description>{activity.description}</Card.Description>
			</Card.Content>
			<Card.Content extra>
				<Button.Group widths='2'>
					<Button
						basic
						content='Edit'
						color='blue'
						as={Link}
						to={`/editActivity/${activity.id}`}
					/>
					<Button
						basic
						content='Cancel'
						color='grey'
						as={Link}
						to='/activities'
					/>
				</Button.Group>
			</Card.Content>
		</Card>
	);
}

export default observer(ActivityDetails);
