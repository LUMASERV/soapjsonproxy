const soap = require('soap')
const express = require('express')
const bearerToken = require('express-bearer-token')
const { XMLParser } = require('fast-xml-parser')

const app = express()

app.use(express.json())

if(process.env.API_KEY) {
    app.use(bearerToken())
}

function findKeyRecursive(obj, key) {
    if(typeof(obj) != 'object' || Array.isArray(obj))
        return null
    if(obj[key])
        return obj[key]
    for(let k of Object.keys(obj)) {
        let v = findKeyRecursive(obj[k], key)
        if(v)
            return v
    }
    return null
}

function filterPassword(req, password) {
    if(!password)
        return req
    return req.replace(password, '***')
}

app.post('/', async (req, res) => {
    if(process.env.API_KEY && process.env.API_KEY != req.token) {
        res.status(401).send({
            'error': 'Authorization required!'
        })
        return
    }
    try {
        let client = await soap.createClientAsync(req.body.wsdl)
        if(req.body.username) {
            client.setSecurity(new soap.WSSecurity(req.body.username, req.body.password))
        }
        const action = client[req.body.action + 'Async']
        const [actionRes] = await action(req.body.args)
        if(req.body.logging) {
            res.set({
                'X-Log-Request': filterPassword(client.lastRequest, req.body.password),
                'X-Log-Response': client.lastResponse
            })
        }
        res.send(actionRes)
    } catch(err) {
        if(err.response && err.response.status) {
            const xml = (new XMLParser()).parse(err.body)
            res.status(err.response.status != 200 ? err.response.status : 500)
            if(req.body.logging) {
                res.set({
                    'X-Log-Request': filterPassword(err.response.config.data, req.body.password),
                    'X-Log-Response': err.body
                })
            }
            res.send({
                error: findKeyRecursive(xml, 'faultstring') || xml
            })
        } else {
            res.status(500).send({ error: 'Server Error' })
            console.error(err)
        }
    }
})

app.listen(parseInt(process.env.HTTP_PORT || 80))