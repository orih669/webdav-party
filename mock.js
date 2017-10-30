const fs = require('fs');
const url = require('url');
const path = require('path');
const http = require('http');
const utils = require('./utils.js');
const config = require('./config.js');
const logger = require('./logger.js')('default');


http.createServer(function (request, response)
{
    logger.endBlocks();
    logger.debug('==================== request ====================');
    logger.startBlock();
    logger.debug('method: ' + request.method);
    logger.debug('url: ' + request.url);


    var msg = '';
    var body = '';
    var code = 200;
    var headers = {};
    var stream = null;
    var method = request.method.toLocaleLowerCase();

    if (method == 'get')
    {
        stream = fs.createReadStream('./file.txt');
        headers = require('./mock/get/headers.json');
    }
    if (method == 'options')
    {
        logger.debug('options');
    }
    else if (method == 'propfind')
    {
        code = 207;
        logger.debug('propfind');

        if (request.url == '/folder')
        {
            logger.debug('folder');

            if (request.headers['depth'] == '0')
            {
                logger.debug('depth: 0');

                headers = require('./mock/propfind/folder/headers.json');
                body = fs.readFileSync('./mock/propfind/folder/body.xml', 'utf8');
            }
            else
            {
                logger.debug('depth: 1');

                headers = require('./mock/propfind/folder_and_files/headers.json');
                body = fs.readFileSync('./mock/propfind/folder_and_files/body.xml', 'utf8');
            }
        }
        else
        {
            logger.debug('file');

            headers = require('./mock/propfind/file/headers.json');
            body = fs.readFileSync('./mock/propfind/file/body.xml', 'utf8');
        }
    }

    Object.keys(headers).forEach(function (key) { response.setHeader(key, headers[key]); });

    logger.endBlocks();
    logger.debug('==================== response ====================');
    logger.startBlock();

    logger.debug('headers: ' + JSON.stringify(headers));
    logger.debug('body: ' + JSON.stringify(body));

    logger.endBlocks();

    response.writeHead(code, msg);

    if (stream)
    {
        stream.pipe(response);
        stream.on('data', function(part) 
        {
            logger.debug('stream part: ' + part);
        });
        stream.on('end', function()
        {
            logger.debug('stream end');
        });
    }
    else
    {
        response.write(body);
        response.end();
    }

}).listen(config.server.port);

logger.clear();
logger.info('Server running at http://127.0.0.1:{0}/'.format(config.server.port));