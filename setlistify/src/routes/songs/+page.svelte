<script>
  import { enhance } from "$app/forms";
  import { invalidateAll } from "$app/navigation";

  /** @type {import('./$types').PageProps} */
  let { data, form } = $props();

  // Reaktywny dostęp do songs
  let songs = $derived(data.songs);

  // Stan formularza
  let showAddForm = $state(false);
  /** @type {any} */
  let editingSong = $state(null);
  let isSubmitting = $state(false);

  // Funkcje pomocnicze
  /** @param {number | null | undefined} seconds */
  function formatDuration(seconds) {
    if (!seconds) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  /** @param {number | null | undefined} durationSeconds */
  function parseDuration(durationSeconds) {
    if (!durationSeconds) return { minutes: "", seconds: "" };
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return {
      minutes: minutes > 0 ? minutes.toString() : "",
      seconds: seconds > 0 ? seconds.toString() : "",
    };
  }

  /** @param {any} song */
  function startEdit(song) {
    editingSong = { ...song };
    showAddForm = false;
  }

  function cancelEdit() {
    editingSong = null;
    showAddForm = false;
  }

  function showAdd() {
    showAddForm = true;
    editingSong = null;
  }

  // Enhanced form submission
  function handleSubmit() {
    isSubmitting = true;
    return async (
      /** @type {{ result: any; update: () => Promise<void> }} */ {
        result,
        update,
      }
    ) => {
      isSubmitting = false;
      if (result.type === "success") {
        showAddForm = false;
        editingSong = null;
        await invalidateAll();
      }
      await update();
    };
  }
</script>

<svelte:head>
  <title>Repertuar - Setlistify</title>
</svelte:head>

<div class="px-4 py-6 sm:px-0">
  <!-- Header -->
  <div class="sm:flex sm:items-center">
    <div class="sm:flex-auto">
      <h1 class="text-2xl font-bold leading-6 text-gray-900">Repertuar</h1>
      <p class="mt-2 text-sm text-gray-700">
        Zarządzaj utworami w repertuarze zespołu. Dodawaj nowe utwory, edytuj
        istniejące i organizuj swoją muzykę.
      </p>
    </div>
    <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
      <button
        type="button"
        onclick={showAdd}
        class="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
      >
        Dodaj utwór
      </button>
    </div>
  </div>

  <!-- Komunikaty -->
  {#if form?.success}
    <div class="mt-4 rounded-md bg-green-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-green-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.53a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{form.message}</p>
        </div>
      </div>
    </div>
  {/if}

  {#if form?.error}
    <div class="mt-4 rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{form.error}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Formularz dodawania -->
  {#if showAddForm}
    <div class="mt-6 bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
          Dodaj nowy utwór
        </h3>
        <form method="POST" action="?/create" use:enhance={handleSubmit}>
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label
                for="title"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Tytuł utworu *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={form?.title || ""}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Wprowadź tytuł utworu"
              />
            </div>

            <div>
              <label
                for="key"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Tonacja
              </label>
              <input
                type="text"
                name="key"
                id="key"
                value={form?.key || ""}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="np. C, Am, F#"
              />
            </div>

            <div>
              <label
                for="tempo"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Tempo (BPM)
              </label>
              <input
                type="number"
                name="tempo"
                id="tempo"
                min="1"
                max="300"
                value={form?.tempo || ""}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="120"
              />
            </div>

            <div>
              <label
                for="duration_minutes"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Czas trwania (minuty)
              </label>
              <input
                type="number"
                name="duration_minutes"
                id="duration_minutes"
                min="0"
                max="60"
                value={form?.duration_minutes || ""}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="3"
              />
            </div>

            <div>
              <label
                for="duration_seconds"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Sekundy
              </label>
              <input
                type="number"
                name="duration_seconds"
                id="duration_seconds"
                min="0"
                max="59"
                value={form?.duration_seconds || ""}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="30"
              />
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onclick={cancelEdit}
              class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? "Dodawanie..." : "Dodaj utwór"}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Formularz edycji -->
  {#if editingSong}
    {@const duration = parseDuration(editingSong.duration_seconds)}
    <div class="mt-6 bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
          Edytuj utwór
        </h3>
        <form method="POST" action="?/update" use:enhance={handleSubmit}>
          <input type="hidden" name="id" value={editingSong.id} />
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <label
                for="edit_title"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Tytuł utworu *
              </label>
              <input
                type="text"
                name="title"
                id="edit_title"
                required
                bind:value={editingSong.title}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Wprowadź tytuł utworu"
              />
            </div>

            <div>
              <label
                for="edit_key"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Tonacja
              </label>
              <input
                type="text"
                name="key"
                id="edit_key"
                bind:value={editingSong.key}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="np. C, Am, F#"
              />
            </div>

            <div>
              <label
                for="edit_tempo"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Tempo (BPM)
              </label>
              <input
                type="number"
                name="tempo"
                id="edit_tempo"
                min="1"
                max="300"
                bind:value={editingSong.tempo}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="120"
              />
            </div>
            <div>
              <label
                for="edit_duration_minutes"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Czas trwania (minuty)
              </label>
              <input
                type="number"
                name="duration_minutes"
                id="edit_duration_minutes"
                min="0"
                max="60"
                value={duration.minutes}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="3"
              />
            </div>

            <div>
              <label
                for="edit_duration_seconds"
                class="block text-sm font-medium leading-6 text-gray-900"
              >
                Sekundy
              </label>
              <input
                type="number"
                name="duration_seconds"
                id="edit_duration_seconds"
                min="0"
                max="59"
                value={duration.seconds}
                class="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="30"
              />
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onclick={cancelEdit}
              class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700 transition-colors duration-200"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
  <!-- Lista utworów -->
  <div class="mt-8">
    {#if songs.length === 0}
      <div class="text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-gray-900">Brak utworów</h3>
        <p class="mt-1 text-sm text-gray-500">
          Zacznij od dodania pierwszego utworu do repertuaru.
        </p>
        <div class="mt-6">
          <button
            type="button"
            onclick={showAdd}
            class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors duration-200"
          >
            <svg
              class="-ml-0.5 mr-1.5 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"
              />
            </svg>
            Dodaj pierwszy utwór
          </button>
        </div>
      </div>
    {:else}
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
            Utwory w repertuarze ({songs.length})
          </h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tytuł
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tonacja
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tempo
                  </th>
                  <th
                    scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Czas trwania
                  </th>
                  <th scope="col" class="relative px-6 py-3">
                    <span class="sr-only">Akcje</span>
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each songs as song (song.id)}
                  <tr class="hover:bg-gray-50 transition-colors duration-200">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {song.title}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">{song.key || "-"}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">
                        {song.tempo ? `${song.tempo} BPM` : "-"}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">
                        {formatDuration(song.duration_seconds)}
                      </div>
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                    >
                      <button
                        type="button"
                        onclick={() => startEdit(song)}
                        class="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                      >
                        Edytuj
                      </button>
                      <form
                        method="POST"
                        action="?/delete"
                        use:enhance={handleSubmit}
                        class="inline"
                      >
                        <input type="hidden" name="id" value={song.id} />
                        <button
                          type="submit"
                          class="text-red-600 hover:text-red-900 transition-colors duration-200"
                          onclick={(e) => {
                            if (
                              !confirm("Czy na pewno chcesz usunąć ten utwór?")
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Usuń
                        </button>
                      </form>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
