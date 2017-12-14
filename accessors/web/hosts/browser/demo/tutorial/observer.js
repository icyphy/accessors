/** Adds an observer to the item of interest.  Use an observer to monitor values 
 *  produced by reacttoInputs().  
 *  
 *  Call after accessor DOM elements have been added to the page (see below).  
 *  The observer should change the successMessage and make nextButton visible.
 *  You may optionally set successMessage to a hint if the solution is wrong.
**/

function addObserver() {
	var greeting = document.getElementById('accessorbox.greeting');
	if (greeting !== null) {
		
		var config = {childList: true};
		
		var observer = new MutationObserver(function(mutationList) {
			document.getElementById('successMessage').innerHTML = '<b>Great!</b>  You\'ve ' + 
					'executed your first accessor.  Let\'s look more closely at the accessor interface.';
			var btn = document.getElementById('nextButton').style.display = 'block';
		});
		
		observer.observe(greeting, config);
	}
}

/** Calls the observer after accessor DOM elements have been added to the page, 
 * as shown by the accessorTableDone event.
 */
// It's OK to have multiple $(document).ready() functions.  
$(document).ready(function () {
	window.addEventListener('accessorTableDone', function() {
		addObserver();
	});
});