exports.setup = function () {
    //  This composite accessor was created by Cape Code.
    //  To run the code, run: 
    //  (cd $PTII/org/terraswarm/accessor/accessors/web/test; @node@ ../hosts/node/nodeHostInvoke.js cg/SimpleCodeGen)
    //  To regenerate this composite accessor, run:
    //  $PTII/bin/ptinvoke ptolemy.cg.kernel.generic.accessor.AccessorCodeGenerator -language accessor $PTII/./ptolemy/actor/lib/jjs/modules/gdp/composite/SimpleCodeGen.xml
    //  to edit the model, run:
    //  $PTII/bin/capecode $PTII/./ptolemy/actor/lib/jjs/modules/gdp/composite/SimpleCodeGen.xml

    // Ports: SimpleCodeGen: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/org/terraswarm/accessor/JSAccessor.java
    // The script has local modifications, so it is being emitted.

    // Start: REST: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/lib/jjs/JavaScript.java
    // FIXME: See instantiate() in accessors/web/hosts/common/commonHost.js
    // We probably need to do something with the bindings.
    var REST = this.instantiateFromCode('REST', unescape('//%20Accessor%20for%20%20Representational%20State%20Transfer%20%28RESTful%29%20interfaces.%0A%0A//%20Copyright%20%28c%29%202015-2017%20The%20Regents%20of%20the%20University%20of%20California.%0A//%20All%20rights%20reserved.%0A//%0A//%20Permission%20is%20hereby%20granted%2C%20without%20written%20agreement%20and%20without%0A//%20license%20or%20royalty%20fees%2C%20to%20use%2C%20copy%2C%20modify%2C%20and%20distribute%20this%0A//%20software%20and%20its%20documentation%20for%20any%20purpose%2C%20provided%20that%20the%20above%0A//%20copyright%20notice%20and%20the%20following%20two%20paragraphs%20appear%20in%20all%20copies%0A//%20of%20this%20software.%0A//%0A//%20IN%20NO%20EVENT%20SHALL%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20BE%20LIABLE%20TO%20ANY%20PARTY%0A//%20FOR%20DIRECT%2C%20INDIRECT%2C%20SPECIAL%2C%20INCIDENTAL%2C%20OR%20CONSEQUENTIAL%20DAMAGES%0A//%20ARISING%20OUT%20OF%20THE%20USE%20OF%20THIS%20SOFTWARE%20AND%20ITS%20DOCUMENTATION%2C%20EVEN%20IF%0A//%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20HAS%20BEEN%20ADVISED%20OF%20THE%20POSSIBILITY%20OF%0A//%20SUCH%20DAMAGE.%0A//%0A//%20THE%20UNIVERSITY%20OF%20CALIFORNIA%20SPECIFICALLY%20DISCLAIMS%20ANY%20WARRANTIES%2C%0A//%20INCLUDING%2C%20BUT%20NOT%20LIMITED%20TO%2C%20THE%20IMPLIED%20WARRANTIES%20OF%0A//%20MERCHANTABILITY%20AND%20FITNESS%20FOR%20A%20PARTICULAR%20PURPOSE.%20THE%20SOFTWARE%0A//%20PROVIDED%20HEREUNDER%20IS%20ON%20AN%20%22AS%20IS%22%20BASIS%2C%20AND%20THE%20UNIVERSITY%20OF%0A//%20CALIFORNIA%20HAS%20NO%20OBLIGATION%20TO%20PROVIDE%20MAINTENANCE%2C%20SUPPORT%2C%20UPDATES%2C%0A//%20ENHANCEMENTS%2C%20OR%20MODIFICATIONS.%0A//%0A%0A/**%20Accessor%20for%20RESTful%20interfaces.%0A%20*%20%20Upon%20receipt%20of%20a%20trigger%20input%2C%20this%20accessor%20will%20issue%20an%20HTTP%20request%0A%20*%20%20specified%20by%20the%20inputs.%20Some%20time%20later%2C%20the%20accessor%20will%20receive%20a%20response%0A%20*%20%20from%20the%20server%20or%20a%20timeout.%20In%20the%20first%20case%2C%20the%20accessor%20will%20produce%0A%20*%20%20the%20response%20%28body%2C%20status%20code%2C%20and%20headers%29%20on%20output%20ports.%0A%20*%20%20In%20the%20second%20case%2C%20it%20will%20produce%20a%20nil%20output%20on%20the%20response%20port%0A%20*%20%20and%20an%20error.%0A%20*%0A%20*%20%20The%20accessor%20does%20not%20block%20waiting%20for%20the%20response%2C%20but%20any%20additional%0A%20*%20%20triggered%20requests%20will%20be%20queued%20to%20be%20issued%20only%20after%20the%20pending%20request%0A%20*%20%20has%20received%20either%20a%20response%20or%20a%20timeout.%20This%20strategy%20ensures%20that%20outputs%0A%20*%20%20from%20this%20accessor%20are%20produced%20in%20the%20same%20order%20as%20the%20inputs%20that%20trigger%20the%0A%20*%20%20HTTP%20requests.%0A%20*%0A%20*%20%20The%20%3Ci%3Eoptions%3C/i%3E%20input%20can%20be%20a%20string%20URL%20%28with%20surrounding%20quotation%20marks%29%0A%20*%20%20or%20an%20object%20with%20the%20following%20fields%3A%0A%20*%20%20%3Cul%3E%0A%20*%20%20%3Cli%3E%20headers%3A%20An%20object%20containing%20request%20headers.%20By%20default%20this%0A%20*%20%20%20%20%20%20%20is%20an%20empty%20object.%20Items%20may%20have%20a%20value%20that%20is%20an%20array%20of%20values%2C%0A%20*%20%20%20%20%20%20%20for%20headers%20with%20more%20than%20one%20value.%0A%20*%20%20%3Cli%3E%20keepAlive%3A%20A%20boolean%20that%20specified%20whether%20to%20keep%20sockets%20around%0A%20*%20%20%20%20%20%20%20in%20a%20pool%20to%20be%20used%20by%20other%20requests%20in%20the%20future.%20This%20defaults%20to%20false.%0A%20*%20%20%3Cli%3E%20method%3A%20A%20string%20specifying%20the%20HTTP%20request%20method.%0A%20*%20%20%20%20%20%20%20This%20defaults%20to%20%27GET%27%2C%20but%20can%20also%20be%20%27PUT%27%2C%20%27POST%27%2C%20%27DELETE%27%2C%20etc.%0A%20*%20%20%3Cli%3E%20url%3A%20A%20string%20that%20can%20be%20parsed%20as%20a%20URL%2C%20or%20an%20object%20containing%0A%20*%20%20%20%20%20%20%20the%20following%20fields%3A%0A%20*%20%20%20%20%20%20%20%3Cul%3E%0A%20*%20%20%20%20%20%20%20%3Cli%3E%20host%3A%20A%20string%20giving%20the%20domain%20name%20or%20IP%20address%20of%0A%20*%20%20%20%20%20%20%20%20%20%20%20%20the%20server%20to%20issue%20the%20request%20to.%20This%20defaults%20to%20%27localhost%27.%0A%20*%20%20%20%20%20%20%20%3Cli%3E%20protocol%3A%20The%20protocol.%20This%20is%20a%20string%20that%20defaults%20to%20%27http%27.%0A%20*%20%20%20%20%20%20%20%3Cli%3E%20port%3A%20Port%20of%20remote%20server.%20This%20defaults%20to%2080.%0A%20*%20%20%20%20%20%20%20%3C/ul%3E%0A%20*%20%20%3C/ul%3E%0A%20*%0A%20*%20%20For%20example%2C%20the%20%3Ci%3Eoptions%3C/i%3E%20parameter%20could%20be%20set%20to%0A%20*%20%20%3Ccode%3E%0A%20*%20%20%7B%22headers%22%3A%7B%22Content-Type%22%3A%22application/x-www-form-urlencoded%22%7D%2C%20%22method%22%3A%22POST%22%2C%20%22url%22%3A%22...%22%7D%0A%20*%20%20%3C/code%3E%0A%20*%0A%20*%20%20In%20addition%2C%20there%20is%20a%20%3Ci%3Ecommand%3C/i%3E%20input%20that%20is%20a%20string%20that%20is%20appended%0A%20*%20%20as%20a%20path%20to%20the%20URL%20constructed%20from%20the%20%3Ci%3Eoptions%3C/i%3E%20input.%20This%20defaults%0A%20*%20%20to%20the%20empty%20string.%0A%20*%0A%20*%20%20The%20%3Ci%3Earguments%3C/i%3E%20input%20an%20object%20with%20fields%20that%20are%20converted%20to%20a%20query%0A%20*%20%20string%20to%20append%20to%20the%20url%2C%20for%20example%20%27%3Farg%3Dvalue%27.%20If%20the%20value%20contains%0A%20*%20%20characters%20that%20are%20not%20allowed%20in%20a%20URL%2C%20such%20as%20spaces%2C%20they%20will%20encoded%0A%20*%20%20according%20to%20the%20ASCII%20standard%2C%20see%20http%3A//www.w3schools.com/tags/ref_urlencode.asp%20.%0A%20*%0A%20*%20%20A%20%3Ci%3Etrigger%3C/i%3E%20input%20triggers%20invocation%20of%20the%20current%20command.%20Any%20value%20provided%0A%20*%20%20on%20the%20trigger%20input%20is%20ignored.%0A%20*%0A%20*%20%20The%20output%20response%20will%20be%20a%20string%20if%20the%20MIME%20type%20of%20the%20accessed%20page%0A%20*%20%20begins%20with%20%22text%22.%20If%20the%20MIME%20type%20begins%20with%20anything%20else%2C%20then%20the%0A%20*%20%20binary%20data%20will%20be%20produced.%20It%20is%20up%20to%20the%20host%20implementation%20to%20ensure%0A%20*%20%20that%20the%20data%20is%20given%20in%20some%20form%20that%20is%20usable%20by%20downstream%20accessors%0A%20*%20%20or%20actors.%0A%20*%0A%20*%20%20The%20parameter%20%27timeout%27%20specifies%20how%20long%20this%20accessor%20will%20wait%20for%20response.%0A%20*%20%20If%20it%20does%20not%20receive%20the%20response%20by%20the%20specified%20time%2C%20then%20it%20will%20issue%0A%20*%20%20a%20null%20response%20output%20and%20an%20error%20event%20%28calling%20the%20error%28%29%20function%20of%20the%20host%29.%0A%20*%0A%20*%20%20If%20the%20parameter%20%27outputCompleteResponseOnly%27%20is%20true%20%28the%20default%29%2C%20then%20this%0A%20*%20%20accessor%20will%20produce%20a%20%27response%27%20output%20only%20upon%20receiving%20a%20complete%20response.%0A%20*%20%20If%20it%20is%20false%2C%20then%20multiple%20outputs%20may%20result%20from%20a%20single%20input%20or%20trigger.%0A%20*%0A%20*%20%20@accessor%20net/REST%0A%20*%20%20@author%20Edward%20A.%20Lee%20%28eal@eecs.berkeley.edu%29%2C%20contributor%3A%20Christopher%20Brooks%0A%20*%20%20@input%20%7BJSON%7D%20options%20The%20url%20for%20the%20command%20or%20an%20object%20specifying%20options.%0A%20*%20%20@input%20%7Bstring%7D%20command%20The%20command.%0A%20*%20%20@input%20%7BJSON%7D%20arguments%20Arguments%20to%20the%20command.%0A%20*%20%20@input%20body%20The%20request%20body%2C%20if%20any.%20%20This%20supports%20at%20least%20strings%20and%20image%20data.%0A%20*%20%20@input%20trigger%20An%20input%20to%20trigger%20the%20command.%0A%20*%20%20@output%20%7Bstring%7D%20response%20The%20server%27s%20response.%0A%20*%20%20@output%20%7Bstring%7D%20status%20The%20status%20code%20and%20message%20of%20the%20response.%0A%20*%20%20@output%20headers%20The%20headers%20sent%20with%20the%20response.%0A%20*%20%20@parameter%20%7Bint%7D%20timeout%20The%20amount%20of%20time%20%28in%20milliseconds%29%20to%20wait%20for%20a%20response%0A%20*%20%20%20before%20triggering%20a%20null%20response%20and%20an%20error.%20This%20defaults%20to%205000.%0A%20*%20%20@parameter%20%7Bboolean%7D%20outputCompleteResponseOnly%20If%20true%20%28the%20default%29%2C%20the%20produce%20a%0A%20*%20%20%20%27response%27%20output%20only%20upon%20receiving%20the%20entire%20response.%0A%20*%20%20@version%20%24%24Id%3A%20REST.js%202155%202017-09-21%2020%3A07%3A12Z%20cxh%20%24%24%0A%20*/%0A%0A//%20Stop%20extra%20messages%20from%20jslint%20and%20jshint.%20%20Note%20that%20there%20should%0A//%20be%20no%20space%20between%20the%20/%20and%20the%20*%20and%20global.%20See%0A//%20https%3A//chess.eecs.berkeley.edu/ptexternal/wiki/Main/JSHint%20*/%0A/*globals%20addInputHandler%2C%20error%2C%20exports%2C%20get%2C%20input%2C%20output%2C%20parameter%2C%20require%2C%20send%20*/%0A/*jshint%20globalstrict%3A%20true*/%0A%27use%20strict%27%3B%0A%0Avar%20httpClient%20%3D%20require%28%27@accessors-modules/http-client%27%29%3B%0Avar%20querystring%20%3D%20require%28%27querystring%27%29%3B%0A%0A/**%20Define%20inputs%20and%20outputs.%20*/%0Aexports.setup%20%3D%20function%20%28%29%20%7B%0A%20%20%20%20this.input%28%27options%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%27type%27%3A%20%27JSON%27%2C%20%20%20%20%20%20%20%20//%20Note%20that%20string%20literals%20are%20valid%20JSON.%0A%20%20%20%20%20%20%20%20%27value%27%3A%20%27%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.input%28%27command%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27string%27%2C%0A%20%20%20%20%20%20%20%20%27value%27%3A%20%27%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.input%28%27arguments%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27JSON%27%2C%0A%20%20%20%20%20%20%20%20%27value%27%3A%20%27%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.input%28%27trigger%27%29%3B%0A%20%20%20%20this.input%28%27body%27%29%3B%0A%20%20%20%20this.output%28%27response%27%29%3B%0A%20%20%20%20this.output%28%27status%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27string%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.output%28%27headers%27%29%3B%0A%20%20%20%20this.parameter%28%27timeout%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27value%27%3A%205000%2C%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27int%27%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20this.parameter%28%27outputCompleteResponseOnly%27%2C%20%7B%0A%20%20%20%20%20%20%20%20%27value%27%3A%20true%2C%0A%20%20%20%20%20%20%20%20%27type%27%3A%20%27boolean%27%0A%20%20%20%20%7D%29%3B%0A%7D%3B%0A%0A/**%20Build%20the%20path%20from%20the%20command%20and%20arguments.%0A%20*%20%20This%20default%20implementation%20returns%20%27command%3Fargs%27%2C%20where%0A%20*%20%20args%20is%20an%20encoding%20of%20the%20arguments%20input%20for%20embedding%20in%20a%20URL.%0A%20*%20%20For%20example%2C%20if%20the%20arguments%20input%20is%20the%20object%0A%20*%20%20%20%20%20%60%60%60%7B%20foo%3A%20%27bar%27%2C%20baz%3A%20%5B%27qux%27%2C%20%27quux%27%5D%2C%20corge%3A%20%27%27%20%7D%60%60%60%0A%20*%20%20then%20the%20returned%20string%20will%20be%0A%20*%20%20%20%20%20%60%60%60command%3Ffoo%3Dbar%26baz%3Dqux%26baz%3Dquux%26corge%3D%60%60%60%0A%20*%20%20Derived%20accessors%20may%20override%20this%20function%20to%20customize%0A%20*%20%20the%20interaction.%20The%20returned%20string%20should%20not%20include%20a%20leading%20%27/%27.%0A%20*%20%20That%20will%20be%20added%20automatically.%0A%20*/%0Aexports.encodePath%20%3D%20function%20%28%29%20%7B%0A%20%20%20%20//%20Remove%20any%20leading%20slash%20that%20might%20be%20present.%0A%20%20%20%20var%20re%20%3D%20new%20RegExp%28%27%5E%5C/%27%29%3B%0A%20%20%20%20var%20command%20%3D%20this.get%28%27command%27%29.replace%28re%2C%20%27%27%29%3B%0A%0A%20%20%20%20//%20Encode%20any%20characters%20that%20are%20not%20allowed%20in%20a%20URL.%0A%20%20%20%20%0A%20%20%20%20//%20The%20test%20for%20this%20is%3A%0A%20%20%20%20//%20%24PTII/bin/ptinvoke%20ptolemy.moml.MoMLSimpleApplication%20%24PTII/ptolemy/actor/lib/jjs/modules/httpClient/test/auto/RESTPostDataTypes.xml%20%0A%20%20%20%20var%20encodedArgs%3B%0A%20%20%20%20var%20argumentsValue%20%3D%20this.get%28%27arguments%27%29%3B%0A%20%20%20%20%0A%20%20%20%20//%20If%20the%20arguments%20are%20undefined%20or%20empty%2C%20then%20we%20are%20done.%0A%20%20%20%20if%20%28typeof%20argumentsValue%20%3D%3D%3D%20%27undefined%27%20%7C%7C%20argumentsValue%20%3D%3D%3D%20%27%27%29%20%7B%0A%20%20%20%20%20%20%20%20return%20command%3B%0A%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20encodedArgs%20%3D%20querystring.stringify%28argumentsValue%29%3B%0A%20%20%20%20%20%20%20%20return%20command%20+%20%27%3F%27%20+%20encodedArgs%3B%0A%20%20%20%20%7D%0A%0A%7D%3B%20%0A%0A/**%20Filter%20the%20response.%20This%20base%20class%20just%20returns%20the%20argument%0A%20*%20%20unmodified%2C%20but%20derived%20classes%20can%20override%20this%20to%20extract%0A%20*%20%20a%20portion%20of%20the%20response%2C%20for%20example.%20Note%20that%20the%20response%0A%20*%20%20argument%20can%20be%20null%2C%20indicating%20that%20there%20was%20no%20response%0A%20*%20%20%28e.g.%2C%20a%20timeout%20or%20error%20occurred%29.%0A%20*%20%20@param%20response%20The%20response%2C%20or%20null%20if%20there%20is%20none.%0A%20*/%0Aexports.filterResponse%20%3D%20function%20%28response%29%20%7B%0A%20%20%20%20return%20response%3B%0A%7D%3B%0A%0A//%20Keep%20track%20of%20pending%20HTTP%20request%20so%20it%20can%20be%20stopped%20if%20the%0A//%20model%20stops%20executing.%0Avar%20request%3B%0A%0A/**%20Issue%20the%20command%20based%20on%20the%20current%20value%20of%20the%20inputs.%0A%20*%20%20This%20constructs%20a%20path%20using%20encodePath%20and%20combines%20it%20with%20the%0A%20*%20%20url%20input%20to%20construct%20the%20full%20command.%0A%20*%20%20@param%20callback%20The%20callback%20function%20that%20will%20be%20called%20with%20the%0A%20*%20%20%20response%20as%20an%20argument%20%28an%20instance%20of%20IncomingMessage%2C%20defined%20in%0A%20*%20%20%20the%20httpClient%20module%29.%0A%20*/%0Aexports.issueCommand%20%3D%20function%20%28callback%29%20%7B%0A%20%20%20%20var%20encodedPath%20%3D%20this.exports.encodePath.call%28this%29%3B%0A%20%20%20%20var%20options%20%3D%20this.get%28%27options%27%29%3B%0A%20%20%20%20var%20body%20%3D%20this.get%28%27body%27%29%3B%0A%20%20%20%20var%20command%20%3D%20options%3B%0A%20%20%20%20if%20%28typeof%20options%20%3D%3D%3D%20%27string%27%29%20%7B%0A%20%20%20%20%20%20%20%20//%20In%20order%20to%20be%20able%20to%20include%20the%20outputCompleteResponseOnly%0A%20%20%20%20%20%20%20%20//%20option%2C%20we%20have%20to%20switch%20styles%20here.%0A%20%20%20%20%20%20%20%20command%20%3D%20%7B%7D%3B%0A%20%20%20%20%20%20%20%20if%20%28encodedPath%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20command.url%20%3D%20options%20+%20%27/%27%20+%20encodedPath%3B%0A%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20command.url%20%3D%20options%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20//%20Don%27t%20use%20command%20%3D%20options%2C%20because%20otherwise%20if%20we%20invoke%0A%20%20%20%20%20%20%20%20//%20this%20accessor%20multiple%20times%2C%20then%20options.url%20will%20be%0A%20%20%20%20%20%20%20%20//%20appended%20to%20each%20time.%20%20Instead%2C%20do%20a%20deep%20clone.%0A%20%20%20%20%20%20%20%20command%20%3D%20JSON.parse%28JSON.stringify%28options%29%29%3B%0A%20%20%20%20%20%20%20%20if%20%28typeof%20options.url%20%3D%3D%3D%20%27string%27%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20command.url%20%3D%20options.url%20+%20%27/%27%20+%20encodedPath%3B%0A%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20command.url.path%20%3D%20%27/%27%20+%20encodedPath%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20command.timeout%20%3D%20this.getParameter%28%27timeout%27%29%3B%0A%0A%20%20%20%20if%20%28this.getParameter%28%27outputCompleteResponseOnly%27%29%20%3D%3D%3D%20false%29%20%7B%0A%20%20%20%20%20%20%20%20command.outputCompleteResponseOnly%20%3D%20false%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20if%20%28typeof%20body%20%21%3D%3D%20%27undefined%27%29%20%7B%0A%20%20%20%20%20%20%20%20command.body%20%3D%20body%3B%0A%20%20%20%20%7D%0A%0A%20%20%20%20//%20console.log%28%22REST.js%20issueCommand%28%29%3A%20request%20to%3A%20%22%20+%20JSON.stringify%28command%29%29%3B%0A%20%20%20%20//%20var%20util%20%3D%20require%28%27util%27%29%3B%20%0A%20%20%20%20//%20console.log%28util.inspect%28command%29%29%3B%0A%20%20%20%20%0A%20%20%20%20request%20%3D%20httpClient.request%28command%2C%20callback%29%3B%0A%20%20%20%20request.on%28%27error%27%2C%20function%20%28message%29%20%7B%0A%20%20%20%20%20%20%20%20if%20%28%21message%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20message%20%3D%20%27Request%20failed.%20No%20further%20information.%27%3B%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20error%28message%29%3B%0A%20%20%20%20%7D%29%3B%0A%20%20%20%20request.end%28%29%3B%0A%7D%3B%0A%0A/**%20Handle%20the%20response%20from%20the%20RESTful%20service.%20The%20argument%0A%20*%20%20is%20expected%20to%20be%20be%20an%20instance%20of%20IncomingMessage%2C%20defined%0A%20*%20%20in%20the%20httpClient%20module.%20This%20base%20class%20extracts%20the%20body%0A%20*%20%20field%20of%20the%20message%2C%20if%20there%20is%20one%2C%20and%20produces%20that%20on%0A%20*%20%20the%20%27response%27%20output%2C%20and%20otherwise%20just%20produces%20the%20message%0A%20*%20%20on%20the%20output.%20If%20the%20argument%20is%20null%20or%20undefined%2C%20then%20do%0A%20*%20%20nothing.%0A%20*%20%20@param%20message%20An%20incoming%20message.%0A%20*/%0Aexports.handleResponse%20%3D%20function%20%28message%29%20%7B%0A%20%20%20%20//%20Assume%20that%20if%20the%20response%20is%20null%2C%20an%20error%20will%20be%20signaled.%0A%20%20%20%20if%20%28message%20%21%3D%3D%20null%20%26%26%20typeof%20message%20%21%3D%3D%20%27undefined%27%29%20%7B%0A%20%20%20%20%20%20%20%20//%20Handle%20redirects%20by%20creating%20a%20new%20command%20and%20making%20a%20new%0A%20%20%20%20%20%20%20%20//%20request.%20%20This%20is%20similar%20to%20issueCommand%28%29.%0A%20%20%20%20%20%20%20%20//%20The%20encodedPath%20is%20already%20in%20the%20URL%2C%20so%20we%20dont%20need%20to%20append%20it%20here.%0A%20%20%20%20%20%20%20%20if%20%28message.statusCode%20%26%26%20message.statusCode%20%3E%3D%20300%20%26%26%20message.statusCode%20%3C%3D%20308%20%26%26%20message.statusCode%20%21%3D%20306%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20var%20body%20%3D%20this.get%28%27body%27%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20var%20options%20%3D%20this.get%28%27options%27%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20var%20command%20%3D%20options%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20%28typeof%20options%20%3D%3D%3D%20%27string%27%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20//%20In%20order%20to%20be%20able%20to%20include%20the%20outputCompleteResponseOnly%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20//%20option%2C%20we%20have%20to%20switch%20styles%20here.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20command%20%3D%20%7B%7D%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20command.url%20%3D%20message.headers.location%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20//%20Don%27t%20use%20command%20%3D%20options%2C%20because%20otherwise%20if%20we%20invoke%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20//%20this%20accessor%20multiple%20times%2C%20then%20options.url%20will%20be%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20//%20appended%20to%20each%20time.%20%20Instead%2C%20do%20a%20deep%20clone.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20command%20%3D%20JSON.parse%28JSON.stringify%28options%29%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20command.url%20%3D%20message.headers.location%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20command.timeout%20%3D%20this.getParameter%28%27timeout%27%29%3B%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20%28this.getParameter%28%27outputCompleteResponseOnly%27%29%20%3D%3D%3D%20false%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20command.outputCompleteResponseOnly%20%3D%20false%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20%28typeof%20body%20%21%3D%3D%20%27undefined%27%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20command.body%20%3D%20body%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20request%20%3D%20httpClient.request%28%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20command%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20this.exports.handleResponse.bind%28this%29%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20request.end%28%29%3B%0A%0A%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20%28message.body%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20this.send%28%27response%27%2C%20this.exports.filterResponse.call%28this%2C%20message.body%29%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%20else%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20this.send%28%27response%27%2C%20this.exports.filterResponse.call%28this%2C%20message%29%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20%28message.statusCode%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20this.send%28%27status%27%2C%20message.statusCode%20+%20%27%3A%20%27%20+%20message.statusMessage%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%20%20%20%20if%20%28message.headers%29%20%7B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20this.send%28%27headers%27%2C%20message.headers%29%3B%0A%20%20%20%20%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%7D%3B%0A%0A/**%20Register%20the%20input%20handler.%20%20*/%0Aexports.initialize%20%3D%20function%20%28%29%20%7B%0A%20%20%20%20//%20Upon%20receiving%20a%20trigger%20input%2C%20issue%20a%20command.%0A%20%20%20%20this.addInputHandler%28%27trigger%27%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20this.exports.issueCommand.bind%28this%29%2C%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20this.exports.handleResponse.bind%28this%29%29%3B%0A%7D%3B%0A%0A/**%20Upon%20wrapup%2C%20stop%20handling%20new%20inputs.%20%20*/%0Aexports.wrapup%20%3D%20function%20%28%29%20%7B%0A%20%20%20%20//%20In%20case%20there%20is%20streaming%20data%20coming%20in%2C%20stop%20it.%0A%20%20%20%20if%20%28request%29%20%7B%0A%20%20%20%20%20%20%20%20request.stop%28%29%3B%0A%20%20%20%20%20%20%20%20request%20%3D%20null%3B%0A%20%20%20%20%7D%0A%7D%3B%0A'));
    REST.setDefault('options', "");
    REST.setDefault('command', "");
    REST.setDefault('arguments', "");
    REST.setParameter('timeout', 5000);
    REST.setParameter('outputCompleteResponseOnly', true);

    // Connections: SimpleCodeGen: ptolemy/cg/adapter/generic/accessor/adapters/ptolemy/actor/TypedCompositeActor.java
};

// The stopTime parameter of the directory in the model was 0, so this.stopAt() is not being generated.

