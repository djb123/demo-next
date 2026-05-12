export interface CatImage {
	id: string;
	url: string;
	width?: number;
	height?: number;
	breeds?: { name: string; id: string }[];
	categories?: { id: number; name: string }[];
}

export interface FavoriteCat {
	id?: number;
	catApiId?: string;
	imageUrl?: string;
	imageDataUrl?: string;
	isUploaded: boolean;
	name?: string;
	addedAt: Date;
}

export interface CalendarRecord {
	id?: number;
	name: string;
	year: number;
	photoIds: (number | null)[];
	createdAt: Date;
}

export interface CalendarEvent {
	id?: number;
	calendarId: number;
	date: string;
	title: string;
	color?: string;
	textColor?: string;
	emoji?: string;
}
