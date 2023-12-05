'use strict'

const t = require('tap')
const ClientCredentials = require('..')

t.test('client-credentials', async t => {
  const MOCK_CONFIG = {
    CLIENT_ID: 'ID',
    CLIENT_SECRET: 'SECRET',
    SCOPE: 'graph',
    HOST: 'https://oauth-idp',
    REFRESH_PATH: '/refresh',
    AUTHORIZE_PATH: '/oauth/token'
  }
  const TEST_SCOPE = { scope: 'scope' }
  const clientCredentials = new ClientCredentials({
    client: {
      id: MOCK_CONFIG.CLIENT_ID,
      secret: MOCK_CONFIG.CLIENT_SECRET
    },
    auth: {
      authorizePath: MOCK_CONFIG.AUTHORIZE_PATH,
      refreshPath: MOCK_CONFIG.REFRESH_PATH,
      host: MOCK_CONFIG.HOST
    }
  })

  t.ok(clientCredentials)
  t.notOk(await clientCredentials.getTokenOrRefresh())

  t.test('get token returns token object', async t => {
    const mockToken = {
      token_type: 'Bearer',
      expires_in: 500,
      ext_expires_in: 0,
      access_token: 'my-token'
    }
    const scope = t.nock(MOCK_CONFIG.HOST)
      .post(MOCK_CONFIG.AUTHORIZE_PATH)
      .times(2)
      .reply(200, mockToken)
    const token = await clientCredentials.getToken(TEST_SCOPE)

    t.strictSame(token.access_token, mockToken.access_token)
    t.strictSame(token.expires_in, mockToken.expires_in)
    t.notOk(token.isExpired())

    token.expires_in = 0
    await t.test('renew token performs get token and renews it', async t => {
      const token = await clientCredentials.getTokenOrRefresh()
      t.strictSame(token.access_token, mockToken.access_token)
      t.strictSame(token.expires_in, mockToken.expires_in)
      t.notOk(token.isExpired())
    })

    scope.done()
  })

  t.test('get token returns error message if 403', async t => {
    const mockError = {
      message: 'error'
    }
    const scope = t.nock(MOCK_CONFIG.HOST)
      .post(MOCK_CONFIG.AUTHORIZE_PATH)
      .reply(403, mockError)
    try {
      await clientCredentials.getToken(TEST_SCOPE)
      t.fail('test should fail')
    } catch (error) {
      t.strictSame(error, mockError)
    } finally {
      scope.done()
    }
  })

  t.test('get token returns empty if response is empty', async t => {
    const scope = t.nock(MOCK_CONFIG.HOST)
      .post(MOCK_CONFIG.AUTHORIZE_PATH)
      .reply(500)
    try {
      await clientCredentials.getToken(TEST_SCOPE)
      t.fail('test should fail')
    } catch (error) {
      t.strictSame(error, {})
    } finally {
      scope.done()
    }
  })

  t.test('get token returns generic error if no response', async t => {
    try {
      await clientCredentials.getToken(TEST_SCOPE)
      t.fail('test should fail')
    } catch (error) {
      t.ok(error)
    }
  })
})
