import { ErrorMessage, Form, Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import { Button, Header } from 'semantic-ui-react';
import MyTextInput from '../../app/common/form/MyTextInput';
import { useStore } from '../../app/stores/store';
import * as Yup from 'yup';
import ValidationErrors from '../errors/ValidationErrors';

export const enum USER_DISPLAY_NAMES {
	email = 'Email',
	password = 'Password',
	confirmPassword = 'Confirm Password',
	username = 'Username',
	displayName = 'Display Name',
}

export const enum USER_FIELD_NAMES {
	email = 'email',
	password = 'password',
	confirmPassword = 'confirmPassword',
	username = 'username',
	displayName = 'displayName',
}

function RegisterForm() {
	const { userStore } = useStore();

	return (
		<Formik
			initialValues={{
				displayName: '',
				username: '',
				email: '',
				password: '',
				error: null,
			}}
			onSubmit={(values, { setErrors }) =>
				userStore.register(values).catch((error) => setErrors({ error: error }))
			}
			validationSchema={Yup.object({
				displayName: Yup.string().required(),
				username: Yup.string().required(),
				email: Yup.string().required(),
				password: Yup.string().required(),
			})}
		>
			{({ handleSubmit, isSubmitting, errors, isValid, dirty }) => (
				<Form
					className='ui form error'
					onSubmit={handleSubmit}
					autoComplete='off'
				>
					<Header
						as='h2'
						content='Sign Up to Reactivities'
						color='teal'
						textAlign='center'
					/>
					<MyTextInput
						placeholder={USER_DISPLAY_NAMES.displayName}
						name={USER_FIELD_NAMES.displayName}
					/>
					<MyTextInput
						placeholder={USER_DISPLAY_NAMES.email}
						name={USER_FIELD_NAMES.email}
					/>
					<MyTextInput
						placeholder={USER_DISPLAY_NAMES.username}
						name={USER_FIELD_NAMES.username}
					/>
					<MyTextInput
						placeholder={USER_DISPLAY_NAMES.password}
						name={USER_FIELD_NAMES.password}
						type='password'
					/>
					<ErrorMessage
						name='error'
						render={() => <ValidationErrors errors={errors.error} />}
					/>
					<Button
						disabled={!isValid || !dirty || isSubmitting}
						loading={isSubmitting}
						positive
						content='Register'
						type='submit'
						fluid
					/>
				</Form>
			)}
		</Formik>
	);
}

export default observer(RegisterForm);
