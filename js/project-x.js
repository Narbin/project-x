/* global document:true */
document.addEventListener(`DOMContentLoaded`, () => {

	class Board {
		constructor(_size, _numberOfGemTypes){
			this.size = _size;
			this.numberOfGemTypes = _numberOfGemTypes;
			this.numberOfGems = Math.pow(_size, 2);
			this.arrayOfGems = [ ];
			this.createGems();
		}
		createGems(){
			for(let i = 0; i < this.numberOfGems; i += 1){
				this.arrayOfGems[i] = {
					type: null,
					imageSrc: null,
					points: null,
					position: [null,null],
				}
			}
			return this;
		};

	}
	function createNewBoard() {
		newBoard = new Board(8,6);
	}
	createNewBoard();

});


