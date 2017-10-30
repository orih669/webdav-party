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
    var mode = 'default';
    var method = request.method.toLocaleLowerCase();

    if (method == 'get')
    {
        mode = 'download';
        var stats = fs.statSync("./file.docx");
        var size = stats.size;
        logger.debug('size: ' + size);
        stream = fs.createReadStream('./file.docx');
        headers = require('./mock/get/headers.json');
    }
    if (method == 'put')
    {
        mode = 'upload';
        stream = fs.createWriteStream('./file.docx');
        headers = require('./mock/put/headers.json');
    }
    if (method == 'head')
    {
        headers = require('./mock/head/headers.json');
    }
    else if (method == 'lock')
    {
        headers = require('./mock/lock/headers.json');
        body = fs.readFileSync('./mock/lock/body.xml', 'utf8');
    }
    else if (method == 'unlock')
    {
        code = 204;
        headers = require('./mock/unlock/headers.json');
    }
    else if (method == 'options')
    {
        logger.debug('options');
    }
    else if (method == 'proppatch')
    {
        code = 207;
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

    logger.trace('headers: ' + JSON.stringify(headers));
    logger.trace('body: ' + JSON.stringify(body));

    logger.endBlocks();

    response.writeHead(code, msg);

    if (mode == 'download')
    {
        stream.pipe(response);
        stream.on('end', function() { logger.debug('download end'); });
        stream.on('data', function(part) { logger.trace('download part: ' + part); });
    }
    else if (mode == 'upload')
    {
        request.pipe(stream);
        request.on('end', function() 
        {
            logger.debug('upload end'); 
            response.end();
        });
        request.on('data', function(part) { logger.trace('upload part: ' + part); });
    }
    else
    {
        response.write(body);
        response.end();
    }

}).listen(config.server.port);

logger.clear();
logger.info('Server running at http://127.0.0.1:{0}/'.format(config.server.port));