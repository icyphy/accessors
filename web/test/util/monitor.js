var accessor = getTopLevelAccessors()[0];
var count = 0;
accessor.on('output', function () {
    console.log(accessor.latestOutput('output'));
    if (count++ >= 4) {
        accessor.wrapup();
    }
});
