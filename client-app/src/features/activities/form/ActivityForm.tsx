import React, { ChangeEvent, useEffect, useState } from 'react';
import { Button, Form, Segment } from 'semantic-ui-react';
import { Activity } from '../../../app/models/activity';

interface Props {
	activity: Activity | undefined;
	closeForm: () => void;
	createOrEditActivity: (activity: Activity) => void;
	submitting: boolean;
}

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

export default function ActivityForm({
	activity: selectedActivity,
	closeForm,
	createOrEditActivity,
	submitting,
}: Props) {
	const [activity, setActivity] = useState(selectedActivity ?? INITIAL_STATE);

	function handleFormInputChange(
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) {
		const { name, value } = event.target;
		setActivity({ ...activity, [name]: value });
	}

	function handleSubmit() {
		console.log(activity);
		createOrEditActivity(activity);
	}

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
					onClick={closeForm}
				></Button>
			</Form>
		</Segment>
	);
}
