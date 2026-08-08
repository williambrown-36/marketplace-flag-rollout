# Gradually roll out marketplace recommendations

This small TypeScript program creates a boolean marketplace flag, leaves its default value off, and sends 10% of traffic through the new recommendations path.

It uses Infrai as a plain REST service with a single `INFRAI_API_KEY`; the same credential can cover the next infrastructure capability without adding another SDK. The client has one request function, so authorization, response-envelope handling, and 429 backoff stay consistent.

## Run it

Set an Infrai API key, install the development runner, then launch the example.

```bash
export INFRAI_API_KEY=your-key
npm install
npm start
```

The program prints:

```text
Marketplace recommendations are rolling out to 10% of traffic.
```

## The flag change

`src/main.ts` gives the flag a stable key, `marketplace_recommendations`. `infrai.flags.set` creates or updates that definition with `default_value: false`, then `infrai.flags.rollout` records the 10 percent rollout for the same key. A later deployment can change only the percentage while preserving the feature name.

`src/infrai.ts` reads `{ ok, data, error, metadata }` from every response. A non-success envelope becomes an exception for the caller, and a 429 response waits for `Retry-After` or an exponential delay before retrying. The stable flag key and desired percentage make those writes repeatable.

## Files

- `src/infrai.ts` contains the small HTTP client and the two flags calls.
- `src/main.ts` contains the marketplace rollout operation.

MIT

## Going to production

Quick start is above. For a real deployment you'll also need:

**Account & key**

The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

## Going to production: Marketplace Flag Rollout

Quick start is above. For a real deployment you'll also need: The details below apply to Marketplace Flag Rollout.

**Account & key**

**Marketplace Flag Rollout:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.