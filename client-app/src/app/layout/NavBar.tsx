import { observer } from 'mobx-react-lite';
import { Link, NavLink } from 'react-router-dom';
import {
	Button,
	Container,
	Dropdown,
	Image,
	Menu,
	MenuItem,
} from 'semantic-ui-react';
import { useStore } from '../stores/store';

function NavBar() {
	const {
		userStore: { user, logout },
	} = useStore();
	return (
		<Menu inverted fixed='top'>
			<Container>
				<Menu.Item as={NavLink} to='/' header>
					<img src='/assets/logo.png' alt='' style={{ marginRight: '10px' }} />
					Reactivities
				</Menu.Item>
				<Menu.Item as={NavLink} to='/activities' name='Activities' />
				<Menu.Item as={NavLink} to='/errors' name='Errors' />
				<Menu.Item>
					<Button
						positive
						content='CreateActivity'
						as={NavLink}
						to='/createActivity'
					/>
				</Menu.Item>
				<MenuItem position='right'>
					<Image
						src={user?.image || '/assets/user.png'}
						avatar
						spaced='right'
					/>
					<Dropdown pointing='top left' text={user?.displayName}>
						<Dropdown.Menu>
							<Dropdown.Item
								as={Link}
								to={`/profiles/${user?.userName}`}
								text='My Profile'
								icon='user'
							/>
							<Dropdown.Item onClick={logout} text='Logout' icon='power' />
						</Dropdown.Menu>
					</Dropdown>
				</MenuItem>
			</Container>
		</Menu>
	);
}

export default observer(NavBar);
