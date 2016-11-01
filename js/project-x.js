/* global document:true */
document.addEventListener(`DOMContentLoaded`, () => {

	class Board {
		constructor(_size, _numberOfGemTypes, _typeOfBundle){
			this.size = _size;
			this.numberOfGemTypes = _numberOfGemTypes;
			this.numberOfGems = Math.pow(_size, 2);
			this.arrayOfGems = [ ];
			this.typeOfBundle = _typeOfBundle;
			this.createGems();
		}

		createGems(){
			let positionY = 0;
			for(let i = 0; i < this.numberOfGems; i += 1){
				if(i%this.size === 0){
					positionY += 1;
				}
				this.arrayOfGems[i] = {
					type: this.randomTypeOfGem(this.typeOfBundle),
					imageSrc: null,
					points: null,
					positionXY: [i%this.size,positionY-1],
				}
			}
			return this;
		};

		randomTypeOfGem(bundle){
			let bundleObject = [ ]; 
			switch(bundle) {
				case `fruits`:
					bundleObject = [`banana`,`cherry`,`pear`,`pineapple`,`raspberry`,`strawberry`];
				default:
					bundleObject = [`banana`,`cherry`,`pear`,`pineapple`,`raspberry`,`strawberry`];
			}
			return bundleObject[Math.floor(Math.random()*bundleObject.length)];
		};

	}
	function createNewBoard() {
		newBoard = new Board(8,6,`fruits`);
	}
	createNewBoard();

});


