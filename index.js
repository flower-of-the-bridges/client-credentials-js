'use strict'
const path = require('path')
const { postForm } = require('./lib/client')

class Token {
  constructor (token) {
    this.token_type = token.token_type
    this.expires_in = Number(token.expires_in)
    this.access_token = token.access_token
    this.timestamp = new Date()
  }

  isExpired () {
    return new Date().getTime() - this.timestamp.getTime() > this.expires_in * 1000
  }
}

class ClientCredentials {
  /**
     *
     * @param {{
     *  client: {id: string, secret: string, scope: string},
     *  auth: {host: string, authorizePath: string, refreshPath: string}
     * }} config
    */
  constructor ({ client, auth }) {
    this.client = client
    this.host = auth.host
    this.authorize = auth.authorizePath
    this.refresh = auth.refreshPath

    this.token = null
  }

  /**
   *
   * @param {unknown} scope
   * @returns {Promise<Token>}
   */
  async getToken () {
    const oauthToken = await postForm(path.join(this.host, this.authorize), {
      grant_type: 'client_credentials',
      client_id: this.client.id,
      client_secret: this.client.secret,
      ...this.client.scope
    })
    this.token = new Token(oauthToken)
    return this.token
  }

  async getTokenOrRefresh () {
    if (this.token?.isExpired()) {
      return this.getToken()
    } else {
      return this.token
    }
  }
}

module.exports = ClientCredentials
