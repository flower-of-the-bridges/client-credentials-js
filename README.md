# Client Credentials JS

Client Credentials OAuth2.0 flow written in plain Javascript.

## Install

```
npm i --save client-credentials-js
```

## Usage

```js
const ClientCredentials = require('client-credentials-js')
// create client
const clientCredentials = new ClientCredentials({
    client: {
      id: '<your client id>',
      secret: '<your client secret>',
      // additional parameters (scope, audience, etc...)
    },
    auth: {
      authorizePath: '/oauth/token',
      refreshPath: 'refresh',
      host: MOCK_CONFIG.HOST
    }
})
// get token
const token = await clientCredentials.getToken()

console.log(token.access_token) // some jwt...
console.log(token.expires_in) // 3600 (seconds)
console.log(token.token_type) // 'Bearer'

// check if token is expired
console.log(token.isExpired()) // true

// return token if not expired, otherwise refresh
const token = await clientCredentials.getTokenOrRefresh()
```

### Examples

The following object represents allowed client configurations that can be used for several identity providers.

#### Microsoft

```json
{
    "client": {
        "id": "<your client id>",
        "secret": "<your client secret>",
        "scope": "default"
    }
}
```

#### Auth0

```json
{
    "client": {
        "id": "<your client id>",
        "secret": "<your client secret>",
        "audience": "default"
    }
}
```