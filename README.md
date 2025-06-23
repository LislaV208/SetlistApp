# Setlistify

Narzędzie dla zespołów muzycznych do tworzenia i zarządzania setlistami koncertowymi.

## Stos Technologiczny

- **Framework:** SvelteKit
- **Baza Danych:** SQLite z better-sqlite3
- **Styling:** Tailwind CSS
- **Adapter:** @sveltejs/adapter-node
- **Biblioteki:** svelte-dnd-action (drag-and-drop)

## Funkcjonalności (MVP)

### Zarządzanie Repertuarem
- CRUD dla utworów (dodawanie, edytowanie, usuwanie, wyświetlanie)
- Schemat utworu: title, key, tempo, duration_seconds

### Zarządzanie Setlistami
- Tworzenie nowych setlist
- Usuwanie setlist
- Lista wszystkich setlist

### Edytor Setlisty
- Wyświetlanie utworów w setliście z zachowaniem kolejności
- Dodawanie utworów z repertuaru do setlisty
- Drag-and-drop do zmiany kolejności utworów
- Automatyczne obliczanie sumarycznego czasu trwania setlisty

## Instalacja

```bash
# Klonowanie repozytorium
git clone https://github.com/LislaV208/SetlistApp.git
cd SetlistApp

# Instalacja zależności
npm install

# Uruchomienie serwera deweloperskiego
npm run dev
```

## Struktura Projektu

```
/setlistify
├── src/
│   ├── lib/server/database.js
│   ├── routes/
│   │   ├── +layout.svelte
│   │   ├── +page.svelte
│   │   ├── songs/
│   │   └── setlists/[id]/
└── setlistify.db
```

## Status Rozwoju

- ✅ Kamień Milowy 1: Inicjalizacja i Konfiguracja
- 🔄 Kamień Milowy 2: Baza Danych i CRUD Utworów
- ⏳ Kamień Milowy 3: Zarządzanie Setlistami
- ⏳ Kamień Milowy 4: Drag-and-Drop

## Licencja

MIT
