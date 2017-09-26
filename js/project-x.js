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
			} else if (event.target.getAttribute('data-modal') === `play`) {
				if (newBoard.arcadeMode.type) {
					var temp = [newBoard.arcadeMode.type, newBoard.arcadeMode.condition];
					resetActualGame();
					newBoard = new Board(8, `gems`);
					newBoard.arcadeMode.type = temp[0];
					newBoard.arcadeMode.condition = temp[1];
					toggleModal(`board`);
					setMinHeight();
					generateArcadeInfoDOM(temp[0]);
					launchIntoFullscreen(document.documentElement);
				} else if (newBoard.mission !== null) {
					startMission(1 + newBoard.mission);
				} else if (newBoard.randMission){
					var temp = newBoard.randMission;
					if (typeof newBoard === 'undefined') {
						newBoard = new Board(8, `gems`);
						generateRandomTasks(temp);
						generateTasksDOM();
					} else {
						resetActualGame();
						newBoard = new Board(8, `gems`);
						generateRandomTasks(temp);
						generateTasksDOM();
					}
					toggleModal(`board`);
					setMinHeight();
					launchIntoFullscreen(document.documentElement);
				}

		} else {
			if(event.target.getAttribute('data-modal') === 'modeMenu' && newBoard) {
				newBoard.arcadeMode.condition = 0;
				newBoard.arcadeMode.type = '';
				newBoard.randMission = '';
				newBoard.mission = null;
			}
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
	if (newBoard.alreadyTileSelected && newBoard.ableToSelect) {
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
			arcade5: [0, 'Najwięcej punktów w 5 turach:', 5],
			arcade10: [0, 'Najwięcej punktów w 10 turach:', 10],
			arcade15: [0, 'Najwięcej punktów w 15 turach:', 15],
			arcade20: [0, 'Najwięcej punktów w 20 turach:', 20],
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
			this.campaign.push(new CampaignMisson(4655, [[0, 91], [1, 82], [2, 73], [3, 64], [4, 55], [5, 46]]));
			this.campaign.push(new CampaignMisson(5235, [[0, 66], [1, 77], [2, 66], [3, 77], [4, 66], [5, 77]]));
			this.campaign.push(new CampaignMisson(5611, [[0, 111], [1, 123], [2, 134], [3, 145], [4, 156], [5, 167]]));
			this.campaign.push(new CampaignMisson(5355, [[0, 150], [1, 150], [2, 150], [3, 150], [4, 150], [5, 150]]));
			this.campaign.push(new CampaignMisson(6888, [[0, 170], [1, 170], [2, 170], [3, 170], [4, 170], [5, 170]]));
			this.campaign.push(new CampaignMisson(6630, [[0, 200], [1, 200], [2, 200], [3, 200], [4, 200], [5, 200]]));
			this.campaign.push(new CampaignMisson(2632, [[0, 306], [1, 179], [2, 314], [3, 296], [4, 126], [5, 121]]));
			this.campaign.push(new CampaignMisson(2275, [[0, 263], [1, 148], [2, 153], [3, 291], [4, 187], [5, 249]]));
			this.campaign.push(new CampaignMisson(4127, [[0, 184], [1, 102], [2, 303], [3, 322], [4, 322], [5, 222]]));
			this.campaign.push(new CampaignMisson(4129, [[0, 305], [1, 248], [2, 355], [3, 212], [4, 145], [5, 245]]));
			this.campaign.push(new CampaignMisson(4932, [[0, 166], [1, 329], [2, 263], [3, 118], [4, 268], [5, 252]]));
			this.campaign.push(new CampaignMisson(3271, [[0, 227], [1, 182], [2, 322], [3, 112], [4, 112], [5, 190]]));
			this.campaign.push(new CampaignMisson(3890, [[0, 274], [1, 250], [2, 307], [3, 367], [4, 203], [5, 167]]));
			this.campaign.push(new CampaignMisson(2407, [[0, 325], [1, 126], [2, 398], [3, 194], [4, 141], [5, 217]]));
			this.campaign.push(new CampaignMisson(3832, [[0, 137], [1, 169], [2, 209], [3, 172], [4, 344], [5, 178]]));
			this.campaign.push(new CampaignMisson(3345, [[0, 384], [1, 126], [2, 259], [3, 363], [4, 375], [5, 192]]));
			this.campaign.push(new CampaignMisson(4916, [[0, 257], [1, 372], [2, 299], [3, 271], [4, 225], [5, 286]]));
			this.campaign.push(new CampaignMisson(3341, [[0, 156], [1, 149], [2, 188], [3, 110], [4, 167], [5, 104]]));
			this.campaign.push(new CampaignMisson(2304, [[0, 185], [1, 110], [2, 101], [3, 185], [4, 143], [5, 122]]));
			this.campaign.push(new CampaignMisson(3396, [[0, 115], [1, 157], [2, 115], [3, 120], [4, 136], [5, 198]]));
			this.campaign.push(new CampaignMisson(2139, [[0, 194], [1, 173], [2, 171], [3, 184], [4, 177], [5, 157]]));
			this.campaign.push(new CampaignMisson(2915, [[0, 149], [1, 134], [2, 129], [3, 110], [4, 194], [5, 195]]));
			this.campaign.push(new CampaignMisson(2688, [[0, 160], [1, 111], [2, 128], [3, 131], [4, 178], [5, 122]]));
			this.campaign.push(new CampaignMisson(3917, [[0, 175], [1, 175], [2, 112], [3, 190], [4, 143], [5, 176]]));
			this.campaign.push(new CampaignMisson(2107, [[0, 159], [1, 192], [2, 108], [3, 178], [4, 174], [5, 133]]));
			this.campaign.push(new CampaignMisson(3839, [[0, 116], [1, 154], [2, 153], [3, 170], [4, 154], [5, 123]]));
			this.campaign.push(new CampaignMisson(3604, [[0, 108], [1, 116], [2, 174], [3, 198], [4, 175], [5, 169]]));
			this.campaign.push(new CampaignMisson(2121, [[0, 167], [1, 123], [2, 166], [3, 126], [4, 104], [5, 186]]));
			this.campaign.push(new CampaignMisson(2741, [[0, 193], [1, 163], [2, 102], [3, 155], [4, 183], [5, 100]]));
			this.campaign.push(new CampaignMisson(2924, [[0, 118], [1, 148], [2, 127], [3, 130], [4, 192], [5, 133]]));
			this.campaign.push(new CampaignMisson(3862, [[0, 167], [1, 146], [2, 107], [3, 101], [4, 139], [5, 164]]));
			this.campaign.push(new CampaignMisson(2930, [[0, 143], [1, 185], [2, 167], [3, 134], [4, 197], [5, 138]]));
			this.campaign.push(new CampaignMisson(3741, [[0, 188], [1, 105], [2, 181], [3, 108], [4, 108], [5, 168]]));
			this.campaign.push(new CampaignMisson(3586, [[0, 195], [1, 183], [2, 186], [3, 181], [4, 143], [5, 156]]));
			this.campaign.push(new CampaignMisson(2155, [[0, 114], [1, 188], [2, 143], [3, 110], [4, 161], [5, 151]]));
			this.campaign.push(new CampaignMisson(2724, [[0, 149], [1, 147], [2, 133], [3, 119], [4, 114], [5, 173]]));
			this.campaign.push(new CampaignMisson(3551, [[0, 110], [1, 189], [2, 141], [3, 199], [4, 184], [5, 148]]));
			this.campaign.push(new CampaignMisson(3788, [[0, 123], [1, 166], [2, 137], [3, 190], [4, 159], [5, 148]]));
			this.campaign.push(new CampaignMisson(3227, [[0, 172], [1, 185], [2, 146], [3, 145], [4, 118], [5, 158]]));
			this.campaign.push(new CampaignMisson(2255, [[0, 178], [1, 119], [2, 149], [3, 198], [4, 118], [5, 102]]));
			this.campaign.push(new CampaignMisson(2595, [[0, 120], [1, 180], [2, 179], [3, 184], [4, 171], [5, 163]]));
			this.campaign.push(new CampaignMisson(3607, [[0, 170], [1, 159], [2, 195], [3, 113], [4, 125], [5, 143]]));
			this.campaign.push(new CampaignMisson(3161, [[0, 141], [1, 159], [2, 145], [3, 174], [4, 142], [5, 131]]));
			this.campaign.push(new CampaignMisson(3950, [[0, 107], [1, 105], [2, 169], [3, 167], [4, 107], [5, 172]]));
			this.campaign.push(new CampaignMisson(2177, [[0, 116], [1, 120], [2, 198], [3, 144], [4, 101], [5, 142]]));
			this.campaign.push(new CampaignMisson(3099, [[0, 146], [1, 196], [2, 156], [3, 174], [4, 104], [5, 124]]));
			this.campaign.push(new CampaignMisson(3830, [[0, 164], [1, 182], [2, 141], [3, 125], [4, 162], [5, 153]]));
			this.campaign.push(new CampaignMisson(3580, [[0, 111], [1, 132], [2, 183], [3, 143], [4, 120], [5, 176]]));
			this.campaign.push(new CampaignMisson(3462, [[0, 112], [1, 185], [2, 155], [3, 151], [4, 133], [5, 151]]));
			this.campaign.push(new CampaignMisson(3708, [[0, 112], [1, 114], [2, 134], [3, 156], [4, 169], [5, 123]]));
			this.campaign.push(new CampaignMisson(2931, [[0, 129], [1, 143], [2, 155], [3, 168], [4, 142], [5, 108]]));
			this.campaign.push(new CampaignMisson(2308, [[0, 167], [1, 107], [2, 173], [3, 171], [4, 177], [5, 128]]));
			this.campaign.push(new CampaignMisson(3955, [[0, 115], [1, 113], [2, 193], [3, 180], [4, 177], [5, 179]]));
			this.campaign.push(new CampaignMisson(2270, [[0, 197], [1, 124], [2, 150], [3, 145], [4, 136], [5, 117]]));
			this.campaign.push(new CampaignMisson(3594, [[0, 141], [1, 199], [2, 147], [3, 173], [4, 113], [5, 125]]));
			this.campaign.push(new CampaignMisson(3670, [[0, 174], [1, 106], [2, 162], [3, 187], [4, 123], [5, 102]]));
			this.campaign.push(new CampaignMisson(3953, [[0, 187], [1, 189], [2, 154], [3, 100], [4, 105], [5, 163]]));
			this.campaign.push(new CampaignMisson(2553, [[0, 139], [1, 151], [2, 172], [3, 198], [4, 169], [5, 162]]));
			this.campaign.push(new CampaignMisson(3222, [[0, 115], [1, 163], [2, 108], [3, 171], [4, 127], [5, 172]]));
			this.campaign.push(new CampaignMisson(3139, [[0, 103], [1, 157], [2, 169], [3, 141], [4, 178], [5, 172]]));
			this.campaign.push(new CampaignMisson(2673, [[0, 196], [1, 132], [2, 152], [3, 146], [4, 106], [5, 127]]));
			this.campaign.push(new CampaignMisson(2467, [[0, 154], [1, 105], [2, 168], [3, 109], [4, 195], [5, 195]]));
			this.campaign.push(new CampaignMisson(2801, [[0, 144], [1, 176], [2, 175], [3, 112], [4, 190], [5, 102]]));
			this.campaign.push(new CampaignMisson(3911, [[0, 116], [1, 181], [2, 126], [3, 127], [4, 170], [5, 116]]));
			this.campaign.push(new CampaignMisson(2977, [[0, 108], [1, 167], [2, 190], [3, 148], [4, 165], [5, 165]]));
			this.campaign.push(new CampaignMisson(3426, [[0, 130], [1, 145], [2, 109], [3, 179], [4, 191], [5, 105]]));
			this.campaign.push(new CampaignMisson(2649, [[0, 188], [1, 113], [2, 136], [3, 154], [4, 114], [5, 118]]));
			this.campaign.push(new CampaignMisson(2621, [[0, 139], [1, 168], [2, 160], [3, 127], [4, 170], [5, 126]]));
			this.campaign.push(new CampaignMisson(2726, [[0, 156], [1, 123], [2, 117], [3, 178], [4, 187], [5, 183]]));
			this.campaign.push(new CampaignMisson(3306, [[0, 159], [1, 131], [2, 151], [3, 199], [4, 161], [5, 145]]));
			this.campaign.push(new CampaignMisson(2599, [[0, 190], [1, 122], [2, 135], [3, 195], [4, 117], [5, 169]]));
			this.campaign.push(new CampaignMisson(3186, [[0, 154], [1, 127], [2, 146], [3, 102], [4, 135], [5, 151]]));
			this.campaign.push(new CampaignMisson(2619, [[0, 165], [1, 127], [2, 109], [3, 127], [4, 139], [5, 174]]));
			this.campaign.push(new CampaignMisson(2260, [[0, 102], [1, 115], [2, 164], [3, 103], [4, 173], [5, 118]]));
			this.campaign.push(new CampaignMisson(2076, [[0, 182], [1, 135], [2, 106], [3, 196], [4, 100], [5, 145]]));
			this.campaign.push(new CampaignMisson(2146, [[0, 137], [1, 197], [2, 122], [3, 180], [4, 167], [5, 132]]));
			this.campaign.push(new CampaignMisson(2601, [[0, 113], [1, 139], [2, 141], [3, 182], [4, 104], [5, 122]]));
			this.campaign.push(new CampaignMisson(2177, [[0, 199], [1, 121], [2, 178], [3, 160], [4, 106], [5, 197]]));
			this.campaign.push(new CampaignMisson(3757, [[0, 134], [1, 160], [2, 197], [3, 118], [4, 134], [5, 198]]));
			this.campaign.push(new CampaignMisson(3560, [[0, 163], [1, 121], [2, 124], [3, 140], [4, 178], [5, 116]]));
			this.campaign.push(new CampaignMisson(2667, [[0, 172], [1, 154], [2, 104], [3, 187], [4, 117], [5, 176]]));
			this.campaign.push(new CampaignMisson(2686, [[0, 175], [1, 146], [2, 104], [3, 130], [4, 120], [5, 126]]));
			this.campaign.push(new CampaignMisson(3676, [[0, 110], [1, 191], [2, 175], [3, 164], [4, 115], [5, 117]]));
			this.campaign.push(new CampaignMisson(3198, [[0, 139], [1, 108], [2, 186], [3, 100], [4, 183], [5, 149]]));
			this.campaign.push(new CampaignMisson(3383, [[0, 163], [1, 125], [2, 143], [3, 148], [4, 195], [5, 126]]));
			this.campaign.push(new CampaignMisson(2975, [[0, 196], [1, 147], [2, 186], [3, 107], [4, 141], [5, 167]]));
			this.campaign.push(new CampaignMisson(2134, [[0, 181], [1, 180], [2, 168], [3, 109], [4, 164], [5, 192]]));
			this.campaign.push(new CampaignMisson(3169, [[0, 161], [1, 153], [2, 105], [3, 154], [4, 140], [5, 132]]));
			this.campaign.push(new CampaignMisson(2509, [[0, 131], [1, 121], [2, 110], [3, 167], [4, 105], [5, 144]]));
			this.campaign.push(new CampaignMisson(2300, [[0, 190], [1, 166], [2, 110], [3, 107], [4, 135], [5, 188]]));
			this.campaign.push(new CampaignMisson(2689, [[0, 121], [1, 115], [2, 198], [3, 167], [4, 146], [5, 119]]));
			this.campaign.push(new CampaignMisson(2330, [[0, 127], [1, 139], [2, 127], [3, 129], [4, 109], [5, 152]]));
			this.campaign.push(new CampaignMisson(3448, [[0, 140], [1, 197], [2, 189], [3, 146], [4, 118], [5, 105]]));
			this.campaign.push(new CampaignMisson(3435, [[0, 121], [1, 132], [2, 109], [3, 128], [4, 156], [5, 141]]));
			this.campaign.push(new CampaignMisson(2322, [[0, 163], [1, 180], [2, 167], [3, 175], [4, 161], [5, 166]]));
			this.campaign.push(new CampaignMisson(2340, [[0, 181], [1, 167], [2, 163], [3, 169], [4, 154], [5, 160]]));
			this.campaign.push(new CampaignMisson(3246, [[0, 164], [1, 193], [2, 116], [3, 192], [4, 156], [5, 109]]));
			this.campaign.push(new CampaignMisson(2759, [[0, 195], [1, 159], [2, 162], [3, 133], [4, 155], [5, 178]]));
			this.campaign.push(new CampaignMisson(3506, [[0, 173], [1, 196], [2, 100], [3, 163], [4, 120], [5, 199]]));
			this.campaign.push(new CampaignMisson(2439, [[0, 120], [1, 130], [2, 136], [3, 171], [4, 107], [5, 182]]));
			this.campaign.push(new CampaignMisson(2697, [[0, 182], [1, 122], [2, 179], [3, 147], [4, 199], [5, 147]]));
			this.campaign.push(new CampaignMisson(2314, [[0, 189], [1, 103], [2, 111], [3, 169], [4, 122], [5, 112]]));
			this.campaign.push(new CampaignMisson(3295, [[0, 162], [1, 106], [2, 194], [3, 103], [4, 124], [5, 196]]));
			this.campaign.push(new CampaignMisson(3429, [[0, 169], [1, 147], [2, 111], [3, 143], [4, 194], [5, 172]]));
			this.campaign.push(new CampaignMisson(3472, [[0, 172], [1, 182], [2, 176], [3, 144], [4, 133], [5, 119]]));
			this.campaign.push(new CampaignMisson(3126, [[0, 159], [1, 194], [2, 196], [3, 160], [4, 130], [5, 175]]));
			this.campaign.push(new CampaignMisson(3156, [[0, 161], [1, 145], [2, 185], [3, 115], [4, 139], [5, 147]]));
			this.campaign.push(new CampaignMisson(2034, [[0, 157], [1, 190], [2, 110], [3, 177], [4, 134], [5, 152]]));
			this.campaign.push(new CampaignMisson(2851, [[0, 189], [1, 161], [2, 123], [3, 181], [4, 135], [5, 147]]));
			this.campaign.push(new CampaignMisson(2228, [[0, 172], [1, 157], [2, 197], [3, 199], [4, 171], [5, 179]]));
			this.campaign.push(new CampaignMisson(2069, [[0, 134], [1, 107], [2, 138], [3, 182], [4, 147], [5, 114]]));
			this.campaign.push(new CampaignMisson(3042, [[0, 104], [1, 142], [2, 154], [3, 129], [4, 163], [5, 125]]));
			this.campaign.push(new CampaignMisson(3916, [[0, 187], [1, 187], [2, 154], [3, 164], [4, 157], [5, 155]]));
			this.campaign.push(new CampaignMisson(2766, [[0, 174], [1, 157], [2, 138], [3, 118], [4, 168], [5, 140]]));
			this.campaign.push(new CampaignMisson(3083, [[0, 198], [1, 187], [2, 180], [3, 168], [4, 197], [5, 100]]));
			this.campaign.push(new CampaignMisson(2444, [[0, 148], [1, 170], [2, 102], [3, 158], [4, 132], [5, 186]]));
			this.campaign.push(new CampaignMisson(2798, [[0, 181], [1, 183], [2, 136], [3, 174], [4, 153], [5, 166]]));
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
		this.randMission = '';
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
			var increase = (this.typesOfTiles[i] * this.arrayOfTiles[0][0].points) * (1 + profile.actualStatistics.combo);
			profile.actualStatistics.points += increase;
			profile.totalStatistics.points[0] += increase;
			profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i] * (1 + profile.actualStatistics.combo);
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
					//newBoard.mission = null;
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
	newBoard.randMission = difficulty;
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
		//newBoard.arcadeMode.condition = 0;
		//newBoard.arcadeMode.type = '';
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
