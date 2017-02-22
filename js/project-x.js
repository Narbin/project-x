/* global document:true $:true event:true*/


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

	function moveDownTile(firstTileY, firstTileX) {
		let i = 0;
		while (firstTileY - i > 0) {
			console.log(firstTileY, firstTileX)
			console.log(document.querySelector(`[x="${firstTileX}"][y="${firstTileY - i}"]`), document.querySelector(`[x="${firstTileX}"][y="${firstTileY - i - 1}"]`))
			let firstTile = document.querySelector(`[x="${firstTileX}"][y="${firstTileY - i}"]`),
				secondTile = document.querySelector(`[x="${firstTileX}"][y="${firstTileY - i - 1}"]`),
				tempTile,
				firstX = parseInt(firstTile.getAttribute(`x`), 10),
				firstY = parseInt(firstTile.getAttribute(`y`), 10),
				secondY = parseInt(secondTile.getAttribute(`y`), 10),
				parentFirstTile = firstTile.parentNode,
				parentSecondTile = secondTile.parentNode,
				childParentFirstTile = parentFirstTile.firstChild,
				childParentSecondTile = parentSecondTile.firstChild;

			tempTile = newBoard.arrayOfTiles[secondY][firstX];
			newBoard.arrayOfTiles[secondY][firstX] = newBoard.arrayOfTiles[firstY][firstX];
			newBoard.arrayOfTiles[firstY][firstX] = tempTile;

			let toTop = $(firstTile).offset().top,
				toLeft = $(firstTile).offset().left,
				fromTop = $(secondTile).offset().top,
				fromLeft = $(secondTile).offset().left,
				distanseX,
				distanseY;

				distanseX = fromTop - toTop;
				distanseY = fromLeft - toLeft;

				$(secondTile).animate({
					//left: `-=` + distanseY, // powinna być animacja, ale kiedy jest, to się tam dzieją dziwne rzeczy 
					//top: `-=` + distanseX
			}, 200, function () {
				$(firstTile).attr(`y`, secondY);
				$(secondTile).attr(`y`, firstY);

				parentFirstTile.replaceChild(childParentSecondTile, childParentFirstTile);
				parentSecondTile.appendChild(childParentFirstTile);
				
				alreadyTileSelected = ``;
			});


				i += 1;
			}
		}

		function setMinHeight() {
			if (!newBoard.minHeight) {
				let getActualHeight = $(`.panel-body`).children().height(),
					boardSize = newBoard.size * newBoard.size;
				for (let i = 0; i < boardSize; i += 1) {
					$(`.panel-body`).children()[i].style.minHeight = getActualHeight + `px`;
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
				tempTile,				
				parentFirstTile = tile.parentNode,
				parentSecondTile = alreadyTileSelected.parentNode,
				childParentFirstTile = parentFirstTile.firstChild,
				childParentSecondTile = parentSecondTile.firstChild;

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
				}, 200);

				$(alreadyTileSelected).animate({
					left: `-=` + distanseY,
					top: `-=` + distanseX
				}, 200, function () {
					$(tile).css({'top' : '0px', 'left' : '0px'});
					$(alreadyTileSelected).css({'top' : '0px', 'left' : '0px'});
					parentFirstTile.replaceChild(childParentSecondTile, childParentFirstTile);
					parentSecondTile.appendChild(childParentFirstTile);

				setTimeout(something, 300)
				
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
						$(alreadyTileSelected).toggleClass(`selected`);
						profile.addTurns();
						refreshAmount(`turns`, profile.turns);
					}
				}
			}
		}

		function refreshAmount(id, variable) {
			let oldNumber = parseInt($(`#${id}`).text(), 10);
			$(`#${id}`)
			.prop(`number`, oldNumber)
			.animateNumber(
				{
					number: variable
				},
				200
			);
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
				this.bundleObj = this.createBundleObj(this.typeOfBundle);
				this.minHeight = false;
				this.foundedFit = false;
				this.clearTilesObj = [ ];
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
				let bundle = ``;
				switch (nameOfBundle) {
					case `fruits`:
					bundle = [`banana`, `cherry`, `pear`, `pineapple`, `raspberry`, `strawberry`];
					break;
					case `gems`:
					bundle = [`amethyst`, `cut-diamond`, `emerald`, `rupee`, `saphir`, `topaz`];
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

			findFit() {
				let array = this.arrayOfTiles;
				this.foundedFit = false;


				for (let i = 0; i < this.size; i += 1) {
					for (let j = 0; j < this.size - 2; j += 1) {
						if (array[i][j].type === array[i][j + 1].type && array[i][j].type === array[i][j + 2].type) {
							array[i][j].toDelete = true;
							array[i][j + 1].toDelete = true;
							array[i][j + 2].toDelete = true;
							this.foundedFit = true;
						}
					}
				}

				for (let i = 0; i < this.size - 2; i += 1) {
					for (let j = 0; j < this.size; j += 1) {
						if (array[i][j].type === array[i + 1][j].type && array[i][j].type === array[i + 2][j].type) {
							array[i][j].toDelete = true;
							array[i + 1][j].toDelete = true;
							array[i + 2][j].toDelete = true;
							this.foundedFit = true;
						}
					}
				}
				return this;
			}

			countFoundedTiles() {
				let array = this.arrayOfTiles,
					bundleLength = this.bundleObj.length;

				for (let i = 0; i < this.size; i += 1) {
					for (let j = 0; j < this.size; j += 1) {
						if (array[i][j].toDelete) {
							for (let k = 0; k < bundleLength; k += 1) {
								if (array[i][j].type === this.bundleObj[k]) {
									typesOfTiles[k] += 1;
								}
							}
						}
					}
				}
				return this;
			}


			addPointsToProfile() {
				let len = typesOfTiles.length - 1;
				for (let i = 0; i <= len; i += 1) {
					switch (typesOfTiles[i]) {
						case (3 || 6 || 9):
						profile.addPoints(typesOfTiles[i]);
						break;
						case (4 || 8):
						profile.addPoints(typesOfTiles[i] * 2);
						break;
						case (5 || 10):
						profile.addPoints(typesOfTiles[i] * 3);
						break;
						case 7:
						profile.addPoints(typesOfTiles[i] + 4);
						break;
						default:
						break;
					}
				}

				typesOfTiles = [0, 0, 0, 0, 0, 0];
				return this;
			}

			deleteTiles(callback) {
				let array = this.arrayOfTiles;
				for (let i = 0; i < this.size; i += 1) {
					for (let j = 0; j < this.size; j += 1) {
						if (array[i][j].toDelete) {
							for (let k = 0; k < $(`.tile`).length; k += 1) {
								if (parseInt($(`.tile`)[k].getAttribute(`x`), 10) === j && parseInt($(`.tile`)[k].getAttribute(`y`), 10) === i) {
									let tile = $(`.tile`)[k];
									$(tile).animate({
										opacity: 0
									}, 450, function () {
										tile.src = ``;
										tile.className = `col-xs-2 no-padding`;
										tile.remove();
										
									});
								}
							}
							array[i][j].toDelete = false;
							array[i][j].type = `clear`;
							setTimeout(callback, 600);
						}
					}
				}
				
				return this;
			}

			findClearTiles() {
				newBoard.clearTilesObj = [ ];
				let array = newBoard.arrayOfTiles;
				for (let i = 0; i < newBoard.size; i += 1) {
					for (let j = 0; j < newBoard.size; j += 1) {
						if (array[i][j].type === `clear`) {
							newBoard.clearTilesObj.push([i, j]);
						}
					}
				}
				return newBoard;
			}

			setClearTiles() {
				let objLength = newBoard.clearTilesObj.length;
				for (let i = 0; i < objLength; i += 1) {
					moveDownTile(newBoard.clearTilesObj[i][0], newBoard.clearTilesObj[i][1]);
				}
				return newBoard;
			}

			generateNewTiles() {
				newBoard.findClearTiles();
				let objLength = newBoard.clearTilesObj.length,
					boardSize = newBoard.size * newBoard.size,
					i = 0;

				if (newBoard.clearTilesObj.length) {
					for (let j = 0; j < objLength; j += 1) {
						newBoard.arrayOfTiles[newBoard.clearTilesObj[j][0]][newBoard.clearTilesObj[j][1]] = new Tile(newBoard.randomTypeOfTile(newBoard.bundleObj));

					}

					for (let k = 0; k < boardSize; k += 1) {
						if ($(".col-xs-2")[k].children.length === 0) {
							let creatingImg = $('<img>', { 'class': 'no-padding tile', 'src': `images/${newBoard.arrayOfTiles[newBoard.clearTilesObj[i][0]][newBoard.clearTilesObj[i][1]].type}.svg` });
							$(creatingImg).attr(`x`, `${newBoard.clearTilesObj[i][1]}`);
							$(creatingImg).attr(`y`, `${newBoard.clearTilesObj[i][0]}`);
							$(creatingImg).css('opacity', '0');
							creatingImg.appendTo($(".col-xs-2")[k]);
							$(creatingImg).animate({
								opacity: '1'
							}, 200);
							i += 1;
						}
					}
			return this;
			}
		}
	
		clearBoardDOM() {
			$(`.panel-body`)[0].innerHTML = ``;
		}

	}
	function createNewBoard() {
		newBoard = new Board(8, `gems`);
		profile = new Profile(`test`);
	}

function engine () {
  				newBoard
				.findFit()
				.countFoundedTiles()
				.addPointsToProfile()
				.deleteTiles(function () {
                                     newBoard
                                       .generateNewTiles();
                                 })
				.findClearTiles()
				.setClearTiles();
                refreshAmount(`points`, profile.points);

   if ( newBoard.foundedFit ) {
     setTimeout(engine, 650);
   }
}



