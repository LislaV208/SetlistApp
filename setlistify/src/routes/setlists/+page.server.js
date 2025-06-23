import { getAllSetlists, createSetlist, deleteSetlist } from '$lib/server/database.js';
import { fail, redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		const setlists = getAllSetlists();
		return {
			setlists
		};
	} catch (error) {
		console.error('Error loading setlists:', error);
		return {
			setlists: []
		};
	}
}

/** @type {import('./$types').Actions} */
export const actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name');

		// Walidacja
		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return fail(400, {
				error: 'Nazwa setlisty jest wymagana',
				name: name || ''
			});
		}

		if (name.trim().length > 100) {
			return fail(400, {
				error: 'Nazwa setlisty nie może być dłuższa niż 100 znaków',
				name: name || ''
			});
		}

		try {
			const setlist = createSetlist(name.trim());
			return {
				success: true,
				message: `Setlista "${name.trim()}" została utworzona pomyślnie`,
				setlist
			};
		} catch (error) {
			console.error('Error creating setlist:', error);
			return fail(500, {
				error: 'Wystąpił błąd podczas tworzenia setlisty',
				name: name || ''
			});
		}
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = /** @type {string} */ (data.get('id'));

		if (!id || isNaN(parseInt(id))) {
			return fail(400, {
				error: 'Nieprawidłowe ID setlisty'
			});
		}

		try {
			const deleted = deleteSetlist(parseInt(id));
			if (!deleted) {
				return fail(404, {
					error: 'Setlista nie została znaleziona'
				});
			}

			return {
				success: true,
				message: 'Setlista została usunięta pomyślnie'
			};
		} catch (error) {
			console.error('Error deleting setlist:', error);
			return fail(500, {
				error: 'Wystąpił błąd podczas usuwania setlisty'
			});
		}
	}
};
