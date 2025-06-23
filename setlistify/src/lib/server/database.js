import Database from 'better-sqlite3';
import { join } from 'path';

// Ścieżka do pliku bazy danych w katalogu głównym projektu
const dbPath = join(process.cwd(), 'setlistify.db');

// Inicjalizacja bazy danych
const db = new Database(dbPath);

// Włączenie foreign keys
db.pragma('foreign_keys = ON');

// Inicjalizacja tabel
function initDatabase() {
	// Tabela songs
	db.exec(`
		CREATE TABLE IF NOT EXISTS songs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			key TEXT,
			tempo INTEGER,
			duration_seconds INTEGER,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Tabela setlists
	db.exec(`
		CREATE TABLE IF NOT EXISTS setlists (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Tabela setlist_songs (relacja many-to-many)
	db.exec(`
		CREATE TABLE IF NOT EXISTS setlist_songs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			setlist_id INTEGER NOT NULL,
			song_id INTEGER NOT NULL,
			position INTEGER NOT NULL,
			FOREIGN KEY (setlist_id) REFERENCES setlists(id) ON DELETE CASCADE,
			FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
			UNIQUE(setlist_id, position)
		)
	`);

	console.log('✅ Baza danych zainicjalizowana pomyślnie');
}

// Inicjalizacja bazy danych przy pierwszym uruchomieniu
initDatabase();

// ==================== CRUD OPERATIONS FOR SONGS ====================

// Prepared statements dla lepszej wydajności
const statements = {
	// Songs
	getAllSongs: db.prepare('SELECT * FROM songs ORDER BY title ASC'),
	getSongById: db.prepare('SELECT * FROM songs WHERE id = ?'),
	createSong: db.prepare(`
		INSERT INTO songs (title, key, tempo, duration_seconds)
		VALUES (?, ?, ?, ?)
	`),
	updateSong: db.prepare(`
		UPDATE songs 
		SET title = ?, key = ?, tempo = ?, duration_seconds = ?
		WHERE id = ?
	`),
	deleteSong: db.prepare('DELETE FROM songs WHERE id = ?'),

	// Setlists
	getAllSetlists: db.prepare('SELECT * FROM setlists ORDER BY created_at DESC'),
	getSetlistById: db.prepare('SELECT * FROM setlists WHERE id = ?'),
	createSetlist: db.prepare('INSERT INTO setlists (name) VALUES (?)'),
	deleteSetlist: db.prepare('DELETE FROM setlists WHERE id = ?'),

	// Setlist songs
	getSetlistSongs: db.prepare(`
		SELECT s.*, ss.position 
		FROM songs s 
		JOIN setlist_songs ss ON s.id = ss.song_id 
		WHERE ss.setlist_id = ? 
		ORDER BY ss.position ASC
	`),
	addSongToSetlist: db.prepare(`
		INSERT INTO setlist_songs (setlist_id, song_id, position)
		VALUES (?, ?, ?)
	`),
	removeSongFromSetlist: db.prepare(`
		DELETE FROM setlist_songs 
		WHERE setlist_id = ? AND song_id = ?
	`),
	updateSongPosition: db.prepare(`
		UPDATE setlist_songs 
		SET position = ? 
		WHERE setlist_id = ? AND song_id = ?
	`),
	getMaxPosition: db.prepare(`
		SELECT COALESCE(MAX(position), 0) as max_pos 
		FROM setlist_songs 
		WHERE setlist_id = ?
	`)
};

// ==================== SONGS FUNCTIONS ====================

export function getAllSongs() {
	try {
		return statements.getAllSongs.all();
	} catch (error) {
		console.error('Error getting all songs:', error);
		throw error;
	}
}

/**
 * @param {number|string} id
 */
export function getSongById(id) {
	try {
		return statements.getSongById.get(id);
	} catch (error) {
		console.error('Error getting song by id:', error);
		throw error;
	}
}

/**
 * @param {Object} params
 * @param {string} params.title
 * @param {string|null} params.key
 * @param {number|null} params.tempo
 * @param {number|null} params.duration_seconds
 */
export function createSong({ title, key, tempo, duration_seconds }) {
	try {
		const result = statements.createSong.run(
			title,
			key || null,
			tempo || null,
			duration_seconds || null
		);
		return { id: result.lastInsertRowid, title, key, tempo, duration_seconds };
	} catch (error) {
		console.error('Error creating song:', error);
		throw error;
	}
}

/**
 * @param {number|string} id
 * @param {Object} params
 * @param {string} params.title
 * @param {string|null} params.key
 * @param {number|null} params.tempo
 * @param {number|null} params.duration_seconds
 */
export function updateSong(id, { title, key, tempo, duration_seconds }) {
	try {
		const result = statements.updateSong.run(
			title,
			key || null,
			tempo || null,
			duration_seconds || null,
			id
		);
		if (result.changes === 0) {
			throw new Error('Song not found');
		}
		return getSongById(id);
	} catch (error) {
		console.error('Error updating song:', error);
		throw error;
	}
}

/**
 * @param {number|string} id
 */
export function deleteSong(id) {
	try {
		const result = statements.deleteSong.run(id);
		return result.changes > 0;
	} catch (error) {
		console.error('Error deleting song:', error);
		throw error;
	}
}

// ==================== SETLISTS FUNCTIONS ====================

export function getAllSetlists() {
	try {
		return statements.getAllSetlists.all();
	} catch (error) {
		console.error('Error getting all setlists:', error);
		throw error;
	}
}

/**
 * @param {number|string} id
 */
export function getSetlistById(id) {
	try {
		return statements.getSetlistById.get(id);
	} catch (error) {
		console.error('Error getting setlist by id:', error);
		throw error;
	}
}

/**
 * @param {string} name
 */
export function createSetlist(name) {
	try {
		const result = statements.createSetlist.run(name);
		return { id: result.lastInsertRowid, name };
	} catch (error) {
		console.error('Error creating setlist:', error);
		throw error;
	}
}

/**
 * @param {number|string} id
 */
export function deleteSetlist(id) {
	try {
		const result = statements.deleteSetlist.run(id);
		return result.changes > 0;
	} catch (error) {
		console.error('Error deleting setlist:', error);
		throw error;
	}
}

// ==================== SETLIST SONGS FUNCTIONS ====================

/**
 * @param {number|string} setlistId
 */
export function getSetlistSongs(setlistId) {
	try {
		return statements.getSetlistSongs.all(setlistId);
	} catch (error) {
		console.error('Error getting setlist songs:', error);
		throw error;
	}
}

/**
 * @param {number|string} setlistId
 * @param {number|string} songId
 */
export function addSongToSetlist(setlistId, songId) {
	try {
		// Pobierz następną pozycję
		const maxPosResult = /** @type {{ max_pos: number }} */ (statements.getMaxPosition.get(setlistId));
		const nextPosition = maxPosResult.max_pos + 1;
		
		statements.addSongToSetlist.run(setlistId, songId, nextPosition);
		return true;
	} catch (error) {
		console.error('Error adding song to setlist:', error);
		throw error;
	}
}

/**
 * @param {number|string} setlistId
 * @param {number|string} songId
 */
export function removeSongFromSetlist(setlistId, songId) {
	try {
		const result = statements.removeSongFromSetlist.run(setlistId, songId);
		return result.changes > 0;
	} catch (error) {
		console.error('Error removing song from setlist:', error);
		throw error;
	}
}

/**
 * @param {number|string} setlistId
 * @param {Array<{songId: number|string, position: number}>} songPositions
 */
export function updateSongPositions(setlistId, songPositions) {
	try {
		const updateTransaction = db.transaction(/** @param {Array<{songId: number|string, position: number}>} positions */ (positions) => {
			// Step 1: Set all positions to negative values to avoid conflicts
			for (let i = 0; i < positions.length; i++) {
				const { songId } = positions[i];
				statements.updateSongPosition.run(-(i + 1), setlistId, songId);
			}
			
			// Step 2: Set the correct positive positions
			for (const { songId, position } of positions) {
				statements.updateSongPosition.run(position, setlistId, songId);
			}
		});
		
		updateTransaction(songPositions);
		return true;
	} catch (error) {
		console.error('Error updating song positions:', error);
		throw error;
	}
}

// Graceful shutdown
process.on('exit', () => db.close());
process.on('SIGHUP', () => process.exit(128 + 1));
process.on('SIGINT', () => process.exit(128 + 2));
process.on('SIGTERM', () => process.exit(128 + 15));
