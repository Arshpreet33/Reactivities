import { observer } from 'mobx-react-lite';
import { ChangeEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Form, Segment } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import { v4 as uuid } from 'uuid';

const INITIAL_STATE = {
	id: '',
	title: '',
	date: '',
	description: '',
	category: '',
	city: '',
	venue: '',
};

const enum DISPLAY_NAMES {
	title = 'Title',
	date = 'Date',
	description = 'Description',
	category = 'Category',
	city = 'City',
	venue = 'Venue',
}

function ActivityForm() {
	const { activityStore } = useStore();
	const {
		createActivity,
		editActivity,
		submitting,
		loadActivitybyID,
		loadingInitial,
	} = activityStore;
	const [activity, setActivity] = useState(INITIAL_STATE);

	const { id } = useParams();

	const navigate = useNavigate();

	useEffect(() => {
		if (id) loadActivitybyID(id).then((a) => setActivity(a!));
	}, [id, loadActivitybyID]);

	function handleFormInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) {
		const { name, value } = event.target;
		setActivity({ ...activity, [name]: value });
	}

	function handleSubmit() {
		if (!activity.id) {
			activity.id = uuid();
			createActivity(activity).then(() =>
				navigate(`/activities/${activity.id}`)
			);
		} else
			editActivity(activity).then(() => navigate(`/activities/${activity.id}`));
	}

	if (loadingInitial && id)
		return <LoadingComponent content='Loading Activity data...' />;

	return (
		<Segment clearing>
			<Form onSubmit={handleSubmit} autoComplete='off'>
				<Form.Input
					placeholder={DISPLAY_NAMES.title}
					name='title'
					value={activity.title}
					onChange={handleFormInputChange}
				/>
				<Form.TextArea
					placeholder={DISPLAY_NAMES.description}
					name='description'
					value={activity.description}
					onChange={handleFormInputChange}
				/>
				<Form.Input
					placeholder={DISPLAY_NAMES.category}
					name='category'
					value={activity.category}
					onChange={handleFormInputChange}
				/>
				<Form.Input
					type='date'
					placeholder={DISPLAY_NAMES.date}
					name='date'
					value={activity.date}
					onChange={handleFormInputChange}
				/>
				<Form.Input
					placeholder={DISPLAY_NAMES.city}
					name='city'
					value={activity.city}
					onChange={handleFormInputChange}
				/>
				<Form.Input
					placeholder={DISPLAY_NAMES.venue}
					name='venue'
					value={activity.venue}
					onChange={handleFormInputChange}
				/>
				<Button
					loading={submitting}
					floated='right'
					positive
					type='submit'
					content='Submit'
				></Button>
				<Button
					floated='right'
					type='button'
					content='Cancel'
					as={Link}
					to={activity.id ? `/activities/${activity.id}` : '/activities'}
				></Button>
			</Form>
		</Segment>
	);
}

export default observer(ActivityForm);
