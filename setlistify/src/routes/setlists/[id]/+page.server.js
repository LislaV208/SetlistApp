import { 
	getSetlistById, 
	getSetlistSongs, 
	getAllSongs, 
	addSongToSetlist, 
	removeSongFromSetlist,
	updateSongPositions 
} from '$lib/server/database.js';
import { error, fail } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
	const setlistId = parseInt(params.id);
	
	if (isNaN(setlistId)) {
		throw error(400, 'Nieprawidłowe ID setlisty');
	}

	try {
		// Pobierz setlistę
		const setlist = getSetlistById(setlistId);
		if (!setlist) {
			throw error(404, 'Setlista nie została znaleziona');
		}

		// Pobierz utwory w setliście
		const setlistSongs = getSetlistSongs(setlistId);
		
		// Pobierz wszystkie dostępne utwory
		const allSongs = getAllSongs();
		
		// Filtruj utwory, które nie są jeszcze w setliście
		const setlistSongIds = new Set(setlistSongs.map(/** @param {any} song */ (song) => song.id));
		const availableSongs = allSongs.filter(/** @param {any} song */ (song) => !setlistSongIds.has(song.id));

		// Oblicz całkowity czas trwania setlisty
		const totalDuration = setlistSongs.reduce(/** @param {number} total @param {any} song */ (total, song) => {
			return total + (song.duration_seconds || 0);
		}, 0);

		return {
			setlist,
			setlistSongs,
			availableSongs,
			totalDuration
		};
	} catch (err) {
		console.error('Error loading setlist:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err; // Re-throw SvelteKit errors
		}
		throw error(500, 'Wystąpił błąd podczas ładowania setlisty');
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	addSong: async ({ request, params }) => {
		const setlistId = parseInt(params.id);
		const data = await request.formData();
		const songId = /** @type {string} */ (data.get('songId'));

		if (isNaN(setlistId)) {
			return fail(400, { error: 'Nieprawidłowe ID setlisty' });
		}

		if (!songId || typeof songId !== 'string' || isNaN(parseInt(songId))) {
			return fail(400, { error: 'Nieprawidłowe ID utworu' });
		}

		try {
			// Sprawdź czy setlista istnieje
			const setlist = getSetlistById(setlistId);
			if (!setlist) {
				return fail(404, { error: 'Setlista nie została znaleziona' });
			}

			// Dodaj utwór do setlisty
			addSongToSetlist(setlistId, parseInt(songId));

			return {
				success: true,
				message: 'Utwór został dodany do setlisty'
			};
		} catch (error) {
			console.error('Error adding song to setlist:', error);
			return fail(500, { error: 'Wystąpił błąd podczas dodawania utworu' });
		}
	},

	removeSong: async ({ request, params }) => {
		const setlistId = parseInt(params.id);
		const data = await request.formData();
		const songId = /** @type {string} */ (data.get('songId'));

		if (isNaN(setlistId)) {
			return fail(400, { error: 'Nieprawidłowe ID setlisty' });
		}

		if (!songId || isNaN(parseInt(songId))) {
			return fail(400, { error: 'Nieprawidłowe ID utworu' });
		}

		try {
			// Usuń utwór z setlisty
			const removed = removeSongFromSetlist(setlistId, parseInt(songId));
			
			if (!removed) {
				return fail(404, { error: 'Utwór nie został znaleziony w setliście' });
			}

			return {
				success: true,
				message: 'Utwór został usunięty z setlisty'
			};
		} catch (error) {
			console.error('Error removing song from setlist:', error);
			return fail(500, { error: 'Wystąpił błąd podczas usuwania utworu' });
		}
	},

	reorder: async ({ request, params }) => {
		const setlistId = parseInt(params.id);
		const data = await request.formData();
		const newOrderJson = /** @type {string} */ (data.get('newOrder'));

		if (isNaN(setlistId)) {
			return fail(400, { error: 'Nieprawidłowe ID setlisty' });
		}

		if (!newOrderJson) {
			return fail(400, { error: 'Brak danych o nowej kolejności' });
		}

		try {
			// Parsuj nową kolejność
			const newOrder = JSON.parse(newOrderJson);
			
			if (!Array.isArray(newOrder)) {
				return fail(400, { error: 'Nieprawidłowy format danych kolejności' });
			}

			// Sprawdź czy setlista istnieje
			const setlist = getSetlistById(setlistId);
			if (!setlist) {
				return fail(404, { error: 'Setlista nie została znaleziona' });
			}

			// Przygotuj dane do aktualizacji pozycji
			const songPositions = newOrder.map((songId, index) => ({
				songId: parseInt(songId),
				position: index + 1
			}));

			// Aktualizuj pozycje utworów
			updateSongPositions(setlistId, songPositions);

			return {
				success: true,
				message: 'Kolejność utworów została zaktualizowana'
			};
		} catch (error) {
			console.error('Error reordering songs:', error);
			if (error instanceof SyntaxError) {
				return fail(400, { error: 'Nieprawidłowy format danych JSON' });
			}
			return fail(500, { error: 'Wystąpił błąd podczas zmiany kolejności' });
		}
	}
};
