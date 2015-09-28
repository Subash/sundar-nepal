var express = require('express');
var request = require('request');
var url = require('url');
var app = express();

app.use(express.static('./')); //Nothing to hide :P

//Weird proxy url to prevent someone from making infinte loop of requests
app.get('/proxy-image-app-np', function(req, res, next) {

    const requestedUrl = decodeURI(req.query.url || '')

    if(requestedUrl && requestedUrl.indexOf('/proxy-image-app-np') === -1) {
      const stream = request.get(requestedUrl);
      stream.on('error', next);
      stream.pipe(res);
    } else {
      next();
    }

});

app.listen(process.env.PORT || 9000);

console.log('Up and Running');
