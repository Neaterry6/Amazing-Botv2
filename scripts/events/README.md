# AmazingBot V2 — Event Scripts

Event scripts run automatically on group events (joins, leaves, etc.).

```js
export default {
    config: {
        name: 'eventname',
        author: 'YourName',
        version: '1.0',
        shortDescription: 'What this event does',
        category: 'events',
        role: 0,
    },

    async onStart({ sock, from, participants, action, metadata }) {
        // action: 'add' | 'remove' | 'leave' | 'promote' | 'demote'
        // participants: array of JIDs affected
        // metadata: group metadata object
    },
};
```

See `newevent.eg.js` for a full example.
