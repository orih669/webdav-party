const webdav = require('webdav-server').v2;

const server = new webdav.WebDAVServer({
    port: 1901
});

server.rootFileSystem().addSubTree(server.createExternalContext(), {
    'folder1': {                                // /folder1
        'file1.txt': webdav.ResourceType.File,  // /folder1/file1.txt
        'file2.txt': webdav.ResourceType.File   // /folder1/file2.txt
    },
    'file0.txt': webdav.ResourceType.File       // /file0.txt
})

server.afterRequest((arg, next) => {
    console.log('>>', arg.request.method, arg.uri, '>', arg.response.statusCode, arg.response.statusMessage);
    next();
})

server.beforeRequest((arg, next) => {
    console.log('>>', arg.request.method, arg.uri, '>', arg.response.statusCode, arg.response.statusMessage);
    next();
})

server.start(httpServer => {
    console.log('Server started with success on the port : ' + httpServer.address().port);
});
// server.setFileSystem('./content', new webdav.PhysicalFileSystem('./folder'), (success) => {
//     server.start(() => console.log('READY'));
// })