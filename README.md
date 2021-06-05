# Build a Private Blockchain Notary Service

Project Implementation : yameen khan

The project is based on Udacity Nano degree BlockChain Developer Project3.

In this project, you will build a Star Registry Service that allows users to claim ownership of their favorite star in the night sky using private blockchain.

## Steps to follow

1. Clone the repository to your local computer.
2. Open the terminal and install the packages: `npm install`.
3. Open the file `app.js`and `controller.js` and start coding.
4. Run your application `node app.js`
5. Test your Endpoints with Curl or Postman.

## Node.js Framework

In this exercise we used Express.js as web request/response APIs. The following modules are used in Node.js
* [Express.js](http://expressjs.com/) 
* [body-parse](https://www.npmjs.com/package/body-parser)
* [hex2ascii](https://www.npmjs.com/package/hex2ascii)
* [bitcoinjs-message](https://www.npmjs.com/package/bitcoinjs-message)

## Endpoint Documentation

1. POST submitting a validation request

Users start out by submitting a validation request to an API endpoint:

* URL : http://localhost:8000/requestValidation
* Method : POST
* Request :
```javascript
{
	"address":"175E7VGcibPcxTRXt3rSKph4j7o5XidBn4"
}
```
* Response :
```javascript
{
    "walletAddress": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
    "requestTimeStamp": "1546756194",
    "message": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4:1546756194:starRegistry",
    "validationWindow": 300
}
```
* Test : cUrl
```javascript
curl -X POST \
  http://localhost:8000/requestValidation \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: f0084e80-f50f-4132-8f83-49773e150bd8' \
  -H 'cache-control: no-cache' \
  -d '{
	"address":"175E7VGcibPcxTRXt3rSKph4j7o5XidBn4"
}'
```
2. POST sending a valiation request with signature

API that allows you to validate the request based on the signature.

* URL : http://localhost:8000/message-signature/validate
* Method : POST
* Request : 
```javascript
{
	"address":"175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
	"signature": "II8Fk0J4DVo9uy5S1SMJQJJ7kmf7x2aUxAyTB4S9RrzxXvEaarmrK/A6F3uSUAzKcLVoSr/WrhNsCzJZ3mjU+SI="
}
```
* Response : 
```javascript
{
    "registerStar": true,
    "status": {
        "address": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
        "requestTimeStamp": "1546756194",
        "message": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4:1546756194:starRegistry",
        "validationWindow": 257,
        "messageSignature": true
    }
}
```
* Test : cUrl
```javascript
curl -X POST \
  http://localhost:8000/message-signature/validate \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: b7a6102e-bdd5-4cfc-976e-2ad150ff1ae8' \
  -H 'cache-control: no-cache' \
  -d '{
	"address":"175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
	"signature": "II8Fk0J4DVo9uy5S1SMJQJJ7kmf7x2aUxAyTB4S9RrzxXvEaarmrK/A6F3uSUAzKcLVoSr/WrhNsCzJZ3mjU+SI="
}'
```
3. Star registration Endpoint. POST sending a star data to be stored. 

Web API POST endpoint with JSON response that submits the Star information to be saved in the Blockchain.

* URL : http://localhost:8000/block
* Method : POST
* Request : 
```javascript
{
	"address": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
    "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
}
```
* Response:
```javascript
{
    "hash": "2ceb7faffe52e4148f21e7f9feb65cbaec9113108d1acc59a024f5fcdb256032",
    "height": 10,
    "body": {
        "address": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
        }
    },
    "time": "1546756266",
    "previousblockhash": "fc5ea61b01e98e617d7d6be3b0adeebe5d36fce641e6d90632a6af44c0f884cf"
}
```
* Test : cUrl
```javascript
curl -X POST \
  http://localhost:8000/block \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 6aa48936-db93-4d07-9a4d-df3e79d0cf27' \
  -H 'cache-control: no-cache' \
  -d '{
	"address": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
    "star": {
            "dec": "68° 52'\'' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "Found star using https://www.google.com/sky/"
        }
}'
```
4. Star Lookup

Get Star block by hash with JSON response.

* URL : http://localhost:8000/stars/hash:[HASH]
* Method : GET
* Request : hash as URL parameter
* Response : The response includes entire star block contents along with the addition of star story decoded to ASCII.
```javascript
{
    "hash": "2ceb7faffe52e4148f21e7f9feb65cbaec9113108d1acc59a024f5fcdb256032",
    "height": 10,
    "body": {
        "address": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1546756266",
    "previousblockhash": "fc5ea61b01e98e617d7d6be3b0adeebe5d36fce641e6d90632a6af44c0f884cf"
}
```
* Test : cUrl
```javascript
curl -X GET \
  http://localhost:8000/stars/hash:2ceb7faffe52e4148f21e7f9feb65cbaec9113108d1acc59a024f5fcdb256032 \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 8321369c-4278-4024-a5ca-b6476b438b48' \
  -H 'cache-control: no-cache'
```

5. Get Star block by wallet address (blockchain identity) with JSON response.

* URL : http://localhost:8000/stars/address:[ADDRESS]
* Method : GET
* Request : address as URL parameter
* Response :
```javascript
[
    {
        "hash": "921c071a95f710714aa08f910f1296688720fd5d79acc45c00f48c30e7a0c8d2",
        "height": 1,
        "body": {
            "address": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
            "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1546734541",
        "previousblockhash": "4813ea3773307c264ecad86cac4454e7766c7ecae525e010010e35b7a89b0b4c"
    },
    {
        "hash": "2ceb7faffe52e4148f21e7f9feb65cbaec9113108d1acc59a024f5fcdb256032",
        "height": 10,
        "body": {
            "address": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
            "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                "storyDecoded": "Found star using https://www.google.com/sky/"
            }
        },
        "time": "1546756266",
        "previousblockhash": "fc5ea61b01e98e617d7d6be3b0adeebe5d36fce641e6d90632a6af44c0f884cf"
    }
]
```
* Test : cUrl
```javascript
curl -X GET \
  http://localhost:8000/stars/address:175E7VGcibPcxTRXt3rSKph4j7o5XidBn4 \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: e9def009-bd86-4132-b3b7-c25aaad91e78' \
  -H 'cache-control: no-cache'
```

6. Get star block by star block height with JSON response.

* URL : http://localhost:8000/block/[HEIGHT]
* Method : GET
* URL Parameter :  height 
* Response :
```javascript
{
    "hash": "fc5ea61b01e98e617d7d6be3b0adeebe5d36fce641e6d90632a6af44c0f884cf",
    "height": 9,
    "body": {
        "address": "175E7VGcibPcxTRXt3rSKph4j7o5XidBn4",
        "star": {
            "dec": "68° 52' 56.9",
            "ra": "16h 29m 1.0s",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1546756246",
    "previousblockhash": "98cefbd5f7d6c5ce8f73cff9a73b1a665743c3d2df6ec634339d5dbecc195aad"
}
```
* Test : cUrl
```javascript
curl -X GET \
  http://localhost:8000/block/9 \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: c3cd779d-2bd2-4fef-9bf0-197c4167a8ae' \
  -H 'cache-control: no-cache'
```

