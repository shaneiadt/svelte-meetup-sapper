<script>
  import { createEventDispatcher, onMount, onDestroy } from "svelte";
  import { scale } from "svelte/transition";
  import { flip } from "svelte/animate";
  import meetups from "../meetups-store.js";
  import MeetupItem from "../components/Meetup/MeetupItem.svelte";
  import MeetupFilter from "../components/Meetup/MeetupFilter.svelte";
  import Button from "../components/UI/Button.svelte";
  import EditMeetup from "../components/Meetup/EditMeetup.svelte";
  import LoadingSpinner from "../components/UI/LoadingSpinner.svelte";

  let fetchedMeetups = [];
  let editMode;
  let editedId;
  let isLoading;

  const dispatch = createEventDispatcher();

  let favsOnly = false;
  let unsubscribe;

  $: filteredMeetups = favsOnly
    ? fetchedMeetups.filter(m => m.isFavorite)
    : fetchedMeetups;

  onMount(() => {
    unsubscribe = meetups.subscribe(items => (fetchedMeetups = items));
    isLoading = true;
    fetch("https://svelte-course-d7811.firebaseio.com/meetups.json")
      .then(res => {
        if (!res.ok) {
          throw new Error("An error occurred fetching.");
        }
        return res.json();
      })
      .then(data => {
        const loadedMeetups = [];
        for (const key in data) {
          loadedMeetups.push({
            ...data[key],
            id: key
          });
        }
        meetups.setMeetups(loadedMeetups.reverse());
        isLoading = false;
      })
      .catch(err => {
        error = err;
        console.error("Something went wrong fetching the data.");
      });
  });

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });

  function setFilter(event) {
    favsOnly = event.detail === 1;
  }

  function saveMeetup() {
    editMode = null;
    editedId = null;
  }

  function cancelEdit() {
    editMode = null;
    editedId = null;
  }

  function startEdit(event) {
    editMode = "edit";
    editedId = event.detail;
  }
</script>

<style>
  #meetups {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 1rem;
  }

  #meetup-controls {
    display: flex;
    justify-content: space-between;
    margin: 1rem;
  }

  @media (min-width: 768px) {
    #meetups {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  #no-meetups {
    margin: 1rem;
    text-align: center;
  }
</style>

<svelte:head>
  <title>All Meetups</title>
</svelte:head>

{#if editMode === 'edit'}
  <EditMeetup id={editedId} on:save={saveMeetup} on:cancel={cancelEdit} />
{/if}
{#if isLoading}
  <LoadingSpinner />
{:else}
  <section id="meetup-controls">
    <MeetupFilter on:select={setFilter} />
    <Button on:click={() => dispatch('add')}>New Meetup</Button>
  </section>

  {#if filteredMeetups.length === 0}
    <p id="no-meetups">No meetups found, start adding some.</p>
  {/if}

  <section id="meetups">
    {#each filteredMeetups as meetup (meetup.id)}
      <div transition:scale animate:flip={{ duration: 300 }}>
        <MeetupItem
          id={meetup.id}
          title={meetup.title}
          subtitle={meetup.subtitle}
          description={meetup.description}
          imageUrl={meetup.imageUrl}
          address={meetup.address}
          contact={meetup.contact}
          isFav={meetup.isFavorite}
          on:showdetails
          on:edit />
      </div>
    {/each}
  </section>
{/if}
