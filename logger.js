const fs = require('fs');
const utils = require('./utils.js');
const config = require('./config.js');

const Modes = { Default: 1, Block: 2 }
const Levels = { Fatal: 1, Error: 2, Warn: 3, Info: 4, Debug: 5, Trace: 6 }

var loggers = {};

class Logger
{
    constructor(name, level, path)
    {
        this.queue = [];
        this.indent = 1;
        this.name = name;
        this.path = path;
        this.level = level;

        if (path)
            this.write();
    }

    //#region log functions

    fatal(message, parameters)
    {
        this.log(Levels.Fatal, 'FATAL', message, parameters);
    }
    error(message, parameters)
    {
        this.log(Levels.Error, 'ERROR', message, parameters);
    }
    warn(message, parameters)
    {
        this.log(Levels.Warn, 'WARN', message, parameters);
    }
    info(message, parameters)
    {
        this.log(Levels.Info, 'INFO', message, parameters);
    }
    debug(message, parameters)
    {
        this.log(Levels.Debug, 'DEBUG', message, parameters);
    }
    trace(message, parameters)
    {
        this.log(Levels.Trace, 'TRACE', message, parameters);
    }

    //#endregion

    //#region log block functions

    startBlock()
    {
        this.indent++;
    }
    endBlock()
    {
        this.indent--;
    }
    endBlocks()
    {
        this.indent = 1;
    }

    //#endregion

    log(level, prefix, message, parameters)
    {
        if (message == null) return;
        if (level > this.level) return;

        var msg = '({0}) {1}: {2}'.format(new Date().format(), prefix, Array(this.indent).join('  '));

        switch (typeof (message))
        {
            case 'array':
            case 'object':
                msg += JSON.stringify(message);
            default:
                msg += message.toString();
        }

        msg = msg.formatWith(parameters);

        console.log(msg);
        this.queue.push(msg);
    }
    write(wait = 0)
    {
        setTimeout(() => 
        {
            if (this.queue.length == 0) 
            {
                this.write(100);
            }
            else
            {
                var end = this.queue.length;
                var start = Math.min(end - 1000, 0);
                var content = this.queue.splice(start, end).join('\n');

                fs.appendFile(this.path, content + '\n', (err) =>
                { 
                    if (err) 
                        console.log(err) 
                    
                    this.write();
                });
            }
        }, wait);
    }
    clear()
    {
        //console.clear();
        fs.writeFileSync(this.path, '');
    }
}

module.exports = function (name)
{
    if (loggers[name])        
    {

    }
    else if (config.loggers[name])
    {
        loggers[name] = new Logger(name, config.loggers[name].level, config.loggers[name].filepath);
    }
    else
    {
        loggers[name] = new Logger(name, 3, './{0}.txt'.format(name));
    }

    return loggers[name];
}