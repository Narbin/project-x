/* global document:true $:true event:true*/
document.addEventListener(`DOMContentLoaded`, () => {

	$(`#menu`).modal(`toggle`);
	$(`#play`).bind(`click`, function () {
		$(`#menu`).modal(`toggle`);
		createNewBoard();
		$(`#board`).modal(`toggle`);
	});

	let alreadyTileSelected = ``;

	$(`.panel-body`).bind(`click`, whatTileWasClicked);

	$(`#resetBoard`).bind(`click`, function () {
		newBoard.clearBoardDOM();
		newBoard = new Board(newBoard.size, newBoard.typeOfBundle);
	});

	function setMinHeight() {
		if (!newBoard.minHeight) {
			let getActualHeight = $(`.panel-body`).children().height(),
				boardSize = newBoard.size * newBoard.size;
			for (let i = 0; i < boardSize; i += 1) {
				$(`.panel-body`).children()[i].style.minHeight = getActualHeight + 'px';
			}
			newBoard.minHeight = true;
		}
	}

	function whatTileWasClicked(event) {
		if (event.target !== event.currentTarget) {
			selectTileDOM(event.target);
		}
		event.stopPropagation();
	}

	function changeTilesPosition(tile) {
		let x1 = parseInt(tile.getAttribute(`x`), 10),
			y1 = parseInt(tile.getAttribute(`y`), 10),
			x2 = parseInt(alreadyTileSelected.getAttribute(`x`), 10),
			y2 = parseInt(alreadyTileSelected.getAttribute(`y`), 10),
			tempTile;

		if (x1 === x2 + 1 && y1 === y2 || x1 === x2 - 1 && y1 === y2 || x1 === x2 && y1 === y2 + 1 || x1 === x2 && y1 === y2 - 1) {
			tempTile = newBoard.arrayOfTiles[y2][x2];
			newBoard.arrayOfTiles[y2][x2] = newBoard.arrayOfTiles[y1][x1];
			newBoard.arrayOfTiles[y1][x1] = tempTile;

			$(tile).attr(`x`, `${x2}`);
			$(tile).attr(`y`, `${y2}`);
			$(alreadyTileSelected).attr(`x`, `${x1}`);
			$(alreadyTileSelected).attr(`y`, `${y1}`);

			let toTop = $(tile).offset().top,
				toLeft = $(tile).offset().left,
				fromTop = $(alreadyTileSelected).offset().top,
				fromLeft = $(alreadyTileSelected).offset().left,
				distanseX,
				distanseY;

			distanseX = fromTop - toTop;
			distanseY = fromLeft - toLeft;

			$(tile).animate({
				left: `+=` + distanseY,
				top: `+=` + distanseX
			}, 150);

			$(alreadyTileSelected).animate({
				left: `-=` + distanseY,
				top: `-=` + distanseX
			}, 150, function () {
				alreadyTileSelected = ``;
			});

			return true;
		} else {
			return false;
		}
	}

	function selectTileDOM() {
		setMinHeight();

		if ($(event.target).hasClass(`tile`)) {
			if (alreadyTileSelected === event.target) {
				$(event.target).toggleClass(`selected`);
				alreadyTileSelected = ``;
			} else if (alreadyTileSelected === ``) {
				$(event.target).toggleClass(`selected`);
				alreadyTileSelected = event.target;
			} else {
				if (changeTilesPosition(event.target)) {
					profile.addTurns();
					refreshAmount(`turns`, profile.turns);
					$(alreadyTileSelected).toggleClass(`selected`);
					newBoard.checkBoard();
					newBoard.deleteTiles();

				}
			}
		}
	}

	function refreshAmount(id, variable) {
		$(`#${id}`).text(variable);
	}

	class Profile {
		constructor(_name) {
			this.name = _name;
			this.points = 0;
			this.turns = 0;
		}

		addPoints(howMany = 1) {
			this.points += howMany;
			return this;
		}

		addTurns(howMany = 1) {
			this.turns += howMany;
			return this;
		}
	}

	class Tile {
		constructor(_typeOfBundle) {
			this.type = _typeOfBundle;
			this.imageSrc = null;
			this.points = 1;
			this.isSelected = false;
			this.toDelete = false;
		}
	}

	class Board {
		constructor(_size, _typeOfBundle) {
			this.size = _size;
			this.typeOfBundle = _typeOfBundle;
			this.minHeight = false;
			this.createTiles();
			this.shuffleBoard();
			this.setImageSrc();
			this.drawTiles();
		}

		createTiles() {
			this.arrayOfTiles = new Array(this.size);
			for (let i = 0; i < this.size; i += 1) {
				this.arrayOfTiles[i] = new Array(this.size);
				for (let j = 0; j < this.size; j += 1) {
					this.arrayOfTiles[i][j] = new Tile(this.randomTypeOfTile(this.typeOfBundle));
				}
			}
			return this;
		}

		randomTypeOfTile(bundle) {
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

		drawTiles() {
			let divForTiles = $(`.panel-body`)[0];
			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					let creatingDiv = $('<div>', { 'class': 'col-xs-2 no-padding' });
					let creatingImg = $('<img>', { 'class': 'no-padding tile', 'src': this.arrayOfTiles[i][j].imageSrc });
					$(creatingImg).attr(`x`, `${j}`);
					$(creatingImg).attr(`y`, `${i}`);
					$(divForTiles).append(creatingDiv);
					$(creatingDiv).append(creatingImg);
				}

			}
			return this;
		}

		setImageSrc() {
			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					this.arrayOfTiles[i][j].imageSrc = `images/${this.arrayOfTiles[i][j].type}.svg`;
				}
			}
			return this;
		}

		shuffleBoard() {
			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					if (i > 1) {
						if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i - 1][j].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i - 2][j].type) {
							let oldType = this.arrayOfTiles[i][j].type;
							while (oldType === this.arrayOfTiles[i][j].type) {
								this.arrayOfTiles[i][j].type = this.randomTypeOfTile(this.typeOfBundle);
							}
						}
					}
					if (j > 1) {
						if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j - 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j - 2].type) {
							let oldType = this.arrayOfTiles[i][j].type;
							while (oldType === this.arrayOfTiles[i][j].type) {
								this.arrayOfTiles[i][j].type = this.randomTypeOfTile(this.typeOfBundle);
							}
						}
					}
				}
			}
			return this;
		}

		checkBoard() {
			let array = newBoard.arrayOfTiles;

			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size - 2; j += 1) {
					if (array[i][j].type === array[i][j + 1].type && array[i][j].type === array[i][j + 2].type) {
						array[i][j].toDelete = true;
						array[i][j + 1].toDelete = true;
						array[i][j + 2].toDelete = true;
					}
				}
			}

			for (let i = 0; i < this.size - 2; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					if (array[i][j].type === array[i + 1][j].type && array[i][j].type === array[i + 2][j].type) {
						array[i][j].toDelete = true;
						array[i + 1][j].toDelete = true;
						array[i + 2][j].toDelete = true;
					}
				}
			}
			return this;
		}

		deleteTiles() {
			let array = newBoard.arrayOfTiles;

			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					if (array[i][j].toDelete) {
						for (let k = 0; k < $(`.tile`).length; k += 1) {
							if (parseInt($(`.tile`)[k].getAttribute(`x`), 10) === j && parseInt($(`.tile`)[k].getAttribute(`y`), 10) === i) {
								let tile = $(`.tile`)[k];
								$(tile).animate({
									opacity: 0
								}, 500, function () {
									tile.src = ``;
									tile.className = `col-xs-2 no-padding`;
									tile.remove();
								});
								

							}
						}
					}
				}
			}
			return this;
		}
	
		clearBoardDOM() {
			$(`.panel-body`)[0].innerHTML = ``;
		}

	}
	function createNewBoard() {
		newBoard = new Board(8, `fruits`);
		profile = new Profile(`test`);
	}

});


