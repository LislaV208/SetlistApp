import { 
	getAllSongs, 
	createSong, 
	updateSong, 
	deleteSong 
} from '$lib/server/database.js';
import { fail } from '@sveltejs/kit';

// Funkcja load - ładuje wszystkie utwory przy wejściu na stronę
export async function load() {
	try {
		const songs = getAllSongs();
		return {
			songs
		};
	} catch (error) {
		console.error('Error loading songs:', error);
		return {
			songs: []
		};
	}
}

// Actions - obsługa formularzy (create, update, delete)
export const actions = {
	// Tworzenie nowego utworu
	create: async ({ request }) => {
		const data = await request.formData();
		const title = /** @type {string} */ (data.get('title'));
		const key = /** @type {string} */ (data.get('key'));
		const tempo = /** @type {string} */ (data.get('tempo'));
		const duration_minutes = /** @type {string} */ (data.get('duration_minutes'));
		const duration_seconds_input = /** @type {string} */ (data.get('duration_seconds'));

		// Walidacja
		if (!title || title.trim().length === 0) {
			return fail(400, {
				error: 'Tytuł utworu jest wymagany',
				title,
				key,
				tempo,
				duration_minutes,
				duration_seconds: duration_seconds_input
			});
		}

		try {
			// Konwersja czasu trwania na sekundy
			let duration_seconds = null;
			if (duration_minutes && !isNaN(Number(duration_minutes))) {
				duration_seconds = parseInt(duration_minutes) * 60;
			}
			if (duration_seconds_input && !isNaN(Number(duration_seconds_input))) {
				duration_seconds = (duration_seconds || 0) + parseInt(duration_seconds_input);
			}

			// Konwersja tempo na liczbę
			const tempoNumber = tempo && !isNaN(Number(tempo)) ? parseInt(tempo) : null;

			const newSong = createSong({
				title: title.trim(),
				key: key && key.trim().length > 0 ? key.trim() : null,
				tempo: tempoNumber,
				duration_seconds
			});

			return {
				success: true,
				message: `Utwor "${newSong.title}" został dodany pomyślnie`,
				song: newSong
			};
		} catch (error) {
			console.error('Error creating song:', error);
			return fail(500, {
				error: 'Błąd podczas dodawania utworu',
				title,
				key,
				tempo,
				duration_minutes,
				duration_seconds: duration_seconds_input
			});
		}
	},

	// Aktualizacja utworu
	update: async ({ request }) => {
		const data = await request.formData();
		const id = /** @type {string} */ (data.get('id'));
		const title = /** @type {string} */ (data.get('title'));
		const key = /** @type {string} */ (data.get('key'));
		const tempo = /** @type {string} */ (data.get('tempo'));
		const duration_minutes = /** @type {string} */ (data.get('duration_minutes'));
		const duration_seconds_input = /** @type {string} */ (data.get('duration_seconds'));

		// Walidacja
		if (!id || !title || title.trim().length === 0) {
			return fail(400, {
				error: 'ID i tytuł utworu są wymagane',
				id,
				title,
				key,
				tempo,
				duration_minutes,
				duration_seconds: duration_seconds_input
			});
		}

		try {
			// Konwersja czasu trwania na sekundy
			let duration_seconds = null;
			if (duration_minutes && !isNaN(Number(duration_minutes))) {
				duration_seconds = parseInt(duration_minutes) * 60;
			}
			if (duration_seconds_input && !isNaN(Number(duration_seconds_input))) {
				duration_seconds = (duration_seconds || 0) + parseInt(duration_seconds_input);
			}

			// Konwersja tempo na liczbę
			const tempoNumber = tempo && !isNaN(Number(tempo)) ? parseInt(tempo) : null;

			const updatedSong = updateSong(parseInt(id), {
				title: title.trim(),
				key: key && key.trim().length > 0 ? key.trim() : null,
				tempo: tempoNumber,
				duration_seconds
			});

			return {
				success: true,
				message: `Utwor "${updatedSong.title}" został zaktualizowany pomyślnie`,
				song: updatedSong
			};
		} catch (error) {
			console.error('Error updating song:', error);
			if (/** @type {Error} */ (error).message === 'Song not found') {
				return fail(404, {
					error: 'Utwor nie został znaleziony'
				});
			}
			return fail(500, {
				error: 'Błąd podczas aktualizacji utworu',
				id,
				title,
				key,
				tempo,
				duration_minutes,
				duration_seconds: duration_seconds_input
			});
		}
	},

	// Usuwanie utworu
	delete: async ({ request }) => {
		const data = await request.formData();
		const id = /** @type {string} */ (data.get('id'));

		if (!id) {
			return fail(400, {
				error: 'ID utworu jest wymagane'
			});
		}

		try {
			const success = deleteSong(parseInt(id));
			
			if (!success) {
				return fail(404, {
					error: 'Utwor nie został znaleziony'
				});
			}

			return {
				success: true,
				message: 'Utwor został usunięty pomyślnie'
			};
		} catch (error) {
			console.error('Error deleting song:', error);
			return fail(500, {
				error: 'Błąd podczas usuwania utworu'
			});
		}
	}
};
