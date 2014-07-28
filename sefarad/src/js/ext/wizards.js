function initIsotopeAndWizards(){

	var $container = $('#wizard-content');
	$container.isotope({
		itemSelector : ".box",
		filter: '*',
		animationOptions: {
		duration: 750,
		easing: 'linear',
		queue: false,
	}
	});

	$('#cssmenu a').click(function(){
		var selector = $(this).attr('data-filter');
		$container.isotope({
			filter: selector,
			animationOptions: {
			duration: 750,
			easing: 'linear',
			queue: false,
		}
		});
		return false;
	});	


	var $optionSets = $('.option-set'),
			$optionLinks = $optionSets.find('a');

	$optionLinks.click(function(){
		var $this = $(this);
		// don't proceed if already selected
		if ( $this.hasClass('selected') ) {
			return false;
		}
		var $optionSet = $this.parents('.option-set');
		$optionSet.find('.selected').removeClass('selected');
		$this.addClass('selected');
		return false;
	});

	$(".box").click(function(){
		if (!$(this).hasClass("big")) { // deactivate click handler when showing expanded view (-> close button!)
			$(this).addClass("big");
		}
	});

	// click handler for close button
	$(".mask").click(function(e){
		var booleano = e.toElement;
		if($(booleano).is("select")){
		}else{
			e.stopPropagation(); // prevent item click handler (see above) from getting notified
			$(this).closest("div.box").removeClass("big"); 
		}
	});			

	$('.column').resizable({ handles: 'e' });
	vm.drawcharts();

	$("#sgvizlertable td").click(function(e) {
		var currentCellText = $(this).text();
		console.log(currentCellText);
		if(currentCellText!=""){
			vm.sgvizlerGraphType(currentCellText);
			$("#sgvizlermanager_1").hide('slow');
			$("#sgvizlermanager_2").show('slow');
		}
	});

	$("#back1").click(function(e) {
		vm.openSgvizlerManager(false);
		vm.openNewWidgetManager(true);		

	});

	$("#back2").click(function(e) {
		$("#sgvizlermanager_2").hide('slow');
		$("#sgvizlermanager_1").show('slow');
	});
}