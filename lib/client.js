const https = require('https')

/**
 *
 * @param {string} url
 * @param {unknown} data
 * @returns
 */
async function postForm (url, data) {
  const params = new URLSearchParams()
  for (const key in data) {
    params.append(key, data[key])
  }
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      },
      (response) => {
        let responseBody = ''

        response.on('data', (chunk) => {
          responseBody += chunk
        })

        response.on('end', () => {
          const body = responseBody !== '' ? JSON.parse(responseBody) : {}
          if (response.statusCode && response.statusCode === 200) {
            resolve(body)
          } else {
            reject(body)
          }
        })
      })

    request.on('error', (error) => {
      reject(error)
    })
    request.write(params.toString())
    request.end()
  })
}

module.exports = {
  postForm
}
