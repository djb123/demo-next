import Dexie, { type Table } from 'dexie';
import type { FavoriteCat, CalendarRecord, CalendarEvent } from './types.js';

class CatCalendarDB extends Dexie {
	favorites!: Table<FavoriteCat, number>;
	calendars!: Table<CalendarRecord, number>;
	calendarEvents!: Table<CalendarEvent, number>;

	constructor() {
		super('CatCalendarDB');
		this.version(1).stores({
			favorites: '++id, catApiId, isUploaded, addedAt',
			calendars: '++id, name, year, createdAt',
			calendarEvents: '++id, calendarId, date'
		});
	}
}

export const db = new CatCalendarDB();
