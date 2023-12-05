const https = require('https')

async function postForm (url, form) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form
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

    request.end()
  })
}

module.exports = {
  postForm
}
