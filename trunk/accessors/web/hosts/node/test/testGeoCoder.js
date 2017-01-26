var a = instantiate('a', 'services/GeoCoder');
a.setParameter('key', 'AIzaSyBIu5hgbcSmP2f5frGdHpFNDJkDnTsFJyc');
a.initialize();
a.provideInput('address', 'berkeley');
a.react();
setTimeout(function() {
        console.log(a.latestOutput('location'));
    }, 2000);