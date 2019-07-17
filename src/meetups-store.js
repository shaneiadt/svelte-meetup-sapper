import { writable } from 'svelte/store'

const meetups = writable([])

const customMeetupsStore = {
    subscribe: meetups.subscribe,
    setMeetups: meetupArray => {
        meetups.set(meetupArray)
    },
    addMeetup: meetupData => {
        const newMeetup = {
            ...meetupData,
        }
        meetups.update(items => {
            return [
                newMeetup,
                ...items
            ]
        })
    },
    toggleFavorite: id => {
        meetups.update(items => {
            const updatedMeetup = { ...items.find(m => m.id === id) };
            updatedMeetup.isFavorite = !updatedMeetup.isFavorite;
            const meetupIndex = items.findIndex(m => m.id === id);
            const updatedMeetups = [...items];
            updatedMeetups[meetupIndex] = updatedMeetup;
            return updatedMeetups;
        })
    },
    updateMeetup: (id, data) => {
        meetups.update(items => {
            const meetupIndex = items.findIndex(i => i.id === id)
            const updatedMeetup = {
                ...items[meetupIndex],
                ...data
            }
            const updatedMeetups = [...items]
            updatedMeetups[meetupIndex] = updatedMeetup
            return updatedMeetups
        })
    },
    deleteMeetup: id => {
        meetups.update(items => {
            return items.filter(item => item.id !== id)
        })
    }
}

export default customMeetupsStore