import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Header, Segment } from 'semantic-ui-react';
import LoadingComponent from '../../../app/layout/LoadingComponent';
import { useStore } from '../../../app/stores/store';
import { v4 as uuid } from 'uuid';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import MyTextInput from '../../../app/common/form/MyTextInput';
import MyTextArea from '../../../app/common/form/MyTextArea';
import MySelectInput from '../../../app/common/form/MySelectInput';
import { categoryOptions } from '../../../app/common/options/categoryOptions';
import MyDateInput from '../../../app/common/form/MyDateInput';
import { Activity } from '../../../app/models/activity';

const INITIAL_STATE = {
	id: '',
	title: '',
	date: null,
	description: '',
	category: '',
	city: '',
	venue: '',
};

const enum DISPLAY_NAMES {
	title = 'Title',
	description = 'Description',
	category = 'Category',
	date = 'Date',
	city = 'City',
	venue = 'Venue',
}

const enum FIELD_NAMES {
	title = 'title',
	description = 'description',
	category = 'category',
	date = 'date',
	city = 'city',
	venue = 'venue',
}

const VALIDATION_MESSAGE = (field: string) =>
	`The activity ${field} is required`;

function ActivityForm() {
	const { activityStore } = useStore();
	const {
		createActivity,
		editActivity,
		submitting,
		loadActivitybyID,
		loadingInitial,
	} = activityStore;
	const [activity, setActivity] = useState<Activity>(INITIAL_STATE);

	const { id } = useParams();

	const navigate = useNavigate();

	const validationSchema = Yup.object({
		title: Yup.string().required(VALIDATION_MESSAGE(DISPLAY_NAMES.title)),
		description: Yup.string().required(
			VALIDATION_MESSAGE(DISPLAY_NAMES.description)
		),
		category: Yup.string().required(VALIDATION_MESSAGE(DISPLAY_NAMES.category)),
		date: Yup.string().required(VALIDATION_MESSAGE(DISPLAY_NAMES.date)),
		city: Yup.string().required(VALIDATION_MESSAGE(DISPLAY_NAMES.city)),
		venue: Yup.string().required(VALIDATION_MESSAGE(DISPLAY_NAMES.venue)),
	});

	useEffect(() => {
		if (id) loadActivitybyID(id).then((a) => setActivity(a!));
	}, [id, loadActivitybyID]);

	function handleFormSubmit(activity: Activity) {
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
			<Header content='Activity Details' sub color='teal' />
			<Formik
				validationSchema={validationSchema}
				enableReinitialize
				initialValues={activity}
				onSubmit={(values) => handleFormSubmit(values)}
			>
				{({ handleSubmit, isValid, isSubmitting, dirty }) => (
					<Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
						<MyTextInput
							name={FIELD_NAMES.title}
							placeholder={DISPLAY_NAMES.title}
						/>
						<MyTextArea
							rows={3}
							name={FIELD_NAMES.description}
							placeholder={DISPLAY_NAMES.description}
						/>
						<MySelectInput
							options={categoryOptions}
							name={FIELD_NAMES.category}
							placeholder={DISPLAY_NAMES.category}
						/>
						<MyDateInput
							name={FIELD_NAMES.date}
							placeholderText={DISPLAY_NAMES.date}
							showTimeSelect
							timeCaption='time'
							dateFormat='MMMM d, yyyy h:mm aa'
						/>
						<Header content='Location Details' sub color='teal' />
						<MyTextInput
							name={FIELD_NAMES.city}
							placeholder={DISPLAY_NAMES.city}
						/>
						<MyTextInput
							name={FIELD_NAMES.venue}
							placeholder={DISPLAY_NAMES.venue}
						/>
						<Button
							disabled={isSubmitting || !dirty || !isValid}
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
				)}
			</Formik>
		</Segment>
	);
}

export default observer(ActivityForm);
