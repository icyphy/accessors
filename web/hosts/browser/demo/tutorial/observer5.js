/** Calls the observer after accessor DOM elements have been added to the page, 
 * as shown by the accessorTableDone event.
 */
// It's OK to have multiple $(document).ready() functions.  
$(document).ready(function () {
    // Register listener for when accessor DOM elements have all been added.
    var options = {once: true};
    
	window.addEventListener('accessorTableDone', function() {
		var duration = document.getElementById('accessorbox.duration');
		if (duration !== null) {
			
			document.getElementById('successMessage').innerHTML = '<b>Parameter added!</b>  Can you control the  ' + 
			'duration?  Periodic events are next.';
			document.getElementById('nextButton').style.display = 'block';
		}
	});
});
