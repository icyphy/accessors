/** Calls the observer after accessor DOM elements have been added to the page, 
 * as shown by the accessorTableDone event.
 */
// It's OK to have multiple $(document).ready() functions.  
$(document).ready(function () {
    // Register listener for when accessor DOM elements have all been added.
    var options = {once: true};
    
	window.addEventListener('accessorTableDone', function() {
		var duration = document.getElementById('accessorbox.duration');
		var interval = document.getElementById('accessorbox.interval');
		
		if (duration !== null && interval !== null) {
			
			document.getElementById('successMessage').innerHTML = '<b>Parameters added!</b> ' + 
				'Composition of accessors is next.';
			document.getElementById('nextButton').style.display = 'block';
		}
	});
});
