/** Calls the observer after accessor DOM elements have been added to the page, 
 * as shown by the accessorTableDone event.
 */
// It's OK to have multiple $(document).ready() functions.  
$(document).ready(function () {
    // Register listener for when accessor DOM elements have all been added.
    var options = {once: true};
    
	window.addEventListener('accessorTableDone', function() {
		if (document.getElementsByClassName('imageProcessingDisplays').length > 0) {
			document.getElementById('successMessage').innerHTML = '<b>Looking good!</b>  You\'ve ' +
			'instantiated a camera and face detector.';
			
			document.getElementById('reactToInputs').addEventListener('click', function(){
				document.getElementById('successMessage').innerHTML = 'That\'s ' + 
				'the end.  Click to return to the beginning. ' + 
				'Try it as a sandbox!';
				document.getElementById('nextButton').style.display = 'block';
			});
		}
			
	});
});
