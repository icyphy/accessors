//Composite Accessor containing parking service dialogue sub-swarmlet.

exports.setup = function(){
    console.log('start ParkingDialogue setup');

    this.input("parkingMessage");
    this.output("response");

    var qLauncher = this.instantiate("qLauncher", "QueryLauncher");
    this.connect("parkingMessage", qLauncher, "parkingMessage");

    var qServices = this.instantiate('qServices', "QueryServices");
    this.connect(qLauncher, "queryTerm", qServices, "queryTerm");
    this.connect(qLauncher, "latitude", qServices, "latitude");
    this.connect(qLauncher, "longitude", qServices, "longitude");

    console.log("before semRepoQ");
    var semRepoQ = this.instantiate('semRepoQ', 'services/SemanticRepositoryQuery');
    console.log("after semRepoQ");
    // semRepoQ.setParameter('protocol', "https");
    semRepoQ.setParameter('protocol', "http");
    semRepoQ.setParameter('host', 'wessel.eecs.berkeley.edu');
    semRepoQ.setParameter('port', 7200);
    semRepoQ.setParameter('authenticate', false);
    semRepoQ.setParameter('repositoryName','AutomotiveServices');
    console.log("after semRepoQ parameters");
    this.connect(qServices, "query", semRepoQ, "query");
    console.log("between connections");

    console.log("after semRepoQ connections");

    var qLDisp = this.instantiate("qLDisp", "JSONDisplay");
    //this.connect(semRepoQ, "response", qLDisp, "JSON");

    console.log("before rGen");
    var rGen = this.instantiate("rGen", "ResponseGeneratorC");
    console.log("after rGen");
    this.connect(semRepoQ, "response", rGen, "services");
    this.connect(qLauncher, "latitude", rGen, "latitude");
    this.connect(qLauncher, "longitude", rGen, "longitude");
    console.log("before response connection");

    this.connect(rGen, "response", "response");

    console.log('after ParkingDialogue setup');
}

exports.initialize = function () {
    console.log('ParkingDialogue sub-swarmlet started');
};