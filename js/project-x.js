/* global document:true $:true event:true*/
document.addEventListener(`DOMContentLoaded`, () => {

	$(`#menu`).modal(`toggle`);
	$(`#play`).bind(`click`, function () {
		$(`#menu`).modal(`toggle`);
		createNewBoard();
		$(`#board`).modal(`toggle`);
	});

	let alreadyTileSelected = ``,
		typesOfTiles = [0, 0, 0, 0, 0, 0];

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
					$(alreadyTileSelected).toggleClass(`selected`);
					newBoard.findMatch();
					newBoard.countFoundedTiles();
					newBoard.addPointsToProfile();
					newBoard.deleteTiles();
					refreshAmount(`points`, profile.points);
					refreshAmount(`turns`, profile.turns);

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
			this.bundleObj = this.createBundleObj(_typeOfBundle);
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
					this.arrayOfTiles[i][j] = new Tile(this.randomTypeOfTile(this.bundleObj));
				}
			}
			return this;
		}

		createBundleObj(nameOfBundle) {
			let bundle = '';
			switch (nameOfBundle) {
				case `fruits`:
					bundle = [`banana`, `cherry`, `pear`, `pineapple`, `raspberry`, `strawberry`];
					break;
				default:
					bundle = [`banana`, `cherry`, `pear`, `pineapple`, `raspberry`, `strawberry`];
					break;
			}
			return bundle;
		}

		randomTypeOfTile() {
			return this.bundleObj[Math.floor(Math.random() * this.bundleObj.length)];
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

		findMatch() {
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

		countFoundedTiles() {
			let array = newBoard.arrayOfTiles;

			for (let i = 0; i < this.size; i += 1) {
				for (let j = 0; j < this.size; j += 1) {
					if (array[i][j].toDelete) {
						switch(array[i][j].type) {
						    case this.bundleObj[0]:
						        typesOfTiles[0] += 1;
						        break;
						    case this.bundleObj[1]:
						        typesOfTiles[1]+= 1;
						        break;
						    case this.bundleObj[2]:
						    	typesOfTiles[2] += 1;
						        break;
						    case this.bundleObj[3]:
						    	typesOfTiles[3] += 1;
						    	break;
						    case this.bundleObj[4]:
						    	typesOfTiles[4] += 1;
						    	break;
						    case this.bundleObj[5]:
						   		typesOfTiles[5] += 1;
						    	break;
						}
					}
				}
			}
		}

		addPointsToProfile() {
		let len = typesOfTiles.length-1;
			for(let i = 0; i <= len; i += 1) {
				
				switch(typesOfTiles[i]) {
					case (3 || 6 || 9):
						profile.addPoints(typesOfTiles[i]);
						break;
					case (4 || 8):
						profile.addPoints(typesOfTiles[i]*2);
						break;
					case (5 || 10):
						profile.addPoints(typesOfTiles[i]*3);
						break;
					case 7:
						profile.addPoints(typesOfTiles[i]+4);
						break;
				}
			}

			typesOfTiles = [0, 0, 0, 0, 0, 0];
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
						array[i][j].toDelete = false;
						array[i][j].type = '';
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


