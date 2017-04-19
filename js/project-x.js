/* global document:true event:true window:true localStorage: true*/
'use strict';
var profile,
	newBoard;
for (var i = 0; i <= document.getElementsByClassName('btn').length - 1; i += 1) {
	document.getElementsByClassName('btn')[i].addEventListener('click', function (event) {
		if (event.target.getAttribute('data-modal')) {
			if (event.target.getAttribute('data-modal') === 'achievements') {
				showAchievementsDOM();
				toggleModal(`${event.target.getAttribute('data-modal')}`);
			} else if (event.target.getAttribute('data-modal') === `statistics`) {
				showStatisticsDOM();
				toggleModal(`${event.target.getAttribute('data-modal')}`);
			} else if (event.target.getAttribute('data-modal') === `campaignModal`) {
				showCampaignDOM();
				toggleModal(`${event.target.getAttribute('data-modal')}`);
			} else {
				toggleModal(`${event.target.getAttribute('data-modal')}`);
				exitFullscreen();
			}
		} else if (event.target.getAttribute('data-mission')) {
			startMission(event.target.getAttribute('data-mission'));
		} else if (event.target.getAttribute('data-resetBoard')) {
			newBoard.clearBoardDOM();
			newBoard.createTiles();
			newBoard.shuffleBoard();
			newBoard.setImageSrc();
			newBoard.drawTiles();
			newBoard.minHeight = false;
			setMinHeight();
		} else if (event.target.getAttribute('data-createProfile')) {
			var name = document.getElementsByName("name")[0].value;
			profile = new Profile(name);
			saveProfile();
			toggleModal(`${event.target.getAttribute('data-createProfile')}`);
		} else if (event.target.getAttribute('data-difficulty')) {
			if (typeof newBoard === 'undefined') {
				newBoard = new Board(8, `gems`);
				generateRandomTasks(event.target.getAttribute('data-difficulty'));
				generateTasksDOM();
			} else {
				resetActualGame();
				newBoard = new Board(8, `gems`);
				generateRandomTasks(event.target.getAttribute('data-difficulty'));
				generateTasksDOM();
			}
			toggleModal(`board`);
			setMinHeight();
			launchIntoFullscreen(document.documentElement);
		} else if (event.target.getAttribute('data-arcade')) {
			if (typeof newBoard === 'undefined') {
				newBoard = new Board(8, `gems`);
			} else {
				resetActualGame();
				newBoard = new Board(8, `gems`);
			}
			newBoard.arcadeMode.type = event.target.getAttribute('data-arcade');
			newBoard.arcadeMode.condition = profile.totalStatistics[newBoard.arcadeMode.type][2];
			generateArcadeInfoDOM(event.target.getAttribute('data-arcade'));
			toggleModal(`arcadeInfo`);
		}
		event.stopPropagation();
	});
}

ontouch(document.getElementsByClassName(`panel-body`)[0], function (evt, dir, phase, swipetype, distance) {
	if (dir === 'none' && phase === 'start') {
		whatTileWasClicked(evt);
	}
	if (swipetype === 'left') {
		changeTileWith(`left`);
	} else if (swipetype === 'right') {
		changeTileWith(`right`);
	} else if (swipetype === 'up') {
		changeTileWith(`up`);
	} else if (swipetype === 'down') {
		changeTileWith(`down`);
	}
});

document.getElementsByClassName(`panel-body`)[0].addEventListener('click', function (event) {
	whatTileWasClicked(event);
});

function changeTileWith(direction) {
	if (newBoard.alreadyTileSelected) {
		var x = parseInt(newBoard.alreadyTileSelected.getAttribute(`data-x`), 10),
			y = parseInt(newBoard.alreadyTileSelected.getAttribute(`data-y`), 10);
		switch (direction) {
			case `right`:
				
				changeTilesPosition(getElementByDataXY("tile", [x + 1, y]));
				newBoard.alreadyTileSelected.classList.toggle('selected');
				break;
			case `left`:
				changeTilesPosition(getElementByDataXY("tile", [x - 1, y]));
				newBoard.alreadyTileSelected.classList.toggle('selected');
				break;
			case `up`:
				changeTilesPosition(getElementByDataXY("tile", [x, y - 1]));
				newBoard.alreadyTileSelected.classList.toggle('selected');
				break;
			case `down`:
				changeTilesPosition(getElementByDataXY("tile", [x, y + 1]));
				newBoard.alreadyTileSelected.classList.toggle('selected');
				break;
			default:
				break;
		}
	}
}

function moveDownTile(firstTileY, firstTileX) {
	var i = 0;

	while (firstTileY - i > 0) {

		var firstTile = getElementByDataXY('tile', [firstTileX, firstTileY - i]),
			secondTile = getElementByDataXY('tile', [firstTileX, firstTileY - i - 1]),
			firstX = parseInt(firstTile.getAttribute(`data-x`), 10),
			firstY = parseInt(firstTile.getAttribute(`data-y`), 10),
			secondY = parseInt(secondTile.getAttribute(`data-y`), 10),
			parentFirstTile = firstTile.parentNode,
			parentSecondTile = secondTile.parentNode,
			childParentFirstTile = parentFirstTile.firstChild,
			childParentSecondTile = parentSecondTile.firstChild,
			tempTile;

		tempTile = newBoard.arrayOfTiles[secondY][firstX];
		newBoard.arrayOfTiles[secondY][firstX] = newBoard.arrayOfTiles[firstY][firstX];
		newBoard.arrayOfTiles[firstY][firstX] = tempTile;

		firstTile.setAttribute('data-y', secondY);
		secondTile.setAttribute('data-y', firstY);
		parentFirstTile.replaceChild(childParentSecondTile, childParentFirstTile);
		parentSecondTile.appendChild(childParentFirstTile);
			
		newBoard.alreadyTileSelected = ``;


		i += 1;
	}
	setTimeout(function () {
		newBoard.deleteTiles();
	}, 100);
}

function setMinHeight() {
	if (!newBoard.minHeight) {
		var getActualHeight = document.getElementsByClassName('panel-body')[0].childNodes[1].clientHeight,
			boardSize = newBoard.size * newBoard.size;
		for (var i = 1; i < boardSize; i += 1) {
			document.getElementsByClassName('panel-body')[0].childNodes[i].style.minHeight = getActualHeight + `px`;
		}
		newBoard.minHeight = true;
	}
}

function whatTileWasClicked(event) {
	if (event.target !== event.currentTarget) {
		selectTileDOM(event);
	}
	event.stopPropagation();
}

function changeTilesPosition(tile) {
	if (tile) {
		var x1 = parseInt(tile.getAttribute(`data-x`), 10),
			y1 = parseInt(tile.getAttribute(`data-y`), 10),
			x2 = parseInt(newBoard.alreadyTileSelected.getAttribute(`data-x`), 10),
			y2 = parseInt(newBoard.alreadyTileSelected.getAttribute(`data-y`), 10),
			parentFirstTile = tile.parentNode,
			parentSecondTile = newBoard.alreadyTileSelected.parentNode,
			childParentFirstTile = parentFirstTile.firstChild,
			childParentSecondTile = parentSecondTile.firstChild,
			tempTile;

		if (x1 === x2 + 1 && y1 === y2 || x1 === x2 - 1 && y1 === y2 || x1 === x2 && y1 === y2 + 1 || x1 === x2 && y1 === y2 - 1) {

			newBoard.ableToSelect = false;

			var tilePosition = tile.getBoundingClientRect(),
				selectedPosition = newBoard.alreadyTileSelected.getBoundingClientRect(),
				toTop = tilePosition.top + document.body.scrollTop,
				toLeft = tilePosition.left + document.body.scrollLeft,
				fromTop = selectedPosition.top + document.body.scrollTop,
				fromLeft = selectedPosition.left + document.body.scrollLeft,
				distanseX,
				distanseY;

			distanseY = fromTop - toTop;
			distanseX = fromLeft - toLeft;

			tempTile = newBoard.arrayOfTiles[y2][x2];
			newBoard.arrayOfTiles[y2][x2] = newBoard.arrayOfTiles[y1][x1];
			newBoard.arrayOfTiles[y1][x1] = tempTile;

			newBoard.findFit();
			if (!newBoard.foundedFit) {
				tempTile = newBoard.arrayOfTiles[y1][x1];
				newBoard.arrayOfTiles[y1][x1] = newBoard.arrayOfTiles[y2][x2];
				newBoard.arrayOfTiles[y2][x2] = tempTile;

				TweenLite.to(tile, 0.4, {
					x:`+=${distanseX}`,
					y:`+=${distanseY}`,
					ease: Back.easeInOut
				});
				TweenLite.to(newBoard.alreadyTileSelected, 0.4, {
					x:`-=${distanseX}`, 
					y:`-=${distanseY}`,
					ease: Back.easeInOut,
					onComplete: function () {
						TweenLite.to(tile, 0.4, {
							x:`-=${distanseX}`, 
							y:`-=${distanseY}`,
							ease: Back.easeInOut
						});
						TweenLite.to(newBoard.alreadyTileSelected, 0.4, {
							x:`+=${distanseX}`,
							y:`+=${distanseY}`,
							ease: Back.easeInOut
						});
						newBoard.alreadyTileSelected = '';
						newBoard.ableToSelect = true;
					}
				});
			} else {

				tile.setAttribute('data-x', `${x2}`);
				tile.setAttribute('data-y', `${y2}`);
				newBoard.alreadyTileSelected.setAttribute('data-x', `${x1}`);
				newBoard.alreadyTileSelected.setAttribute('data-y', `${y1}`);

				TweenLite.to(tile, 0.4, {
					x: `+=${distanseX}`,
					y: `+=${distanseY}`,
					ease: Quart.easeInOut,
					onComplete: function () {
						TweenLite.to(tile, 0, {
							x: 0,
							y: 0,
						});
					}
				});

				TweenLite.to(newBoard.alreadyTileSelected, 0.4, {
					x: `-=${distanseX}`,
					y: `-=${distanseY}`,
					ease: Quart.easeInOut,
					onComplete: function () {
						TweenLite.to(newBoard.alreadyTileSelected, 0, {
							x: 0,
							y: 0,
						});
						newBoard.alreadyTileSelected.style.top = '0px';
						newBoard.alreadyTileSelected.style.left = '0px';
						parentFirstTile.replaceChild(childParentSecondTile, childParentFirstTile);
						parentSecondTile.appendChild(childParentFirstTile);
						newBoard.alreadyTileSelected = '';
						profile.actualStatistics.turns += 1;
						profile.totalStatistics.turns[0] += 1;
						refreshAmount(`turns`, profile.actualStatistics.turns);

						engine();
					}
				});
			}
			return true;
		} else {
			return false;
		}
	}
}

function selectTileDOM(event) {
	var hintDiv = document.getElementsByClassName('hint')[0];
	if (hintDiv) {
		hintDiv.classList.toggle('hint');
	}
	newBoard.hintTimer(true);
	if (newBoard.ableToSelect) {
		if (event.target.classList.contains(`tile`)) {
			if (newBoard.alreadyTileSelected === event.target) {
				event.target.classList.toggle('selected');
				newBoard.alreadyTileSelected = ``;
			} else if (newBoard.alreadyTileSelected === ``) {
				event.target.classList.toggle('selected');
				newBoard.alreadyTileSelected = event.target;
			} else {
				if (changeTilesPosition(event.target)) {
					newBoard.alreadyTileSelected.classList.toggle('selected');
				} else {
					newBoard.alreadyTileSelected.classList.toggle('selected');
					newBoard.alreadyTileSelected = event.target;
					event.target.classList.toggle('selected');
				}
			}
		}
	}
}

function refreshAmount(id, variable, time) {
	if (time === undefined) {
		time = 1000;
	}
	var options = {
		useEasing: true,
		useGrouping: true,
		separator: '',
		decimal: '.',
		prefix: '',
		suffix: ''
	};
	var animate = new CountUp(document.getElementById(`${id}`), parseInt(document.getElementById(`${id}`).innerHTML, 10), variable, 0, time / 1000, options);
	animate.start();
}

class Achievement {
	constructor(_name, _description, _imageSrc, _parametr, _condition) {
		this.name = _name;
		this.description = _description;
		this.imageSrc = _imageSrc;
		this.completed = false;
		this.condition = function () {
			var profileParametr;
			if (typeof profile.totalStatistics[_parametr] === 'undefined') {
				profileParametr = profile[_parametr];
			} else {
				profileParametr = profile.totalStatistics[_parametr][0];
			}
			if (typeof _condition === 'boolean') {
				if (profileParametr === _condition) {
					this.completed = true;
				}
			} else if (typeof _condition === 'number') {
				if (profileParametr >= _condition) {
					this.completed = true;
				}
			}
			return this;
		};
	}
}

class Profile {
	constructor(_name) {
		this.name = _name;
		this.achievements = [ ];
		this.actualStatistics = {
			points: 0,
			turns: 0,
			typesOfTiles: [0, 0, 0, 0, 0, 0],
			combo: 0
		};
		this.milliseconds = 0;
		this.minutesInGame = 0;
		this.totalStatistics = {
			points: [0, 'Zdobyte punkty:'],
			turns: [0, 'Ilość wykonanych ruchów:'],
			completedTasks: [0, 'Ilość wykonanych zadań:'],
			completedGames: [0, 'Ilość zakończonych misji:'],
			maxCombo: [0, 'Największy combos:'],
			timeInGame: [0, 'Czas w grze:'],
			arcadeFirst: [0, 'Najwięcej punktów w 10 turach:', 10],
			arcadeSecond: [0, 'Najwięcej punktów w 20 turach:', 20],
			arcadeThird: [0, 'Najwięcej punktów w 50 turach:', 50],
			arcadeFourth: [0, 'Najwięcej punktów w 100 turach:', 100],
			completedMissions: [0, 'Ilość wykonanych misji kampanii']
		};
		this.campaign = [ ];

		this.createCampaign();
		this.addAchievements();
		this.timeInGame();
		this.checkTime();
	}

	timeInGame() {
		var duration = this.milliseconds,
			seconds = parseInt((duration / 1000) % 60, 10),
			minutes = parseInt((duration / (1000 * 60)) % 60, 10),
			hours = parseInt((duration / (1000 * 60 * 60)) % 24, 10);

		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;

		this.minutesInGame = parseInt(duration / (1000 * 60), 10);

		this.totalStatistics.timeInGame[0] = hours + ":" + minutes + ":" + seconds;
	}

	checkTime() {
		setTimeout(function () {
			profile.milliseconds += 1000;
			profile.timeInGame();
			checkAllAchievements();
			saveProfile();
			profile.checkTime();
		}, 1000);
	}

	addAchievements() {
		if (this.achievements.length === 0) {
			this.achievements.push(new Achievement('Nowicjusz', 'Zdobądź pierwsze 5000 punktów!', 'images/novice.svg', 'points', 5000));
			this.achievements.push(new Achievement('Mistrz', 'Zdobądź 20000 punktów!', 'images/master.svg', 'points', 20000));
			this.achievements.push(new Achievement('Arcymistrz', 'Zdobądź 50000 punktów!', 'images/archmaster.svg', 'points', 50000));
			this.achievements.push(new Achievement('Praktykant', 'Ukończ 10 rozgrywek!', 'images/trainee.svg', 'completedGames', 10));
			this.achievements.push(new Achievement('Doświadczony', 'Ukończ 30 rozgrywek!', 'images/experienced.svg', 'completedGames', 30));
			this.achievements.push(new Achievement('Uczeń z podstawówki', 'Ukończ 10 zadań!', 'images/primaryschool.svg', 'completedTasks', 10));
			this.achievements.push(new Achievement('Uczeń z liceum', 'Ukończ 50 zadań!', 'images/highschool.svg', 'completedTasks', 50));
			this.achievements.push(new Achievement('Szczęściarz', 'Zrób combosa 4x!', 'images/lucky.svg', 'maxCombo', 4));
			this.achievements.push(new Achievement('Dziecko szczęścia!', 'Zrób combosa 8x!', 'images/child.svg', 'maxCombo', 8));
			this.achievements.push(new Achievement('Wciągnięty', 'Spędź 30 min w grze!', 'images/sucked.svg', 'minutesInGame', 30));
		}
	}

	createCampaign() {
		if (this.campaign.length === 0) {
			this.campaign.push(new CampaignMisson(500, [[0, 10], [1, 10]]));
			this.campaign.push(new CampaignMisson(800, [[2, 20], [3, 20]]));
			this.campaign.push(new CampaignMisson(1200, [[1, 33], [3, 33], [5, 33]]));
			this.campaign.push(new CampaignMisson(1200, [[2, 33], [4, 33], [0, 33]]));
			this.campaign.push(new CampaignMisson(1500, [[0, 30], [1, 30], [2, 30], [3, 30]]));
			this.campaign.push(new CampaignMisson(2500, [[0, 35], [1, 35], [2, 35], [3, 35], [4, 35]]));
			this.campaign.push(new CampaignMisson(5000, [[0, 50], [1, 50], [2, 50], [3, 50], [4, 50], [5, 50]]));
			this.campaign.push(new CampaignMisson(5500, [[0, 51], [1, 52], [2, 53], [3, 54], [4, 55], [5, 56]]));
			this.campaign.push(new CampaignMisson(6666, [[0, 66], [1, 66], [2, 66], [3, 66], [4, 66], [5, 66]]));
			this.campaign.push(new CampaignMisson(9999, [[0, 99], [1, 99], [2, 99], [3, 99], [4, 99], [5, 99]]));
			this.campaign.push(new CampaignMisson(1, [[5, 200]]));
			this.campaign.push(new CampaignMisson(2, [[2, 200], [4, 200]]));
			this.campaign.push(new CampaignMisson(12345, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]]));
			this.campaign.push(new CampaignMisson(14141, [[5, 14], [4, 14], [3, 14], [2, 14], [1, 14], [0, 14]]));
			this.campaign.push(new CampaignMisson(16000, [[3, 111], [2, 111], [1, 111], [5, 111], [4, 111], [0, 111]]));
			this.campaign.push(new CampaignMisson(16500, [[2, 350]]));
			this.campaign.push(new CampaignMisson(17000, [[4, 350]]));
			this.campaign.push(new CampaignMisson(25000, [[0, 250], [1, 250], [2, 250], [3, 250], [4, 250], [5, 250]]));


		}
		this.campaign[0].available = true;
	}
}

class Tile {
	constructor(_typeOfBundle) {
		this.type = _typeOfBundle;
		this.imageSrc = null;
		this.points = 4;
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
		this.alreadyTileSelected = ``;
		this.typesOfTiles = [0, 0, 0, 0, 0, 0];
		this.ableToSelect = true;
		this.tasks = [ ];
		this.arcadeMode = {
			condition: 0,
			type: ''
		};
		this.mission = null;
		this.maxTurns = 0;
		this.hintTimerId = 0;
		this.createTiles();
		this.shuffleBoard();
		this.setImageSrc();
		this.drawTiles();
		this.hintTimer();
	}

	createTiles() {
		this.arrayOfTiles = new Array(this.size);
		for (var i = 0; i < this.size; i += 1) {
			this.arrayOfTiles[i] = new Array(this.size);
			for (var j = 0; j < this.size; j += 1) {
				this.arrayOfTiles[i][j] = new Tile(this.randomTypeOfTile(this.bundleObj));
			}
		}
		return this;
	}

	createBundleObj(nameOfBundle) {
		if (nameOfBundle === undefined) {
			nameOfBundle = `gems`;
		}
		var bundle = [ ];
		switch (nameOfBundle) {
			case `fruits`:
				bundle = [`banana`, `cherry`, `pear`, `pineapple`, `raspberry`, `strawberry`];
				break;
			case `gems`:
				bundle = [`amethyst`, `cut-diamond`, `emerald`, `rupee`, `saphir`, `topaz`];
				break;
			default:
				break;
		}
		return bundle;
	}

	randomTypeOfTile() {
		return this.bundleObj[Math.floor(Math.random() * this.bundleObj.length)];
	}

	drawTiles() {
		var divForTiles = document.getElementsByClassName('panel-body')[0];
		for (var i = 0; i < this.size; i += 1) {
			for (var j = 0; j < this.size; j += 1) {

				var creatingDiv = document.createElement("div"),
					creatingImg = document.createElement("img");
				creatingDiv.className = "col-xs-2 no-padding";
				creatingImg.className = "no-padding tile";
				creatingImg.src = this.arrayOfTiles[i][j].imageSrc;
				creatingImg.setAttribute(`data-x`, `${j}`);
				creatingImg.setAttribute(`data-y`, `${i}`);
				divForTiles.appendChild(creatingDiv);
				creatingDiv.appendChild(creatingImg);
			}
		}
		return this;
	}

	setImageSrc() {
		for (var i = 0; i < this.size; i += 1) {
			for (var j = 0; j < this.size; j += 1) {
				this.arrayOfTiles[i][j].imageSrc = `images/${this.arrayOfTiles[i][j].type}.svg`;
			}
		}
		return this;
	}

	shuffleBoard() {
		var oldType;
		for (var i = 0; i < this.size; i += 1) {
			for (var j = 0; j < this.size; j += 1) {
				if (i > 1) {
					if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i - 1][j].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i - 2][j].type) {
						oldType = this.arrayOfTiles[i][j].type;
						while (oldType === this.arrayOfTiles[i][j].type) {
							this.arrayOfTiles[i][j].type = this.randomTypeOfTile(this.typeOfBundle);
						}
					}
				}
				if (j > 1) {
					if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j - 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j - 2].type) {
						oldType = this.arrayOfTiles[i][j].type;
						while (oldType === this.arrayOfTiles[i][j].type) {
							this.arrayOfTiles[i][j].type = this.randomTypeOfTile(this.typeOfBundle);
						}
					}
				}
			}
		}
		this.findFit();
		if (this.foundedFit) {
			this.foundedFit = false;
			this.shuffleBoard();
		}
		return this;
	}

	findFit() {
		var array = this.arrayOfTiles;
		this.foundedFit = false;

		for (var i = 0; i < this.size; i += 1) {
			for (var j = 0; j < this.size - 2; j += 1) {
				if (array[i][j].type === array[i][j + 1].type && array[i][j].type === array[i][j + 2].type) {
					array[i][j].toDelete = true;
					array[i][j + 1].toDelete = true;
					array[i][j + 2].toDelete = true;
					this.foundedFit = true;
				}
			}
		}

		for (var i = 0; i < this.size - 2; i += 1) {
			for (var j = 0; j < this.size; j += 1) {
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
		var array = this.arrayOfTiles,
			bundleLength = this.bundleObj.length;

		for (var i = 0; i < this.size; i += 1) {
			for (var j = 0; j < this.size; j += 1) {
				if (array[i][j].toDelete) {
					for (var k = 0; k < bundleLength; k += 1) {
						if (array[i][j].type === this.bundleObj[k]) {
							this.typesOfTiles[k] += 1;
						}
					}
				}
			}
		}
		return this;
	}

	addPointsToProfile() {
		var len = this.typesOfTiles.length - 1;
		for (var i = 0; i <= len; i += 1) {
			switch (this.typesOfTiles[i]) {
				case 3:
				case 6:
				case 9:
					profile.actualStatistics.points += (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) + ((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * profile.actualStatistics.combo);
					profile.totalStatistics.points[0] += (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) + ((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * profile.actualStatistics.combo);
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case 4:
				case 8:
					profile.actualStatistics.points += (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 2 + (((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 2) * profile.actualStatistics.combo);
					profile.totalStatistics.points[0] += (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 2 + (((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 2) * profile.actualStatistics.combo);
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case 5:
				case 10:
					profile.actualStatistics.points += (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 3 + (((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 3) * profile.actualStatistics.combo);
					profile.totalStatistics.points[0] += (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 3 + (((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 3) * profile.actualStatistics.combo);
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case 7:
					profile.actualStatistics.points += ((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) + (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 2) + (((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) + (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 2) * profile.actualStatistics.combo);
					profile.totalStatistics.points[0] += ((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) + (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 2) + (((this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) + (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * 2) * profile.actualStatistics.combo);
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				default:
					break;
			}
		}
		this.typesOfTiles = [0, 0, 0, 0, 0, 0];
		return this;
	}

	hideTiles() {
		var array = this.arrayOfTiles,
			tile = document.getElementsByClassName('tile');
		for (var i = 0; i < this.size; i += 1) {
			for (var j = 0; j < this.size; j += 1) {
				if (array[i][j].toDelete) {
					for (var k = 0; k < tile.length; k += 1) {
						if (parseInt(tile[k].getAttribute(`data-x`), 10) === j && parseInt(tile[k].getAttribute(`data-y`), 10) === i) {
							TweenLite.to(tile[k], 0.4, {
								opacity: 0,
								ease: Cubic.easeOut,
								onComplete: function () {
									newBoard.findClearTiles();
									newBoard.setClearTiles();
								}
							});
						}
					}
					array[i][j].type = `clear`;
				}
			}
		}
		return this;
	}

	deleteTiles() {
		var array = this.arrayOfTiles,
			tile = document.getElementsByClassName('tile');
		for (var i = 0; i < this.size; i += 1) {
			for (var j = 0; j < this.size; j += 1) {
				if (array[i][j].toDelete) {
					for (var k = 0; k < tile.length; k += 1) {
						if (parseInt(tile[k].getAttribute(`data-x`), 10) === j && parseInt(tile[k].getAttribute(`data-y`), 10) === i) {
							tile[k].src = ``;
							tile[k].parentNode.removeChild(tile[k]);
						}
					}
					array[i][j].toDelete = false;
				}
			}
		}
		this.generateNewTiles();
		return this;
	}

	findClearTiles() {
		this.clearTilesObj = [ ];
		var array = this.arrayOfTiles;
		for (var i = 0; i < this.size; i += 1) {
			for (var j = 0; j < this.size; j += 1) {
				if (array[i][j].type === `clear`) {
					this.clearTilesObj.push([i, j]);
				}
			}
		}
		return this;
	}

	setClearTiles() {

		var objLength = this.clearTilesObj.length;

		for (var i = 0; i < objLength; i += 1) {
			moveDownTile(this.clearTilesObj[i][0], this.clearTilesObj[i][1]);
		}
		return this;
	}

	generateNewTiles() {
		this.findClearTiles();
		var objLength = this.clearTilesObj.length,
			boardSize = this.size * this.size,
			parentOfTile = document.getElementsByClassName("col-xs-2"),
			i = 0;

		if (this.clearTilesObj.length) {
			for (var j = 0; j < objLength; j += 1) {
				this.arrayOfTiles[this.clearTilesObj[j][0]][this.clearTilesObj[j][1]] = new Tile(this.randomTypeOfTile(this.bundleObj));
			}

			for (var k = 0; k < boardSize; k += 1) {
				if (parentOfTile[k].children.length === 0) {
					var creatingImg = document.createElement("img");
					creatingImg.className = "no-padding tile";
					creatingImg.src = `images/${this.arrayOfTiles[this.clearTilesObj[i][0]][this.clearTilesObj[i][1]].type}.svg`;
					creatingImg.setAttribute(`data-x`, `${this.clearTilesObj[i][1]}`);
					creatingImg.setAttribute(`data-y`, `${this.clearTilesObj[i][0]}`);
					creatingImg.style.opacity = '0';
					parentOfTile[k].appendChild(creatingImg);

					TweenLite.to(creatingImg, 0.4, {
						ease: Cubic.easeOut,
						opacity: `1`
					});

					i += 1;
				}
			}
		}
		return this;
	}

	clearBoardDOM() {
		document.getElementsByClassName(`panel-body`)[0].innerHTML = ``;
	}

	findMove() {
		var objLength = this.arrayOfTiles.length,
			doBreak = false;
		for (var i = 0; i < this.size - 2 && !doBreak; i += 1) {
			for (var j = 0; j < this.size - 1; j += 1) {
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j + 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 2][j + 1].type) {
					showHint([i, j]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j + 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 2][j].type) {
					showHint([i + 1, j + 1]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 2][j + 1].type) {
					showHint([i + 2, j + 1]);
					doBreak = true;
					break;
				}
			}
		}
		for (var i = 0; i < this.size - 2 && !doBreak; i += 1) {
			for (var j = 1; j < this.size; j += 1) {
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j - 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 2][j - 1].type) {
					showHint([i, j]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j - 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 2][j].type) {
					showHint([i + 1, j - 1]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 2][j - 1].type) {
					showHint([i + 2, j - 1]);
					doBreak = true;
					break;
				}
			}
		}
		for (var i = 0; i < this.size - 1 && !doBreak; i += 1) {
			for (var j = 0; j < this.size - 2; j += 1) {
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j + 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j + 2].type) {
					showHint([i, j]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j + 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j + 2].type) {
					showHint([i + 1, j + 1]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j + 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 1][j + 2].type) {
					showHint([i + 1, j + 2]);
					doBreak = true;
					break;
				}
			}
		}
		for (var i = 1; i < this.size && !doBreak; i += 1) {
			for (var j = 0; j < this.size - 2; j += 1) {
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i - 1][j + 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i - 1][j + 2].type) {
					showHint([i, j]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i - 1][j + 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j + 2].type) {
					showHint([i - 1, j + 1]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j + 1].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i - 1][j + 2].type) {
					showHint([i - 1, j + 2]);
					doBreak = true;
					break;
				}
			}
		}
		for (var i = 0; i < this.size - 2 && !doBreak; i += 1) {
			for (var j = 0; j < this.size - 2; j += 1) {
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 2][j].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i + 3][j].type) {
					showHint([i, j]);
					doBreak = true;
					break;
				}
				if (this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j + 2].type && this.arrayOfTiles[i][j].type === this.arrayOfTiles[i][j + 3].type) {
					showHint([i, j]);
					doBreak = true;
					break;
				}
			}
		}
		if (!doBreak) {
			showPopupDOM(`<div class="noMove">BRAK RUCHU :(</div>`)
			this.clearBoardDOM();
			this.createTiles();
			this.shuffleBoard();
			this.setImageSrc();
			this.drawTiles();
			this.minHeight = false;
			setMinHeight();
		}
	}

	hintTimer(reset) {
		var that = this;
		if (typeof reset === undefined) {
			that.hintTimerId = setTimeout(function () {
				that.findMove();
			}, 5000);
		} else {
			window.clearTimeout(that.hintTimerId);
			that.hintTimerId = setTimeout(function () {
				that.findMove();
			}, 5000);
		}
	}
}

class Task {
	constructor(_type, _amount) {
		this.type = _type;
		this.amount = _amount;
		this.imageSrc = `images/${newBoard.bundleObj[this.type]}.svg`;
		this.completed = false;
		this.checkTask = function () {
			if (profile.actualStatistics.typesOfTiles[this.type] >= this.amount) {
				this.completed = true;
			}
			return this;
		};
	}
}


function engine() {
	newBoard.ableToSelect = false;
	newBoard.findFit();

	if (newBoard.foundedFit) {

		checkCombo();
		
		newBoard.countFoundedTiles()
			.addPointsToProfile()
			.hideTiles();
		refreshAmount(`points`, profile.actualStatistics.points);

		profile.actualStatistics.combo += 1;

		setTimeout(function () {
			engine();
		}, 600);
	} else {
		if (newBoard.arcadeMode.condition) {
			checkArcadeCondition();
		} else {
			checkAllTasks();
		}
		profile.actualStatistics.combo = 0;
		newBoard.ableToSelect = true;
	}

}

function showAchievementsDOM() {
	var achievementsDiv = document.getElementById('achievementsDiv');
	achievementsDiv.innerHTML = '';

	for (var i = 0; i <= profile.achievements.length - 1; i += 1) {
		var achievementImg = document.createElement("img"),
			achievementDiv = document.createElement("div"),
			spanDiv = document.createElement("div"),
			nameSpan = document.createElement("span"),
			descriptionSpan = document.createElement("span");

		nameSpan.innerHTML = profile.achievements[i].name + '<br>';
		descriptionSpan.innerHTML = profile.achievements[i].description;

		achievementImg.src = profile.achievements[i].imageSrc;

		nameSpan.className = "achievement-span";
		descriptionSpan.className = "achievement-span";
		spanDiv.className = "achievement-div-span"

		if (profile.achievements[i].completed) {
			achievementImg.className = "img-completed achievement-img";
			achievementDiv.className = "achievement-completed achievement";
			spanDiv.style.borderTop = "green solid 2px";
			spanDiv.style.borderBottom = "green solid 2px";
			spanDiv.style.borderRight = "green solid 2px";
		} else {
			achievementImg.className = "img-not-completed achievement-img";
			achievementDiv.className = "achievement-not-completed achievement";
			spanDiv.style.borderTop = "red solid 2px";
			spanDiv.style.borderBottom = "red solid 2px";
			spanDiv.style.borderRight = "red solid 2px";
		}
		achievementsDiv.appendChild(achievementDiv);
		achievementDiv.appendChild(achievementImg);
		achievementDiv.appendChild(spanDiv);
		spanDiv.appendChild(nameSpan);
		spanDiv.appendChild(descriptionSpan);
	}
}

function checkAllAchievements() {
	for (var i = 0; i <= profile.achievements.length - 1; i += 1) {
		if (!profile.achievements[i].completed) {
			profile.achievements[i].condition();
			if (profile.achievements[i].completed) {
				showPopupDOM(`<div class="popup-achievement"><img src="${profile.achievements[i].imageSrc}">Gratulacje! otrzymałeś:<span>${profile.achievements[i].name}</span>\n<span>${profile.achievements[i].description}</span></div>`);
			}
		}
	}
}

function showPopupDOM(content) {
	var popup = document.getElementById(`popup`);
	if (popup.classList.contains('in')) {
		setTimeout(function () {
			popup.innerHTML = content;
			popup.classList.toggle('in');
			popup.style.display = 'block';
		}, 3000);
		setTimeout(function () {
			popup.classList.toggle('in');
			popup.innerHTML = '';
			popup.style.display = 'none';
		}, 5500);
	} else {
		popup.innerHTML = content;
		popup.classList.toggle('in');
		popup.style.display = 'block';
		setTimeout(function () {
			popup.classList.toggle('in');
			popup.innerHTML = '';
			popup.style.display = 'none';
		}, 2500);
	}
}

function saveProfile() {
	if (window.localStorage) {
		localStorage.setItem(`profile`, JSON.stringify({
			name: profile.name,
			achievements: profile.achievements,
			totalStatistics: profile.totalStatistics,
			milliseconds: profile.milliseconds,
			minutesInGame: profile.minutesInGame
		}));
	}
}
function loadProfile() {
	if (window.localStorage && localStorage.getItem(`profile`)) {
		var loadedData = JSON.parse(localStorage.getItem(`profile`));
		profile = new Profile(loadedData.name);
		profile.milliseconds = loadedData.milliseconds;
		profile.minutesInGame = loadedData.minutesInGame;
		for (var i = 0; i < loadedData.achievements.length; i += 1) {
			if (loadedData.achievements[i].completed) {
				profile.achievements[i].completed = true;
			}
		}
		for (var i = 0; i < Object.keys(loadedData.totalStatistics).length; i += 1) {
			if (typeof profile.totalStatistics[Object.keys(profile.totalStatistics)[i]][0] !== 'function') {
				profile.totalStatistics[Object.keys(profile.totalStatistics)[i]][0] = loadedData.totalStatistics[Object.keys(loadedData.totalStatistics)[i]][0];
			}
		}
		for (var k = 0; k < profile.totalStatistics.completedMissions[0]; k += 1) {
			profile.campaign[k].completed = true;
			if ( (k + 1) <= profile.campaign.length) {
				profile.campaign[k + 1].available = true;
			}
		}
	}
}

function launchIntoFullscreen(element) {
	if (element.requestFullscreen) {
		element.requestFullscreen();
	} else if (element.mozRequestFullScreen) {
		element.mozRequestFullScreen();
	} else if (element.webkitRequestFullscreen) {
		element.webkitRequestFullscreen();
	} else if (element.msRequestFullscreen) {
		element.msRequestFullscreen();
	}
}

function exitFullscreen() {
	if (document.exitFullscreen) {
		document.exitFullscreen();
	} else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
	} else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
	}
}

function toggleModal(id) {
	var firstModal = document.getElementsByClassName(`modal fade in`)[0],
		secondModal = document.getElementById(`${id}`);
	if (firstModal) {
		firstModal.style.display = 'none';
		firstModal.classList.toggle('in');
	}
	secondModal.style.display = 'block';
	secondModal.classList.toggle('in');
	
}

function startMission(id) {
	id = parseInt(id, 10);
	if (typeof newBoard === 'undefined') {
		newBoard = new Board(8, `gems`);
		profile.campaign[id].createTasks();
		generateTasksDOM();
	} else {
		resetActualGame();
		newBoard = new Board(8, `gems`);
		profile.campaign[id].createTasks();
		generateTasksDOM();
	}
	newBoard.mission = id;
	toggleModal(`board`);
	setMinHeight();
	launchIntoFullscreen(document.documentElement);
}

function generateTasksDOM() {
	var divForTasks = document.getElementById(`divForTasks`);

	for (var i = 0; i <= newBoard.tasks.length - 1; i += 1) {
		var creatingImg = document.createElement("img"),
			creatingTask = document.createElement("div"),
			creatingAmountSpan = document.createElement("span"),
			creatingActualSpan = document.createElement("span");

		creatingImg.className = "img-responsive no-padding";
		creatingTask.className = "no-padding text-center pull-left";
		creatingImg.src = newBoard.tasks[i].imageSrc;
		creatingTask.style.width = `${100 / newBoard.tasks.length}%`;
		creatingTask.style.borderRadius = '40px';
		creatingImg.style.height = `28px`;
		creatingImg.style.margin = `auto`;
		creatingAmountSpan.innerHTML = `${newBoard.tasks[i].amount}x`;
		creatingActualSpan.innerHTML = '0';
		creatingActualSpan.id = `task-${i}`;

		divForTasks.appendChild(creatingTask);
		creatingTask.appendChild(creatingAmountSpan);
		creatingTask.appendChild(creatingImg);
		creatingTask.appendChild(creatingActualSpan);
	}
}

function checkAllTasks() {

	if (typeof newBoard !== 'undefined') {
		var length = newBoard.tasks.length - 1;
		var tasksCompleted = 0;
		for (var i = 0; i <= length; i += 1) {
			if (!newBoard.tasks[i].completed) {
				newBoard.tasks[i].checkTask();
				if (newBoard.tasks[i].completed) {
					document.getElementById(`task-${i}`).parentNode.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
					profile.totalStatistics.completedTasks[0] += 1;
				}
			}
			refreshAmount(`task-${i}`, profile.actualStatistics.typesOfTiles[newBoard.tasks[i].type]);
			if (newBoard.tasks[i].completed) {
				tasksCompleted += 1;
			}
		}

		if (tasksCompleted === length + 1) {
			if (newBoard.mission === null) {
				profile.totalStatistics.completedGames[0] += 1;
				document.getElementById('gainedPoints').innerHTML = '0';
				toggleModal(`levelCompleted`);
				refreshAmount('gainedPoints', profile.actualStatistics.points, 2500, function () {
					resetActualGame();
				});
			} else {
				if (profile.campaign[newBoard.mission].condition <= profile.actualStatistics.points) {
					if (profile.campaign[newBoard.mission].completed) {
						profile.totalStatistics.completedGames[0] += 1;
					} else {
						profile.totalStatistics.completedMissions[0] += 1;
						profile.campaign[newBoard.mission].completed = true;
						profile.campaign[newBoard.mission + 1].available = true;
					}
					newBoard.mission = null;
					document.getElementById('gainedPoints').innerHTML = '0';
					toggleModal(`levelCompleted`);
					refreshAmount('gainedPoints', profile.actualStatistics.points, 2500, function () {
						resetActualGame();
					});
				}
			}
		}
	}
}
function resetActualGame() {
	document.getElementById('turns').innerHTML = '0';
	document.getElementById('points').innerHTML = '0';
	document.getElementById('maxTurns').innerHTML = '';
	document.getElementById('maxPoints').innerHTML = '';
	for (var i = 0; i < Object.keys(profile.actualStatistics).length; i += 1) {
		if (typeof profile.actualStatistics[Object.keys(profile.actualStatistics)[i]] === 'number') {
			profile.actualStatistics[Object.keys(profile.actualStatistics)[i]] = 0;
		} else if (typeof profile.actualStatistics[Object.keys(profile.actualStatistics)[i]] === 'object') {
			for (var j = 0; j < profile.actualStatistics[Object.keys(profile.actualStatistics)[i]].length; j += 1) {
				profile.actualStatistics[Object.keys(profile.actualStatistics)[i]][j] = 0;
			}
		}
	}
	newBoard.clearBoardDOM();
	document.getElementById('divForTasks').innerHTML = '';
	newBoard = undefined;
}

function showStatisticsDOM() {
	var table = document.getElementById(`tableForStatistics`);
	table.innerHTML = '';
	for (var i = 0; i < Object.keys(profile.totalStatistics).length; i += 1) {

		var creatingTr = document.createElement("tr"),
			creatingTdName = document.createElement("td"),
			creatingTdData = document.createElement("td");

		creatingTdName.innerHTML = `${profile.totalStatistics[Object.keys(profile.totalStatistics)[i]][1]}`;
		if (typeof profile.totalStatistics[Object.keys(profile.totalStatistics)[i]][0] === 'function') {
			creatingTdData.innerHTML = `${profile.totalStatistics[Object.keys(profile.totalStatistics)[i]][0]()}`;
		} else {
			creatingTdData.innerHTML = `${profile.totalStatistics[Object.keys(profile.totalStatistics)[i]][0]}`;
		}
			
		table.appendChild(creatingTr);
		creatingTr.appendChild(creatingTdName);
		creatingTr.appendChild(creatingTdData);
	}
}

function generateRandomTasks(difficulty) {
	function shuffle(a) {
		var j, x, i;
		for (i = a.length; i; i--) {
			j = Math.floor(Math.random() * i);
			x = a[i - 1];
			a[i - 1] = a[j];
			a[j] = x;
		}
	}
	var randomArr = newBoard.bundleObj,
		k = 0,
		randomAmountOfTasks;
	shuffle(randomArr);
	switch (difficulty) {
		case 'easy':
			randomAmountOfTasks = Math.floor(Math.random() * 2 + 1);
			for (k = 0; k < randomAmountOfTasks; k += 1) {
				newBoard.tasks.push(new Task(newBoard.bundleObj.indexOf(randomArr[k]), Math.floor(Math.random() * 10) + 10));
			}
			break;
		case 'average':
			randomAmountOfTasks = Math.floor(Math.random() * 3 + 2);
			for (k = 0; k < randomAmountOfTasks; k += 1) {
				newBoard.tasks.push(new Task(newBoard.bundleObj.indexOf(randomArr[k]), Math.floor(Math.random() * 20) + 15));
			}
			break;
		case 'hard':
			randomAmountOfTasks = Math.floor(Math.random() * 3 + 3);
			for (k = 0; k < randomAmountOfTasks; k += 1) {
				newBoard.tasks.push(new Task(newBoard.bundleObj.indexOf(randomArr[k]), Math.floor(Math.random() * 30) + 25));
			}
			break;
		case 'veryHard':
			randomAmountOfTasks = Math.floor(Math.random() * 2 + 4);
			for (k = 0; k < randomAmountOfTasks; k += 1) {
				newBoard.tasks.push(new Task(newBoard.bundleObj.indexOf(randomArr[k]), Math.floor(Math.random() * 50) + 50));
			}
			break;
		case 'god':
			randomAmountOfTasks = 6;
			for (k = 0; k < randomAmountOfTasks; k += 1) {
				newBoard.tasks.push(new Task(newBoard.bundleObj.indexOf(randomArr[k]), Math.floor(Math.random() * 100) + 100));
			}
			break;
		default:

			break;
	}
}

function generateArcadeInfoDOM(difficulty) {
	var arcadeMovesInfo = document.getElementById('arcadeMovesInfo'),
		arcadeMovesGained = document.getElementById('arcadeMovesGained'),
		maxTurnsDiv = document.getElementById('maxTurns'),
		maxPointsDiv = document.getElementById('maxPoints');

	arcadeMovesInfo.innerHTML = profile.totalStatistics[difficulty][2];
	arcadeMovesGained.innerHTML = profile.totalStatistics[difficulty][0];
	maxTurnsDiv.innerHTML = `/${profile.totalStatistics[difficulty][2]}`;
	maxPointsDiv.innerHTML = `/${profile.totalStatistics[difficulty][0]}`;
}

function checkArcadeCondition() {
	if (newBoard.arcadeMode.condition <= profile.actualStatistics.turns) {
		if (profile.actualStatistics.points > profile.totalStatistics[newBoard.arcadeMode.type][0]) {
			profile.totalStatistics[newBoard.arcadeMode.type][0] = profile.actualStatistics.points;
		}
		document.getElementById('gainedPoints').innerHTML = '0';
		toggleModal(`levelCompleted`);
		refreshAmount('gainedPoints', profile.actualStatistics.points, 2500, function () {
			resetActualGame();
		});
		profile.totalStatistics.completedGames[0] += 1;
		newBoard.arcadeMode.condition = 0;
		newBoard.arcadeMode.type = '';
	}
}

function checkCombo() {
	if (profile.actualStatistics.combo > profile.totalStatistics.maxCombo[0]) {
		profile.totalStatistics.maxCombo[0] = profile.actualStatistics.combo;
	}
}

class CampaignMisson {
	constructor(_condition, _dataTasks) {
		this.available = false;
		this.completed = false;
		this.condition = _condition;
		this.dataTasks = _dataTasks;
	}

	createTasks() {
		newBoard.tasks = [ ];
		for (var i = 0; i <= this.dataTasks.length - 1; i += 1) {
			newBoard.tasks.push(new Task(this.dataTasks[i][0], this.dataTasks[i][1]));
		}
		document.getElementById('maxPoints').innerHTML = `/${this.condition}`;
	}
}

function showCampaignDOM() {
	var missionsDiv = document.getElementById(`missionsDiv`);
	missionsDiv.innerHTML = '';
	profile.campaign[0].available
	for (var i = 0; i < profile.campaign.length; i += 1) {

		var missionButton = document.createElement("div");
		missionButton.className = "btn btn-rounded center-block btn-lg button-mission";
		missionButton.innerHTML = i + 1;
		missionButton.setAttribute('data-mission', i);
		
		if (profile.campaign[i].available && profile.campaign[i].completed) {
			missionButton.className += " btn-success";
			missionButton.addEventListener('click', function (event) {
				startMission(event.target.getAttribute('data-mission'));
			});
		} else if (!profile.campaign[i].completed && profile.campaign[i].available){
			missionButton.addEventListener('click', function (event) {
				startMission(event.target.getAttribute('data-mission'));
			});
			missionButton.className += " btn-info";
		} else {
			missionButton.className += " btn-danger";
		}
		missionsDiv.appendChild(missionButton);
		
	}
}

function showHint(arr) {
	var tileForHint = getElementByDataXY("tile", [arr[1], arr[0]]);
	tileForHint.parentNode.classList.toggle('hint');
}

function getElementByDataXY(klass, conditionsArr) {
	var elements = document.getElementsByClassName(klass),
		length = elements.length;
	while(length--){
		if(elements[length].dataset.x === `${conditionsArr[0]}` && elements[length].dataset.y === `${conditionsArr[1]}`){
			return elements[length];
		}
	}
}

(function () {
	loadProfile();

	if (typeof profile !== 'undefined') {
		toggleModal(`menu`);
	} else {
		toggleModal(`createProfile`);
	}
}());


