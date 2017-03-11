/* global document:true $:true event:true*/
for (let i = 0; i <= document.querySelectorAll('.btn').length - 1; i += 1 ) {
	document.querySelectorAll('.btn')[i].addEventListener('click', () => {
		if (event.target.getAttribute('data-modal')) {
			if (event.target.getAttribute('data-modal') == '#achievements') {
				showAchievementsDOM();
				toggleModal(`${event.target.getAttribute('data-modal')}`);
			} else if (event.target.getAttribute('data-modal') == `#statistics`){
				showStatisticsDOM();
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
		} else if (event.target.getAttribute('data-createProfile')) {
			const name = document.querySelector('input[name="name"]').value;
			profile = new Profile(name);
			saveProfile();
			toggleModal(`${event.target.getAttribute('data-createProfile')}`);
		}
		event.stopPropagation();
	});
}

$(`.panel-body`).on(`swipeup`, () => {
	changeTileWith(`up`);
});

$(`.panel-body`).on(`swipedown`, () => {
	changeTileWith(`down`);
});

$(`.panel-body`).on(`swipeleft`, () => {
	changeTileWith(`left`);
});

$(`.panel-body`).on(`swiperight`, () => {
	changeTileWith(`right`);
});

$(`.panel-body`).on(`vmousedown`, () => {
	whatTileWasClicked(event);
});

const changeTileWith = (direction) => {
	if (newBoard.alreadyTileSelected) {
		const x = parseInt(newBoard.alreadyTileSelected.getAttribute(`x`), 10),
			y = parseInt(newBoard.alreadyTileSelected.getAttribute(`y`), 10);
		switch (direction) {
			case `right`:
				changeTilesPosition(document.querySelector(`[x="${x + 1}"][y="${y}"]`));
				newBoard.alreadyTileSelected.classList.toggle('selected');
			break;
			case `left`:
				changeTilesPosition(document.querySelector(`[x="${x - 1}"][y="${y}"]`));
				newBoard.alreadyTileSelected.classList.toggle('selected');
			break;
			case `up`:
				changeTilesPosition(document.querySelector(`[x="${x}"][y="${y - 1}"]`));
				newBoard.alreadyTileSelected.classList.toggle('selected');
			break;
			case `down`:
				changeTilesPosition(document.querySelector(`[x="${x}"][y="${y + 1}"]`));
				newBoard.alreadyTileSelected.classList.toggle('selected');
			break;
			default:
				console.log('err')
			break;
		}
	}
} 

const moveDownTile = (firstTileY, firstTileX) => {
	let i = 0;

	while (firstTileY - i > 0) {

		const firstTile = document.querySelector(`[x="${firstTileX}"][y="${firstTileY - i}"]`),
			secondTile = document.querySelector(`[x="${firstTileX}"][y="${firstTileY - i - 1}"]`),
			firstX = parseInt(firstTile.getAttribute(`x`), 10),
			firstY = parseInt(firstTile.getAttribute(`y`), 10),
			secondY = parseInt(secondTile.getAttribute(`y`), 10),
			parentFirstTile = firstTile.parentNode,
			parentSecondTile = secondTile.parentNode,
			childParentFirstTile = parentFirstTile.firstChild,
			childParentSecondTile = parentSecondTile.firstChild,
			toTop = firstTile.top + document.body.scrollTop,
			toLeft = firstTile.left + document.body.scrollLeft,
			fromTop = secondTile.top + document.body.scrollTop,
			fromLeft = secondTile.left + document.body.scrollLeft;

		let tempTile,
			distanseX,
			distanseY;

		tempTile = newBoard.arrayOfTiles[secondY][firstX];
		newBoard.arrayOfTiles[secondY][firstX] = newBoard.arrayOfTiles[firstY][firstX];
		newBoard.arrayOfTiles[firstY][firstX] = tempTile;

		distanseX = fromTop - toTop;
		distanseY = fromLeft - toLeft;

		$(secondTile).animate({
			//left: `-=` + distanseY, // powinna być animacja
			//top: `-=` + distanseX
		}, 200, () => {

			firstTile.setAttribute('y', secondY);
			secondTile.setAttribute('y', firstY);
			//$(firstTile).css({'top' : '0px', 'left' : '0px'});
			//$(secondTile).css({'top' : '0px', 'left' : '0px'});
			parentFirstTile.replaceChild(childParentSecondTile, childParentFirstTile);
			parentSecondTile.appendChild(childParentFirstTile);
			
			newBoard.alreadyTileSelected = ``;
		});

		i += 1;
	}
	setTimeout(() => {
		newBoard.generateNewTiles();
	}, 300);
};

const setMinHeight = () => {
	if (!newBoard.minHeight) {
		const getActualHeight = document.querySelector('.panel-body').childNodes[1].clientHeight,
			boardSize = newBoard.size * newBoard.size;
		for (let i = 1; i < boardSize; i += 1) {
			document.querySelector('.panel-body').childNodes[i].style.minHeight = getActualHeight + `px`;
		}
		newBoard.minHeight = true;
	}
};

const whatTileWasClicked = (event) => {
	if (event.target !== event.currentTarget) {
		selectTileDOM(event.target);
	}
	event.stopPropagation();
};

const changeTilesPosition = (tile) => {
	if (tile) {
		const x1 = parseInt(tile.getAttribute(`x`), 10),
			y1 = parseInt(tile.getAttribute(`y`), 10),
			x2 = parseInt(newBoard.alreadyTileSelected.getAttribute(`x`), 10),
			y2 = parseInt(newBoard.alreadyTileSelected.getAttribute(`y`), 10),
			parentFirstTile = tile.parentNode,
			parentSecondTile = newBoard.alreadyTileSelected.parentNode,
			childParentFirstTile = parentFirstTile.firstChild,
			childParentSecondTile = parentSecondTile.firstChild;

		let tempTile;

		if (x1 === x2 + 1 && y1 === y2 || x1 === x2 - 1 && y1 === y2 || x1 === x2 && y1 === y2 + 1 || x1 === x2 && y1 === y2 - 1) {

			newBoard.ableToSelect = false;

			const tilePosition = tile.getBoundingClientRect(),
				selectedPosition = newBoard.alreadyTileSelected.getBoundingClientRect(),
				toTop = tilePosition.top + document.body.scrollTop,
				toLeft = tilePosition.left + document.body.scrollLeft,
				fromTop = selectedPosition.top + document.body.scrollTop,
				fromLeft = selectedPosition.left + document.body.scrollLeft;
						
			let distanseX,
				distanseY;

			tempTile = newBoard.arrayOfTiles[y2][x2];
			newBoard.arrayOfTiles[y2][x2] = newBoard.arrayOfTiles[y1][x1];
			newBoard.arrayOfTiles[y1][x1] = tempTile;

			tile.setAttribute('x', `${x2}`);
			tile.setAttribute('y', `${y2}`);
			newBoard.alreadyTileSelected.setAttribute('x', `${x1}`);
			newBoard.alreadyTileSelected.setAttribute('y', `${y1}`);

			distanseX = fromTop - toTop;
			distanseY = fromLeft - toLeft;

			$(tile).animate({
				left: `+=` + distanseY,
				top: `+=` + distanseX
			}, 200);

			$(newBoard.alreadyTileSelected).animate({
				left: `-=` + distanseY,
				top: `-=` + distanseX
			}, 200, () => {
				tile.style.top = '0px';
				tile.style.left = '0px';
				newBoard.alreadyTileSelected.style.top = '0px';
				newBoard.alreadyTileSelected.style.left = '0px';
				parentFirstTile.replaceChild(childParentSecondTile, childParentFirstTile);
				parentSecondTile.appendChild(childParentFirstTile);

				newBoard.alreadyTileSelected = '';

				engine();
			});
			profile.actualStatistics.turns += 1;
			profile.totalStatistics.turns[0] += 1;
			refreshAmount(`turns`, profile.actualStatistics.turns);

			return true;
		} else {
			return false;
		}
	}
};

const selectTileDOM = () => {
	setMinHeight();

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
};

const refreshAmount = (id, variable, time = 2500, callback = function() {}) => {
	const options = {
	  useEasing : true, 
	  useGrouping : true, 
	  separator : ',', 
	  decimal : '.', 
	  prefix : '', 
	  suffix : '' 
	},
	animate = new CountUp(document.querySelector(`#${id}`), parseInt(document.querySelector(`#${id}`).innerHTML, 10), variable, 0, time/1000, options);
	animate.start();
};

class Achievement {
	constructor(_name, _description, _imageSrc, _parametr, _condition) {
		this.name = _name;
		this.description = _description;
		this.imageSrc = _imageSrc;
		this.completed = false;
		this.condition = function () {
			let profileParametr;
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
			} else {
				console.log(`Parametr ${_condition} must be Boolean or Number!`)
			}
			return this
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
		},
		this.milliseconds = 0,
		this.minutesInGame = 0,
		this.totalStatistics = {
			points: [0, 'Zdobyte punkty:'],
			turns: [0, 'Ilość wykonanych ruchów:'],
			completedTasks: [0, 'Ilość wykonanych zadań:'],
			completedGames: [0, 'Ilość zakończonych misji:'],
			maxCombo: [0, 'Największy combos:'],
			timeInGame: [()=>{return this.timeInGame()}, 'Czas w grze:'],
		};

		this.addAchievements();
		this.timeInGame();
		this.checkTime();
	}

	timeInGame() {
		const duration = this.milliseconds;
		let milliseconds = parseInt((duration%1000)/100),
		seconds = parseInt((duration/1000)%60),
		minutes = parseInt((duration/(1000*60))%60),
		hours = parseInt((duration/(1000*60*60))%24);

		hours = (hours < 10) ? "0" + hours : hours;
		minutes = (minutes < 10) ? "0" + minutes : minutes;
		seconds = (seconds < 10) ? "0" + seconds : seconds;

		this.minutesInGame = parseInt(duration/(1000*60));

		return hours + ":" + minutes + ":" + seconds;
	}

	checkTime() {
		setTimeout(() => {
			this.milliseconds += 1000;
			this.timeInGame();
			checkAllAchievements();
			saveProfile();
			this.checkTime();
		}, 1000);
	}

	addAchievements() {
		if (this.achievements.length === 0) {
			this.achievements.push(new Achievement('Nowicjusz','Zdobądź pierwsze 100 punktów!','images/novice.svg','points',100));
			this.achievements.push(new Achievement('Mistrz','Zdobądź 1000 punktów!','images/master.svg','points',1000));
			this.achievements.push(new Achievement('Arcymistrz','Zdobądź 10000 punktów!','images/archmaster.svg','points',10000));
			this.achievements.push(new Achievement('Praktykant','Ukończ 10 rozgrywek!','images/trainee.svg','completedGames',10));
			this.achievements.push(new Achievement('Doświadczony','Ukończ 30 rozgrywek!','images/experienced.svg','completedGames',30));
			this.achievements.push(new Achievement('Uczeń z podstawówki','Ukończ 10 zadań!','images/primaryschool.svg','completedTasks',10));
			this.achievements.push(new Achievement('Uczeń z liceum','Ukończ 50 zadań!','images/highschool.svg','completedTasks',50));
			this.achievements.push(new Achievement('Szczęściarz','Zrób combosa 4x!','images/lucky.svg','maxCombo',4));
			this.achievements.push(new Achievement('Dziecko szczęścia!','Zrób combosa 8x!','images/child.svg','maxCombo',8));
			this.achievements.push(new Achievement('Wciągnięty','Spędź 30 min w grze!','images/sucked.svg','minutesInGame',30));
		}
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
		this.alreadyTileSelected = ``;
		this.typesOfTiles = [0, 0, 0, 0, 0, 0];
		this.ableToSelect = true;
		this.tasks = [ ];
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

	createBundleObj(nameOfBundle = `gems`) {
		let bundle = [ ];
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
		const divForTiles = document.querySelectorAll('.panel-body')[0]
		for (let i = 0; i < this.size; i += 1) {
			for (let j = 0; j < this.size; j += 1) {

				const creatingDiv = document.createElement("div"),
					creatingImg = document.createElement("img");
				creatingDiv.className = "col-xs-2 no-padding";
				creatingImg.className = "no-padding tile";
				creatingImg.src = this.arrayOfTiles[i][j].imageSrc;
				creatingImg.setAttribute(`x`, `${j}`);
				creatingImg.setAttribute(`y`, `${i}`);
				divForTiles.appendChild(creatingDiv);
				creatingDiv.appendChild(creatingImg);
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
		let oldType;
		for (let i = 0; i < this.size; i += 1) {
			for (let j = 0; j < this.size; j += 1) {
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
		const array = this.arrayOfTiles;
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
		const array = this.arrayOfTiles,
			bundleLength = this.bundleObj.length;

		for (let i = 0; i < this.size; i += 1) {
			for (let j = 0; j < this.size; j += 1) {
				if (array[i][j].toDelete) {
					for (let k = 0; k < bundleLength; k += 1) {
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
		const len = this.typesOfTiles.length - 1;
		for (let i = 0; i <= len; i += 1) {
			switch (this.typesOfTiles[i]) {
				case (3 || 6 || 9):
					profile.actualStatistics.points += this.typesOfTiles[i];
					profile.totalStatistics.points[0] += this.typesOfTiles[i];
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case (4 || 8):
					profile.actualStatistics.points += this.typesOfTiles[i] * 2;
					profile.totalStatistics.points[0] += this.typesOfTiles[i] * 2;
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case (5 || 10):
					profile.actualStatistics.points += this.typesOfTiles[i] * 3;
					profile.totalStatistics.points[0] += this.typesOfTiles[i] * 3;
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case 7:
					profile.actualStatistics.points += this.typesOfTiles[i] + 4;
					profile.totalStatistics.points[0] += this.typesOfTiles[i] + 4;
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				default:
					break;
			}
		}
		this.typesOfTiles = [0, 0, 0, 0, 0, 0];
		return this;
	}

	deleteTiles() {
		const array = this.arrayOfTiles;
		const tile = document.querySelectorAll('.tile');
		for (let i = 0; i < this.size; i += 1) {
			for (let j = 0; j < this.size; j += 1) {
				if (array[i][j].toDelete) {
					for (let k = 0; k < tile.length; k += 1) {
						if (parseInt(tile[k].getAttribute(`x`), 10) === j && parseInt(tile[k].getAttribute(`y`), 10) === i) {
							$(tile[k]).animate({
								opacity: 0
							}, 200, () => {
								tile[k].src = ``;
								tile[k].className = `col-xs-2 no-padding`;
								tile[k].parentNode.removeChild(tile[k]);
							});
						}
					}
					array[i][j].toDelete = false;
					array[i][j].type = `clear`;
				}
			}
		}
		return this;
	}

	findClearTiles() {
		this.clearTilesObj = [ ];
		const array = this.arrayOfTiles;
		for (let i = 0; i < this.size; i += 1) {
			for (let j = 0; j < this.size; j += 1) {
				if (array[i][j].type === `clear`) {
					this.clearTilesObj.push([i, j]);
				}
			}
		}
		return this;
	}

	setClearTiles() {
		const objLength = this.clearTilesObj.length;

		for (let i = 0; i < objLength; i += 1) {
			moveDownTile(this.clearTilesObj[i][0], this.clearTilesObj[i][1]);
		}
		return this;
	}

	generateNewTiles() {
		this.findClearTiles();
		const objLength = this.clearTilesObj.length,
			boardSize = this.size * this.size,
			parentOfTile = document.querySelectorAll(".col-xs-2");
		let i = 0;

		if (this.clearTilesObj.length) {
			for (let j = 0; j < objLength; j += 1) {
				this.arrayOfTiles[this.clearTilesObj[j][0]][this.clearTilesObj[j][1]] = new Tile(this.randomTypeOfTile(this.bundleObj));
			}

			for (let k = 0; k < boardSize; k += 1) {
				if (parentOfTile[k].children.length === 0) {
					const creatingImg = document.createElement("img");
					creatingImg.className = "no-padding tile";
					creatingImg.src = `images/${this.arrayOfTiles[this.clearTilesObj[i][0]][this.clearTilesObj[i][1]].type}.svg`;
					creatingImg.setAttribute(`x`, `${this.clearTilesObj[i][1]}`);
					creatingImg.setAttribute(`y`, `${this.clearTilesObj[i][0]}`);
					creatingImg.style.opacity = '0';
					parentOfTile[k].appendChild(creatingImg);

					$(creatingImg).animate({
						opacity: '1'
					}, 200);


					i += 1;
				}
			}
		}
		return this;
	}

	clearBoardDOM() {
		document.querySelectorAll(`.panel-body`)[0].innerHTML = ``;
	}
}

class Task {
	constructor(_type, _amount) {
		this.type = _type;
		this.amount = _amount;
		this.imageSrc = `images/${newBoard.bundleObj[this.type]}.svg`;
		this.completed = false;
		this.checkTask = () => {
			if (profile.actualStatistics.typesOfTiles[this.type] >= this.amount) {
				this.completed = true;
			}
			return this;
		}
	}
}


const engine = () => {
	newBoard.ableToSelect = false;
	newBoard.findFit();

	if (newBoard.foundedFit) {
			
		newBoard.countFoundedTiles()
			.addPointsToProfile()
			.deleteTiles()
			.findClearTiles()
			.setClearTiles();
		refreshAmount(`points`, profile.actualStatistics.points);

		setTimeout(() => {
			engine();
		}, 550);
	} else {
		checkAllTasks();
		newBoard.ableToSelect = true;
	}

};

const createNewBoard = () => {
	newBoard = new Board(8, `gems`);
};

const showAchievementsDOM = () => {
	const achievementsDiv = document.querySelector('#achievementsDiv');
	achievementsDiv.innerHTML = '';
	for (let i = 0; i <= profile.achievements.length - 1; i += 1) {
		let glyphon;
		if (profile.achievements[i].completed) {
			glyphon = '<span class= "glyphicon glyphicon-ok text-success" aria-hidden="true"></span>';
		} else {
			glyphon = '<span class= "glyphicon glyphicon-remove text-danger" aria-hidden="true"></span>';
		}
		achievementsDiv.innerHTML += `<div class="achievement"><span>${glyphon+profile.achievements[i].name+glyphon}</span><img src="${profile.achievements[i].imageSrc}"><span>${profile.achievements[i].description}</span></div>`;
	}
}

const checkAllAchievements = () => {
	for (let i = 0; i <= profile.achievements.length - 1; i += 1) {
		if (!profile.achievements[i].completed) {
			profile.achievements[i].condition();
			if (profile.achievements[i].completed) {
				showPopupDOM(`<div class="popup-achievement"><img src="${profile.achievements[i].imageSrc}">Gratulacje! otrzymałeś:<span>${profile.achievements[i].name}</span>\n<span>${profile.achievements[i].description}</span></div>`);
			}
		}
	}
}

const showPopupDOM = (content) => {
	const popup = document.querySelector(`#popup`); 
	if (popup.classList.contains('in')) {
		setTimeout(() => {
			popup.innerHTML = content;
			popup.classList.toggle('in');
			popup.style.display = 'block';
		}, 3000);
		setTimeout(() => {
			popup.classList.toggle('in');
			popup.innerHTML = '';
			popup.style.display = 'none';
		}, 5500);
	} else {
		popup.innerHTML = content;
		popup.classList.toggle('in');
		popup.style.display = 'block';
		setTimeout(() => {
			popup.classList.toggle('in');
			popup.innerHTML = '';
			popup.style.display = 'none';
		}, 2500);
	}
}

const saveProfile= () => {
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
const loadProfile = () => {
	if (window.localStorage && localStorage.getItem(`profile`)) {
		let loadedData = JSON.parse(localStorage.getItem(`profile`));
		profile = new Profile(loadedData.name);
		profile.milliseconds = loadedData.milliseconds;
		profile.minutesInGame = loadedData.minutesInGame;
		for (let i = 0; i < loadedData.achievements.length; i += 1) {
			if (loadedData.achievements[i].completed) {
				profile.achievements[i].completed = true;
			}
		}
		for (let i = 0; i < Object.keys(loadedData.totalStatistics).length; i += 1) {
			if (typeof profile.totalStatistics[Object.keys(profile.totalStatistics)[i]][0] !== 'function') {
				profile.totalStatistics[Object.keys(profile.totalStatistics)[i]][0] = loadedData.totalStatistics[Object.keys(loadedData.totalStatistics)[i]][0];
			}
		}
	}
}

const launchIntoFullscreen = (element) => {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

const exitFullscreen = () => {
  if(document.exitFullscreen) {
    document.exitFullscreen();
  } else if(document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if(document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
}

const toggleModal = (id) => {
	const firstModal = document.querySelector(`.modal.fade.in`),
		secondModal = document.querySelector(`${id}`);
	if (firstModal) {
		firstModal.style.display = 'none';
		firstModal.classList.toggle('in');
	}
	secondModal.style.display = 'block';
	secondModal.classList.toggle('in');
	
}

const startMission = (id) => {
	if (typeof newBoard === 'undefined') {
		newBoard = new Board(8, `gems`);
		createTasksForCampaign(id);
		generateTasksDOM();
	} else {
		resetActualGame();
		newBoard = new Board(8, `gems`);
		createTasksForCampaign(id);
		generateTasksDOM();
	}
	toggleModal(`#board`);
	launchIntoFullscreen(document.documentElement);
}

const createTasksForCampaign = (id) => {
	newBoard.tasks = [ ];
	switch (id) {
		case '1':
			newBoard.tasks.push(new Task(0, 10));
			newBoard.tasks.push(new Task(1, 10));
		break;
		case '2':
			newBoard.tasks.push(new Task(0, 20));
			newBoard.tasks.push(new Task(1, 20));
			newBoard.tasks.push(new Task(2, 20));
		break;
		case '3':
			newBoard.tasks.push(new Task(0, 40));
			newBoard.tasks.push(new Task(1, 40));
			newBoard.tasks.push(new Task(2, 40));
		break;
		case '4':
			newBoard.tasks.push(new Task(0, 30));
			newBoard.tasks.push(new Task(1, 30));
			newBoard.tasks.push(new Task(2, 30));
			newBoard.tasks.push(new Task(3, 30));
		break;
		case '5':
			newBoard.tasks.push(new Task(0, 30));
			newBoard.tasks.push(new Task(1, 30));
			newBoard.tasks.push(new Task(2, 30));
			newBoard.tasks.push(new Task(3, 30));
			newBoard.tasks.push(new Task(4, 30));
		break;
		case '6':
			newBoard.tasks.push(new Task(0, 35));
			newBoard.tasks.push(new Task(1, 35));
			newBoard.tasks.push(new Task(2, 35));
			newBoard.tasks.push(new Task(3, 35));
			newBoard.tasks.push(new Task(4, 35));
			newBoard.tasks.push(new Task(5, 35));
		break;
		default:
			newBoard.tasks.push(new Task(0, 10));
		break;
	}
}

const generateTasksDOM = () => {
	const divForTasks = document.querySelector(`#divForTasks`);

	for (let i = 0; i <= newBoard.tasks.length - 1; i += 1) {
					const creatingImg = document.createElement("img"),
						creatingTask = document.createElement("div"),
						creatingAmountSpan = document.createElement("span"),
						creatingActualSpan = document.createElement("span");
					creatingImg.className = "img-responsive no-padding";
					creatingTask.className = "no-padding text-center pull-left";
					creatingImg.src = newBoard.tasks[i].imageSrc;
					creatingTask.style.width = `${100/newBoard.tasks.length}%`;
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

const checkAllTasks = () => {

	if (typeof newBoard !== 'undefined') {
		const length = newBoard.tasks.length - 1;
		let tasksCompleted = 0;
		for (let i = 0; i <= length; i += 1) {
			if (!newBoard.tasks[i].completed) {
				newBoard.tasks[i].checkTask();
				if (newBoard.tasks[i].completed) {
					document.querySelector(`#task-${i}`).parentNode.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
					profile.totalStatistics.completedTasks[0] += 1;
				}
			} 
			refreshAmount(`task-${i}`, profile.actualStatistics.typesOfTiles[i]);
			if (newBoard.tasks[i].completed) {
				tasksCompleted += 1;
			} 
		}

		if (tasksCompleted === length + 1) {
			profile.totalStatistics.completedGames[0] += 1;
			document.querySelector('#gainedPoints').innerHTML = '0';
			toggleModal(`#levelCompleted`);
			refreshAmount('gainedPoints', profile.actualStatistics.points, 2500, () => {
				resetActualGame();
			});
		}
	}
}

const resetActualGame = () => {
	document.querySelector('#turns').innerHTML = '0';
	document.querySelector('#points').innerHTML = '0';
	for (let i = 0; i < Object.keys(profile.actualStatistics).length; i += 1) {
		if (typeof profile.actualStatistics[Object.keys(profile.actualStatistics)[i]] === 'number') {
			profile.actualStatistics[Object.keys(profile.actualStatistics)[i]] = 0;
		} else if (typeof profile.actualStatistics[Object.keys(profile.actualStatistics)[i]] === 'object') {
			for (let j = 0; j < profile.actualStatistics[Object.keys(profile.actualStatistics)[i]].length; j += 1) {
				profile.actualStatistics[Object.keys(profile.actualStatistics)[i]][j] = 0;
			}
		}
	}
	newBoard.clearBoardDOM();
	document.querySelector('#divForTasks').innerHTML = '';
	delete newBoard
}

const showStatisticsDOM = () => {
	const table = document.querySelector(`#tableForStatistics`);
	table.innerHTML = '';
	for (let i = 0; i < Object.keys(profile.totalStatistics).length; i += 1) {
		
		const creatingTr = document.createElement("tr"),
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

(() => {
	loadProfile();

	if (typeof profile !== 'undefined') {
		toggleModal(`#menu`);
	} else {
		toggleModal(`#createProfile`);
	}
})();

