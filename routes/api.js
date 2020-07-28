'use strict';

const express = require('express');
const { Datastore } = require('@google-cloud/datastore');
const appConfigs = require('../configs/app.json');

const router = express.Router();
const datastore = new Datastore();

const env = process.env.ENVIRONMENT || 'dev';

router.post('/shorten', async (req, res) => {

    let data = req.body;
    console.log(data);

    if (!data['url']) {
        return res.status(400).send('Missing URL');
    }

    let url = data['url'];
    if (!isValidUrl(url)) {
        return res.status(400).send('Invalid URL');
    }

    if (isQkUrl(url)) {
        return res.status(400).send('URL already shortened');
    }

    let path = generateUrlPath(appConfigs.default_path_length);

    let key = datastore.key('Url');
    key.namespace = env;

    let urlEntity = {
        key,
        data: {
            path,
            redirect: url,
            created_at: new Date()
        }
    };
    datastore.insert(urlEntity);

    return res.send({
        url: `${appConfigs.service_url}/${path}`,
        redirect: url
    });
});

const isValidUrl = url => {
    var pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
        'i'
    ); // fragment locator
    return !!pattern.test(url);
};

const isQkUrl = url => {
    var pattern = /^(https?:\/\/)?([a-z\.]+\.)?qk.pt(\/.*)?$/i;
    return !!pattern.test(url);
};

const generateUrlPath = (length) => {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charsLen = chars.length;
    let path = '';
    for (let i = 0; i < length; i++) {
        path += chars.charAt(Math.floor(Math.random() * charsLen));
    }

    return path;
}

module.exports = router;