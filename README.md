# fido-vc-verifier-sidecar

> HTTP sidecar exposing [`fido-vc-cryptosuite-ts`](https://github.com/fido4vc/fido-vc-cryptosuite-ts) verification over HTTP, so non-Node.js verifier stacks (notably walt.id JVM) can validate `fido4vc-jcs-2026`-signed Verifiable Presentations without porting the cryptosuite.
> Part of the [FIDO4VC project](https://fido4vc.github.io).

## What it does

The sidecar is a thin Express service with a single business endpoint:

| Route | Body | Returns |
|---|---|---|
| `GET /test` | — | health-check JSON |
| `POST /verify` | VP (JSON) | `{ verified: true }` or `{ verified: false, error: "..." }` |

Internally, `/verify` calls `getCryptosuiteForDocument(vp)` from [`fido-vc-cryptosuite-ts`](https://github.com/fido4vc/fido-vc-cryptosuite-ts) — it dispatches to whichever registered suite the VP's `proof.cryptosuite` field names. No cryptosuite identifier is hardcoded; adding a new suite means publishing a new version of the cryptosuite-ts package and rebuilding the sidecar.

## Why this exists

The FIDO4VC reference deployment uses [walt.id](https://walt.id) for the cloud wallet, issuer, and verifier APIs. walt.id is JVM/Kotlin; the cryptosuite reference implementation is Node/TS. Rather than maintain a second Kotlin port (though one exists), the sidecar lets walt.id's verifier-policy framework delegate `ldp_vp` verification over a local HTTP call.

walt.id's `LdSignaturePolicy` calls this sidecar at `http://<sidecar-host>:8081/verify`, with `<sidecar-host>` defaulting to `localhost` — i.e. the sidecar runs on the same host (or in the same docker network / Kubernetes pod) as the walt.id verifier. Override `LdSignaturePolicy(baseUrl = ...)` for split-host deployments.

## Prerequisites

- **Node.js ≥ 18**

## Install & run

```bash
git clone https://github.com/fido4vc/fido-vc-verifier-sidecar
cd fido-vc-verifier-sidecar
npm install

# development with ts-node
npm run dev

# production build + start
npm run build && npm start
```

The sidecar listens on `PORT` (default `8081`).

## Configuration

| Env var | Default | Description |
|---|---|---|
| `PORT` | `8081` | TCP port to listen on |

## Example

```bash
curl -s http://localhost:8081/test
# {"message":"LD verifier is working!","timestamp":"...","endpoint":"/test"}

curl -s -X POST http://localhost:8081/verify \
  -H 'Content-Type: application/json' \
  --data @signed-vp.json
# {"verified":true}
```

## Docker

A `Dockerfile` is provided. The recommended deployment uses the multi-service `docker-compose.yml` in the [waltid-identity fork](https://github.com/fido4vc/waltid-identity) under `waltid-applications/fido-vc-app/`, which starts the sidecar alongside the rest of the stack.

## Related projects

Part of the [FIDO4VC project](https://github.com/fido4vc):

- [fido-vc-cryptosuite-ts](https://github.com/fido4vc/fido-vc-cryptosuite-ts) — the cryptosuite this sidecar exposes.
- [waltid-identity fork](https://github.com/fido4vc/waltid-identity) — walt.id with the `LdSignaturePolicy` that calls this sidecar.

## License

Licensed under the [Apache License 2.0](./LICENSE).
