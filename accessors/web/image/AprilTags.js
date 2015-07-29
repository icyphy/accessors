var aprilTags = require('aprilTags');

exports.setup = function() {
    input('input');
    output('output');
    output('tags');
    input('options', {'value':{}});
}

exports.initialize = function() {
    handle = addInputHandler('input', function() {
        var options = get('options');
        var token = get('input');
        var image = token.asAWTImage();
        var result =aprilTags.filter(image, options);
        send('output', result);
        var tags = aprilTags.tags();
        if (tags) {
            send('tags', tags);
        }
    });
}

exports.wrapup = function() {
    if (handle) {
        removeInputHandler(handle);
    }
}