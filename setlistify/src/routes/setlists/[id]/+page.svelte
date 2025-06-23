<script lang="ts">
  import { enhance } from "$app/forms";
  import { dndzone } from "svelte-dnd-action";
  import { flip } from "svelte/animate";

  /** @type {{ data: import('./$types').PageData, form: import('./$types').ActionData }} */
  let { data, form } = $props();

  let isSubmitting = $state(false);
  let showAvailableSongs = $state(false);
  let dragDisabled = $state(false);
  let items: any[] = $state([]);

  // Initialize items from setlist songs
  $effect(() => {
    items = data.setlistSongs.map(function(song: any, index: number) {
      return {
        id: song.id,
        ...song,
        position: index + 1
      };
    });
  });

  // Resetuj stan po pomyślnej akcji
  $effect(() => {
    if (form?.success) {
      isSubmitting = false;
    }
  });

  function formatDuration(seconds: number | null | undefined): string {
    if (!seconds) return "--:--";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function formatTotalDuration(totalSeconds: number): string {
    if (!totalSeconds) return "0:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  function handleAddSong() {
    isSubmitting = true;
    return async ({ update }: { update: () => Promise<void> }) => {
      await update();
      isSubmitting = false;
    };
  }

  function handleRemoveSong() {
    isSubmitting = true;
    return async ({ update }: { update: () => Promise<void> }) => {
      await update();
      isSubmitting = false;
    };
  }

  function handleDndConsider(e: CustomEvent) {
    items = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent) {
    items = e.detail.items;
    // Send the reorder request to the server
    const newOrder = items.map(/** @param {any} item */ (item) => item.id);
    submitReorder(newOrder);
  }

  async function submitReorder(newOrder: number[]) {
    const formData = new FormData();
    formData.append('newOrder', JSON.stringify(newOrder));
    
    try {
      const response = await fetch('?/reorder', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Order updated successfully');
      } else {
        console.error('Failed to update order');
        // Revert changes on error
        items = data.setlistSongs.map(function(song: any, index: number) {
          return {
            id: song.id,
            ...song,
            position: index + 1
          };
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      // Revert changes on error
      items = data.setlistSongs.map(function(song: any, index: number) {
        return {
          id: song.id,
          ...song,
          position: index + 1
        };
      });
    }
  }

  // Drag and drop is always enabled
</script>

<svelte:head>
  <title>{data.setlist.name} - Setlistify</title>
</svelte:head>

<div class="px-4 sm:px-6 lg:px-8">
  <!-- Header -->
  <div class="sm:flex sm:items-center">
    <div class="sm:flex-auto">
      <nav class="flex" aria-label="Breadcrumb">
        <ol class="flex items-center space-x-4">
          <li>
            <div>
              <a href="/setlists" class="text-gray-400 hover:text-gray-500">
                <span class="sr-only">Setlisty</span>
                Setlisty
              </a>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg
                class="h-5 w-5 flex-shrink-0 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
              </svg>
              <span class="ml-4 text-sm font-medium text-gray-500"
                >{data.setlist.name}</span
              >
            </div>
          </li>
        </ol>
      </nav>
      <h1 class="mt-2 text-2xl font-semibold leading-6 text-gray-900">
        {data.setlist.name}
      </h1>
      <p class="mt-2 text-sm text-gray-700">
        Edytuj swoją setlistę. Dodawaj utwory, zmieniaj kolejność i zarządzaj
        swoim występem.
      </p>
    </div>
    <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
      <button
        type="button"
        onclick={() => (showAvailableSongs = !showAvailableSongs)}
        class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {showAvailableSongs ? "Ukryj utwory" : "Dodaj utwory"}
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

  <!-- Dostępne utwory -->
  {#if showAvailableSongs}
    <div class="mt-6 bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-6 text-gray-900">
          Dostępne utwory
        </h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500">
          <p>Wybierz utwory z repertuaru, które chcesz dodać do setlisty.</p>
        </div>
        {#if data.availableSongs.length === 0}
          <div class="mt-4 text-center py-6">
            <p class="text-sm text-gray-500">
              Wszystkie utwory z repertuaru są już w tej setliście.
            </p>
            <div class="mt-4">
              <a
                href="/songs"
                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
              >
                Dodaj nowe utwory do repertuaru
              </a>
            </div>
          </div>
        {:else}
          <div
            class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {#each data.availableSongs as song (song.id)}
              <div
                class="relative rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm hover:border-gray-400"
              >
                <div class="flex items-center justify-between">
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">
                      {song.title}
                    </p>
                    <div
                      class="mt-1 flex items-center space-x-2 text-xs text-gray-500"
                    >
                      {#if song.key}
                        <span
                          class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                        >
                          {song.key}
                        </span>
                      {/if}
                      {#if song.tempo}
                        <span>{song.tempo} BPM</span>
                      {/if}
                      {#if song.duration_seconds}
                        <span>{formatDuration(song.duration_seconds)}</span>
                      {/if}
                    </div>
                  </div>
                  <form
                    method="POST"
                    action="?/addSong"
                    use:enhance={handleAddSong}
                    class="ml-3"
                  >
                    <input type="hidden" name="songId" value={song.id} />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      class="inline-flex items-center rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {#if isSubmitting}
                        <svg
                          class="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            class="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            stroke-width="4"
                          ></circle>
                          <path
                            class="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Dodawanie...
                      {:else}
                        Dodaj
                      {/if}
                    </button>
                  </form>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Setlista -->
  <div class="mt-8">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h2 class="text-lg font-semibold leading-6 text-gray-900">
          Utwory w setliście
        </h2>
        {#if data.totalDuration > 0}
          <p class="mt-1 text-sm text-gray-600">
            Całkowity czas trwania: <span class="font-medium"
              >{formatTotalDuration(data.totalDuration)}</span
            >
          </p>
        {/if}
      </div>
    </div>

    {#if items.length === 0}
      <div class="mt-6 text-center py-12">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-semibold text-gray-900">Pusta setlista</h3>
        <p class="mt-1 text-sm text-gray-500">
          Zacznij od dodania pierwszego utworu do setlisty.
        </p>
        <div class="mt-6">
          <button
            type="button"
            onclick={() => (showAvailableSongs = true)}
            class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Dodaj pierwszy utwór
          </button>
        </div>
      </div>
    {:else}
      <div class="mt-6 flow-root">
        <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8"
          >
            <div
              class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      #
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tytuł
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tonacja
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tempo
                    </th>
                    <th
                      scope="col"
                      class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Czas
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span class="sr-only">Akcje</span>
                    </th>
                  </tr>
                </thead>
                <tbody 
                  class="divide-y divide-gray-200 bg-white"
                  use:dndzone={{ 
                    items, 
                    dragDisabled,
                    type: "setlist-songs",
                    flipDurationMs: 300,
                    dropTargetStyle: {},
                    morphDisabled: true
                  }}
                  onconsider={handleDndConsider}
                  onfinalize={handleDndFinalize}
                >
                  {#each items as song, index (song.id)}
                    <tr 
                      class="hover:bg-gray-50 {dragDisabled ? '' : 'cursor-move'}"
                      animate:flip={{ duration: 300 }}
                    >
                      <td
                        class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                      >
                        <div class="flex items-center">
                          <div
                            class="mr-2 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                            aria-label="Przeciągnij aby zmienić kolejność"
                          >
                            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </div>
                          {index + 1}
                        </div>
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-900"
                      >
                        {song.title}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {song.key || "--"}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {song.tempo ? `${song.tempo} BPM` : "--"}
                      </td>
                      <td
                        class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                      >
                        {formatDuration(song.duration_seconds)}
                      </td>
                      <td
                        class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                      >
                        <form
                          method="POST"
                          action="?/removeSong"
                          use:enhance={handleRemoveSong}
                          class="inline"
                        >
                          <input type="hidden" name="songId" value={song.id} />
                          <button
                            type="submit"
                            onclick={() =>
                              confirm(
                                "Czy na pewno chcesz usunąć ten utwór z setlisty?"
                              )}
                            class="text-red-600 hover:text-red-900"
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
      </div>
    {/if}
  </div>
</div>
