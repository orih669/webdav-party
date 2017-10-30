var config = {};

// ================================================== Server ==================================================//
config.server = {};
config.server.port = 1111;

// ================================================== Logger ==================================================//
config.loggers = {};
config.loggers['default'] = {level: 5, filepath: './log.txt'}

module.exports = config;