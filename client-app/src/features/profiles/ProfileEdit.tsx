import { Button, Header, Segment } from 'semantic-ui-react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import MyTextInput from '../../app/common/form/MyTextInput';
import MyTextArea from '../../app/common/form/MyTextArea';
import { useEffect, useState } from 'react';

interface ProfileFormValues {
	displayName: string;
	bio?: string;
}

interface Props extends ProfileFormValues {
	handleProfileEdit: (displayName: string, bio: string) => void;
}

export default function ProfileEdit({ displayName, bio, handleProfileEdit }: Props) {
	const [profile, setProfile] = useState<ProfileFormValues>({ displayName: '', bio: '' });

	useEffect(() => {
		setProfile({ displayName: displayName, bio: bio });
	}, [displayName, bio]);

	const validationSchema = Yup.object({
		displayName: Yup.string().required('Display Name is required'),
	});

	function handleFormSubmit(profile: ProfileFormValues) {
		handleProfileEdit(profile.displayName, profile.bio!);
	}

	return (
		<Segment clearing>
			<Header content='Edit Profile' sub color='teal' />
			<Formik
				validationSchema={validationSchema}
				enableReinitialize
				initialValues={profile}
				onSubmit={(values) => handleFormSubmit(values)}
			>
				{({ handleSubmit, isValid, isSubmitting, dirty }) => (
					<Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
						<MyTextInput name='displayName' placeholder='Display Name' />
						<MyTextArea rows={3} name='bio' placeholder='Bio' />
						<Button
							disabled={isSubmitting || !dirty || !isValid}
							loading={isSubmitting}
							floated='right'
							positive
							type='submit'
							content='Submit'
						></Button>
					</Form>
				)}
			</Formik>
		</Segment>
	);
}
