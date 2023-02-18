import React, { useEffect, useState } from 'react';
import { Container } from 'semantic-ui-react';
import { Activity } from '../models/activity';
import NavBar from './NavBar';
import ActivityDashboard from '../../features/activities/dashboard/ActivityDashboard';
import { v4 as uuid } from 'uuid';
import agent from '../api/agent';
import LoadingComponent from './LoadingComponent';

function App() {
	const [activities, setActivities] = useState<Activity[]>([]);
	const [selectedActivity, setSelectedActivity] = useState<
		Activity | undefined
	>(undefined);
	const [editMode, setEditMode] = useState(false);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	function handleSelectActivity(id: string) {
		setSelectedActivity(activities.find((activity) => activity.id === id));
	}

	function handleCancelSelectActivity() {
		setSelectedActivity(undefined);
	}

	function handleFormOpen(id?: string) {
		id ? handleSelectActivity(id) : handleCancelSelectActivity();
		setEditMode(true);
	}

	function handleFormClose() {
		setEditMode(false);
	}

	function handleCreateOrEditActivity(activity: Activity) {
		setSubmitting(true);
		if (activity.id) {
			agent.Activities.edit(activity).then(() => {
				setActivities([
					...activities.filter((a) => a.id !== activity.id),
					activity,
				]);
				setEditMode(false);
				setSelectedActivity(activity);
				setSubmitting(false);
			});
		} else {
			const newActivity = { ...activity, id: uuid() };
			agent.Activities.create(newActivity).then(() => {
				setActivities([...activities, newActivity]);
				setEditMode(false);
				setSelectedActivity(activity);
				setSubmitting(false);
			});
		}
	}

	function handleDeleteActivity(id: string) {
		setSubmitting(true);

		agent.Activities.delete(id).then(() => {
			setActivities(activities.filter((a) => a.id !== id));
			setSubmitting(false);
		});
	}

	useEffect(() => {
		agent.Activities.list().then((response) => {
			let activityList: Activity[] = [];

			response.forEach((a) => {
				a.date = a.date.split('T')[0];
				activityList.push(a);
			});

			setActivities(activityList);
			setLoading(false);
		});
	}, []);

	if (loading) return <LoadingComponent content='Loading Activities' />;

	return (
		<>
			<NavBar openForm={handleFormOpen} />
			<Container style={{ marginTop: '7em' }}>
				<ActivityDashboard
					activities={activities}
					selectedActivity={selectedActivity}
					selectActivity={handleSelectActivity}
					cancelSelectActivity={handleCancelSelectActivity}
					editMode={editMode}
					openForm={handleFormOpen}
					closeForm={handleFormClose}
					createOrEditActivity={handleCreateOrEditActivity}
					deleteActivity={handleDeleteActivity}
					submitting={submitting}
				/>
			</Container>
		</>
	);
}

export default App;
