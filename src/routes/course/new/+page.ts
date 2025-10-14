import { initializeCourse } from '$lib/courseStores';
import type { PageLoad } from './$types';

export const ssr = false; // Disable SSR for this page since it uses stores with localStorage

export const load: PageLoad = async () => {
	// Return initial course data
	return {
		initialCourse: initializeCourse({})
	};
};
