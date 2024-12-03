import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')


const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJQKdbRYzVT7jSMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi15MHFwaDBhZGo3eWt2Y2dyLnVzLmF1dGgwLmNvbTAeFw0yNDA4MjUx
NTE4NTJaFw0zODA1MDQxNTE4NTJaMCwxKjAoBgNVBAMTIWRldi15MHFwaDBhZGo3
eWt2Y2dyLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMlyIcjsTb4g5dOewNinc7rFMPmi52lS2cRB86+8viUIUBhc21qsNFwxhl3P
cb50lZXAATnxTRrAp+empQUFtNO790/Sdd4DaRmicbYjkfyLOtexXC07voqIbTZh
vcRVJ3yIpBcyk6qk+/OVDrZugT/5itDfdwHCvP7QV46XGSPH2FzcFlEjdG/xizx+
z4tSouHrWhDhKtwGpIVEsfAW1B49F9YADXVcVmKw68LZNWhCXwKWu+AilDKRma8g
THcQPmJQfYvd5r7tOMqmZI0JZq1yBgXiD1+fl5Cz2dXgD7xGOc1cGa8fB7cWTk4E
pAB3nkuycbFImEaJZ4pNHyJirNECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUsEtfBFvn7bWxC4NbiK+Yhdhn8v8wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQCuGG5Tqr8ZBlkYKMv+X6dliE3HnWFlvuVd8rTWVSlh
RjEiH/pHfQfEX6nh3amybJkybRIwds4+V6WeMhZSv/+z2cRiPXqg8IeA6zmlpQd/
S53//Zi7KeqG4U188NuEWwe+/f4FMLUecUFXIxss4Yc8A1VW3/bafAVPNg37wH2t
s7zv5XQXrtuzY/S6tMdDlIsC9w/HrzlRsiTpuCnUz6iXGTiM0DTKhb6GyIFCxx8y
cIAeYmvMuYv7X1HfEJPVeF9+5frZA6i5S2jW7bRQwpoY5pup8K5ButwKJNArqKDG
yteeDc8aACNPwb7lZh4+QGQRKHXWFBYgzqHrKkSmHWKv
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  return jsonwebtoken.verify(token, certificate, {algorithms: ['RS256']});
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
