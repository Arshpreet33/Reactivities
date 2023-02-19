import { observer } from 'mobx-react-lite';
import { Fragment } from 'react';
import { Header } from 'semantic-ui-react';
import { useStore } from '../../../app/stores/store';
import ActivityListItem from './ActivityListItem';

function ActivityList() {
	const { activityStore } = useStore();
	const { groupedActivitiesByDate } = activityStore;

	return (
		<>
			{groupedActivitiesByDate.map(([group, activities]) => (
				<Fragment key={group}>
					<Header sub color='teal'>
						{group}
					</Header>
					{activities.map((activity) => (
						<ActivityListItem activity={activity} key={activity.id} />
					))}
				</Fragment>
			))}
		</>
	);
}

export default observer(ActivityList);
