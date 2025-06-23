<script lang="ts">
  import { enhance } from "$app/forms";

  /** @type {{ data: import('./$types').PageData, form: import('./$types').ActionData }} */
  let { data, form } = $props();

  let showCreateForm = $state(false);
  let createFormData = $state({ name: "" });
  let isSubmitting = $state(false);

  // Resetuj formularz po pomyślnym utworzeniu
  $effect(() => {
    if (form?.success) {
      createFormData.name = "";
      showCreateForm = false;
    }
  });

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleCreateSubmit() {
    isSubmitting = true;
    return async ({ update }: { update: () => Promise<void> }) => {
      await update();
      isSubmitting = false;
    };
  }

  function handleDeleteSubmit() {
    return async ({ update }: { update: () => Promise<void> }) => {
      await update();
    };
  }
</script>

<svelte:head>
  <title>Setlisty - Setlistify</title>
</svelte:head>

<div class="px-4 sm:px-6 lg:px-8">
  <!-- Header -->
  <div class="sm:flex sm:items-center">
    <div class="sm:flex-auto">
      <h1 class="text-2xl font-semibold leading-6 text-gray-900">Setlisty</h1>
      <p class="mt-2 text-sm text-gray-700">
        Zarządzaj swoimi setlistami koncertowymi. Twórz, edytuj i organizuj
        swoje występy.
      </p>
    </div>
    <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
      <button
        type="button"
        onclick={() => (showCreateForm = !showCreateForm)}
        class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {showCreateForm ? "Anuluj" : "Nowa setlista"}
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

  <!-- Formularz tworzenia setlisty -->
  {#if showCreateForm}
    <div class="mt-6 bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-base font-semibold leading-6 text-gray-900">
          Utwórz nową setlistę
        </h3>
        <div class="mt-2 max-w-xl text-sm text-gray-500">
          <p>Podaj nazwę dla swojej nowej setlisty koncertowej.</p>
        </div>
        <form
          method="POST"
          action="?/create"
          use:enhance={handleCreateSubmit}
          class="mt-5"
        >
          <div class="w-full sm:max-w-xs">
            <label for="name" class="sr-only">Nazwa setlisty</label>
            <input
              type="text"
              name="name"
              id="name"
              bind:value={createFormData.name}
              placeholder="Nazwa setlisty"
              required
              maxlength="100"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div class="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !createFormData.name.trim()}
              class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {#if isSubmitting}
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                Tworzenie...
              {:else}
                Utwórz setlistę
              {/if}
            </button>
            <button
              type="button"
              onclick={() => (showCreateForm = false)}
              class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- Lista setlist -->
  <div class="mt-8 flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        {#if data.setlists.length === 0}
          <div class="text-center py-12">
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
            <h3 class="mt-2 text-sm font-semibold text-gray-900">
              Brak setlist
            </h3>
            <p class="mt-1 text-sm text-gray-500">
              Zacznij od utworzenia swojej pierwszej setlisty.
            </p>
            <div class="mt-6">
              <button
                type="button"
                onclick={() => (showCreateForm = true)}
                class="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Utwórz pierwszą setlistę
              </button>
            </div>
          </div>
        {:else}
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
                    Nazwa
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Data utworzenia
                  </th>
                  <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span class="sr-only">Akcje</span>
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                {#each data.setlists as setlist (setlist.id)}
                  <tr class="hover:bg-gray-50">
                    <td
                      class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6"
                    >
                      <a
                        href="/setlists/{setlist.id}"
                        class="text-indigo-600 hover:text-indigo-900 hover:underline"
                      >
                        {setlist.name}
                      </a>
                    </td>
                    <td
                      class="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                    >
                      {formatDate(setlist.created_at)}
                    </td>
                    <td
                      class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6"
                    >
                      <div class="flex justify-end gap-2">
                        <a
                          href="/setlists/{setlist.id}"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          Edytuj
                        </a>
                        <form
                          method="POST"
                          action="?/delete"
                          use:enhance={handleDeleteSubmit}
                          class="inline"
                        >
                          <input type="hidden" name="id" value={setlist.id} />
                          <button
                            type="submit"
                            onclick={() =>
                              confirm(
                                "Czy na pewno chcesz usunąć tę setlistę?"
                              )}
                            class="text-red-600 hover:text-red-900"
                          >
                            Usuń
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
