(function(){
	var images = [ ];
	function preload(arg) {
		for (i = 0; i < arg.length; i++) {
			images[i] = new Image()
			images[i].src = arg[i]
		}
	}
	preload(
		["images/amethyst.svg",
		"images/archmaster.svg",
		"images/back.svg",
		"images/child.svg",
		"images/crosshair.svg",
		"images/cut-diamond.svg",
		"images/emerald.svg",
		"images/experienced.svg",
		"images/highschool.svg",
		"images/icon.svg",
		"images/lucky.svg",
		"images/master.svg",
		"images/novice.svg",
		"images/primaryschool.svg",
		"images/rupee.svg",
		"images/saphir.svg",
		"images/sucked.svg",
		"images/topaz.svg",
		"images/trainee.svg"]
		)
})()