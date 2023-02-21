import { ErrorMessage, Form, Formik } from 'formik';
import { observer } from 'mobx-react-lite';
import { Button, Header, Label } from 'semantic-ui-react';
import MyTextInput from '../../app/common/form/MyTextInput';
import { useStore } from '../../app/stores/store';
import { USER_DISPLAY_NAMES, USER_FIELD_NAMES } from './RegisterForm';

function LoginForm() {
	const { userStore } = useStore();

	return (
		<Formik
			initialValues={{ email: '', password: '', error: null }}
			onSubmit={(values, { setErrors }) =>
				userStore
					.login(values)
					.catch((error) => setErrors({ error: 'Invalid email or password' }))
			}
		>
			{({ handleSubmit, isSubmitting, errors }) => (
				<Form className='ui form' onSubmit={handleSubmit} autoComplete='off'>
					<Header
						as='h2'
						content='Login to Reactivities'
						color='teal'
						textAlign='center'
					/>
					<MyTextInput
						placeholder={USER_DISPLAY_NAMES.email}
						name={USER_FIELD_NAMES.email}
					/>
					<MyTextInput
						placeholder={USER_DISPLAY_NAMES.password}
						name={USER_FIELD_NAMES.password}
						type='password'
					/>
					<ErrorMessage
						name='error'
						render={() => (
							<Label
								style={{ marginBottom: 10 }}
								basic
								color='red'
								content={errors.error}
							/>
						)}
					/>
					<Button
						loading={isSubmitting}
						positive
						content='Login'
						type='submit'
						fluid
					/>
				</Form>
			)}
		</Formik>
	);
}

export default observer(LoginForm);
