/** Adds an observer to the item of interest.  Use an observer to monitor values 
 *  produced by reacttoInputs().  
 *  
 *  Call after accessor DOM elements have been added to the page (see below).  
 *  The observer should change the successMessage and make nextButton visible.
 *  You may optionally set successMessage to a hint if the solution is wrong.
**/

function addObserver() {
	var output = document.getElementById('accessorbox.tripled');
	if (output !== null) {
		var config = {childList: true};
		
		var observer = new MutationObserver(function(mutationList) {
			var input = document.getElementById('accessorbox.input');
			
			if (parseFloat(input.value)*3.0 == parseFloat(output.innerHTML)) {
				document.getElementById('successMessage').innerHTML = '<b>Looking good!</b> ' + 
						'Let\'s move on to audio.';
				document.getElementById('nextButton').style.display = 'block';
			}
		
		});
		
		observer.observe(output, config);
	}
}

/** Calls the observer after accessor DOM elements have been added to the page, 
 * as shown by the accessorTableDone event.
 */
// It's OK to have multiple $(document).ready() functions.  
$(document).ready(function () {
    // Register listener for when accessor DOM elements have all been added.
    var options = {once: true};
    
	window.addEventListener('accessorTableDone', function() {
		var tripled = document.getElementById('accessorbox.tripled');
		if (tripled !== null) {
			
			var multiplier = document.getElementById('accessorbox.multiplier');
			if (multiplier !== null) {
				if (multiplier.value == 3) {
					document.getElementById('successMessage').innerHTML = '<b>Nice!</b>  Now, enter an ' + 
					'input and click \'react to inputs\'.  Don\'t forget to update the send() function with the new output name.';
					
					addObserver();
				}
			}
		}
	});
});
