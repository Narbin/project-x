/* global document:true */
document.addEventListener(`DOMContentLoaded`, () => {

	class Board {
		constructor(_size, _numberOfGemTypes, _typeOfBundle) {
			this.size = _size;
			this.numberOfGemTypes = _numberOfGemTypes;
			this.numberOfGems = Math.pow(_size, 2);
			this.arrayOfGems = [ ];
			this.typeOfBundle = _typeOfBundle;
			this.createGems();
			this.drawGems();
		}

		createGems() {
			let positionY = 0;
			for (let i = 0; i < this.numberOfGems; i += 1) {
				if (i % this.size === 0) {
					positionY += 1;
				}
				this.arrayOfGems[i] = {
					type: this.randomTypeOfGem(this.typeOfBundle),
					imageSrc: null,
					points: 1,
					positionXY: [i % this.size, positionY - 1]
				};
				this.setImageSrc(this.arrayOfGems[i].type, i);
			}
			return this;
		}

		randomTypeOfGem(bundle) {
			let bundleObject = [ ];
			switch (bundle) {
				case `fruits`:
					bundleObject = [`banana`, `cherry`, `pear`, `pineapple`, `raspberry`, `strawberry`];
					break;
				default:
					bundleObject = [`banana`, `cherry`, `pear`, `pineapple`, `raspberry`, `strawberry`];
					break;
			}
			return bundleObject[Math.floor(Math.random() * bundleObject.length)];
		}

		setImageSrc(type, i) {
			this.arrayOfGems[i].imageSrc = `images/${type}.svg`;
			return this.arrayOfGems[i].imageSrc;
		}

		drawGems() {
			let divForGems = $(`.panel-body`)[0];

			for (let i = 0; i < this.numberOfGems; i += 1) {
				let creatingImg = $("<img>", {"class": "col-xs-2 no-padding", "src": this.arrayOfGems[i].imageSrc});
				$(divForGems).append(creatingImg);
			}
			return this;
		}

	}
	function createNewBoard() {
		newBoard = new Board(8, 6, `fruits`);
	}
	createNewBoard();

});


