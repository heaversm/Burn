$(document).ready(function() {

	var $tooltip = $('#tooltip');
	var tipText;
	var tipCount = 0;

    $(".sceneOption").hover(
	  function () {
		var $chosenScene = $(this);
	    tipText = $chosenScene.attr('data-desc');
		tipCount = parseInt($chosenScene.attr('data-count'));
		var tipSpace = 45 + (tipCount * 45);
		$tooltip.html(tipText);
		$tooltip.css({'top' : tipSpace+'px'});
		$tooltip.show();
	  },
	  function () {
		$tooltip.hide();
	  }
	);  
});
