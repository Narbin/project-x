/* global document:true $:true*/
document.addEventListener(`DOMContentLoaded`, () => {

	let alreadyGemSelected = ``;

	$(`.panel-body`).bind('click', whatGemWasClicked);

	$('#resetBoard').bind('click', function() {
		newBoard.clearBoardDOM();
		newBoard = new Board(newBoard.size, newBoard.typeOfBundle);
	});

	function whatGemWasClicked(event) {
		if (event.target !== event.currentTarget) {
			console.log(event.target);
			selectGemDOM(event.target);
		}
		event.stopPropagation();
	}

	function changeGemsPosition(gem) {
		let x1 = parseInt(gem.getAttribute(`x`)),
			y1 = parseInt(gem.getAttribute(`y`)),
			x2 = parseInt(alreadyGemSelected.getAttribute(`x`)),
			y2 = parseInt(alreadyGemSelected.getAttribute(`y`)),
			tempGem;

		if(x1 === x2 + 1 && y1 === y2 || x1 === x2 - 1 && y1 === y2 || x1 === x2 && y1 === y2 + 1 || x1 === x2 && y1 === y2 - 1){
			
			//swap:
			tempGem = newBoard.arrayOfGems[y2][x2];
			newBoard.arrayOfGems[y2][x2] = newBoard.arrayOfGems[y1][x1];
			newBoard.arrayOfGems[y1][x1] = tempGem;
			
			newBoard.clearBoardDOM();
			newBoard.drawGems();
			return true;

		}
	}

	function selectGemDOM(gem) {
		if(alreadyGemSelected === event.target) {
			$(event.target).toggleClass( "selected" );
			alreadyGemSelected = ``;
		} else if (alreadyGemSelected === ``) {
			$(event.target).toggleClass( "selected" );
			alreadyGemSelected = event.target;
		} else {
			if(changeGemsPosition(event.target)){
				$(alreadyGemSelected).toggleClass( "selected" );
				alreadyGemSelected = ``;
			}
		}
	}

	class Board {
		constructor(_size, _typeOfBundle) {
			this.size = _size;
			this.typeOfBundle = _typeOfBundle;
			this.createGems();
			this.shuffleBoard();
			this.setImageSrc();
			this.drawGems();
		}

		createGems() {
			this.arrayOfGems = new Array(this.size);
			for (let i = 0; i < this.size; i += 1) {
				this.arrayOfGems[i] = new Array(this.size);
				for (let j = 0; j < this.size; j += 1) {
					this.arrayOfGems[i][j] = {
						type: this.randomTypeOfGem(this.typeOfBundle),
						imageSrc: null,
						points: 1,
						isSelected: false
					};
				}
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

		drawGems() {
			let divForGems = $(`.panel-body`)[0];
			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					let creatingImg = $('<img>', { 'class': 'col-xs-2 no-padding gem', 'src': this.arrayOfGems[i][j].imageSrc});
					$(creatingImg).attr(`x`, `${j}`);
					$(creatingImg).attr(`y`, `${i}`);
					$(divForGems).append(creatingImg);
				}
			}
			return this;
		}

		setImageSrc() {
			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					this.arrayOfGems[i][j].imageSrc = `images/${this.arrayOfGems[i][j].type}.svg`;
				}
			}
		}

		shuffleBoard() {
			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					if (i > 1) {
						if (this.arrayOfGems[i][j].type === this.arrayOfGems[i - 1][j].type && this.arrayOfGems[i][j].type === this.arrayOfGems[i - 2][j].type) {
							let oldType = this.arrayOfGems[i][j].type;
							while (oldType === this.arrayOfGems[i][j].type) {
								this.arrayOfGems[i][j].type = this.randomTypeOfGem(this.typeOfBundle);
							}
						}
					}
					if (j > 1) {
						if (this.arrayOfGems[i][j].type === this.arrayOfGems[i][j - 1].type && this.arrayOfGems[i][j].type === this.arrayOfGems[i][j - 2].type) {
							let oldType = this.arrayOfGems[i][j].type;
							while (oldType === this.arrayOfGems[i][j].type) {
								this.arrayOfGems[i][j].type = this.randomTypeOfGem(this.typeOfBundle);
							}
						}
					}
				}
			}
		}
	
		clearBoardDOM() {
			$(`.panel-body`)[0].innerHTML = ``;
		}

	}
	function createNewBoard() {
		newBoard = new Board(8, `fruits`);
	}
	createNewBoard();

});


