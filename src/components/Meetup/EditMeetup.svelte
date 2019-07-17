<script>
  import meetups from "../../meetups-store.js";
  import { createEventDispatcher } from "svelte";
  import TextInput from "../UI/TextInput.svelte";
  import Button from "../UI/Button.svelte";
  import Modal from "../UI/Modal.svelte";
  import { isEmpty, isEmail } from "../../helpers/validation";

  export let id;
  let title = "",
    subtitle = "",
    description = "",
    imageUrl = "",
    contact = "",
    address = "";

  if (id) {
    const unsub = meetups.subscribe(items => {
      const selectedMeetup = items.find(i => i.id === id);
      title = selectedMeetup.title;
      subtitle = selectedMeetup.subtitle;
      description = selectedMeetup.description;
      imageUrl = selectedMeetup.imageUrl;
      contact = selectedMeetup.contact;
      address = selectedMeetup.address;
    });
    unsub();
  }

  const dispatch = createEventDispatcher();

  $: titleValid = !isEmpty(title);
  $: subtitleValid = !isEmpty(subtitle);
  $: descriptionValid = !isEmpty(description);
  $: imageValid = !isEmpty(imageUrl);
  $: contactValid = isEmail(contact);
  $: addressValid = !isEmpty(address);
  $: formIsValid =
    titleValid &&
    subtitleValid &&
    descriptionValid &&
    imageValid &&
    contactValid &&
    addressValid;

  function submitForm() {
    const meetupData = {
      title,
      subtitle,
      description,
      imageUrl,
      contact,
      address
    };
    if (id) {
      fetch(`https://svelte-course-d7811.firebaseio.com/meetups/${id}.json`, {
        method: "PATCH",
        body: JSON.stringify(meetupData),
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error("An error ocurred");
          }
          meetups.updateMeetup(id, meetupData);
        })
        .catch(err => console.error(err));
    } else {
      fetch("https://svelte-course-d7811.firebaseio.com/meetups.json", {
        method: "POST",
        body: JSON.stringify({ ...meetupData, isFavorite: false }),
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error("An error ocurred");
          }
          return res.json();
        })
        .then(data => {
          meetups.addMeetup({
            ...meetupData,
            isFavorite: false,
            id: data.name
          });
        })
        .catch(err => console.error(err));
    }
    dispatch("save");
  }

  function cancel() {
    dispatch("cancel");
  }

  function deleteMeetup() {
    fetch(`https://svelte-course-d7811.firebaseio.com/meetups/${id}.json`, {
      method: "DELETE"
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("An error ocurred");
        }
        meetups.deleteMeetup(id);
        dispatch("save");
      })
      .catch(err => console.error(err));
  }
</script>

<style>
  form {
    width: 100%;
  }
</style>

<Modal title="Edit Meetup" on:cancel>
  <form on:submit|preventDefault={submitForm}>
    <TextInput
      id="title"
      label="Title"
      valid={titleValid}
      validMsg="Please enter a valid title"
      value={title}
      on:input={event => (title = event.target.value)} />
    <TextInput
      id="subtitle"
      label="SubTitle"
      valid={subtitleValid}
      validMsg="Please enter a valid subtitle"
      value={subtitle}
      on:input={event => (subtitle = event.target.value)} />
    <TextInput
      id="address"
      label="Address"
      valid={addressValid}
      validMsg="Please enter a valid address"
      value={address}
      on:input={event => (address = event.target.value)} />
    <TextInput
      id="imageUrl"
      label="Image URL"
      valid={imageValid}
      validMsg="Please enter a valid image URL"
      value={imageUrl}
      on:input={event => (imageUrl = event.target.value)} />
    <TextInput
      id="contact"
      label="Contact"
      valid={contactValid}
      validMsg="Please enter a valid contact email"
      type="email"
      value={contact}
      on:input={event => (contact = event.target.value)} />
    <TextInput
      id="description"
      label="Description"
      valid={descriptionValid}
      validMsg="Please enter a valid description"
      controlType="textarea"
      value={description}
      bind:value={description}
      on:input={event => (description = event.target.value)} />
  </form>
  <div slot="footer">
    <Button type="button" mode="outline" on:click={cancel}>Cancel</Button>
    <Button type="button" on:click={submitForm} disabled={!formIsValid}>
      Save
    </Button>
    {#if id}
      <Button type="button" on:click={deleteMeetup}>Delete</Button>
    {/if}
  </div>
</Modal>
