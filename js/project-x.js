/* global document:true $:true event:true*/

$('.btn').bind(`click`, () => {
	if (event.target.getAttribute('data-modal')) {
		if (event.target.getAttribute('data-modal') == '#achievements') {
			showAchievementsDOM();
			toggleModal(`${event.target.getAttribute('data-modal')}`);
		} else {
			toggleModal(`${event.target.getAttribute('data-modal')}`);
			exitFullscreen();
		}
	} else if (event.target.getAttribute('data-mission')) {
		startMission(event.target.getAttribute('data-mission'));
	} else if (event.target.getAttribute('data-resetBoard')) {
		newBoard.clearBoardDOM();
		newBoard = new Board(newBoard.size, newBoard.typeOfBundle);
	} else if (event.target.getAttribute('data-createProfile')) {
		const name = document.querySelector('input[name="name"]').value;
		profile = new Profile(name);
		saveProfile();
		toggleModal(`${event.target.getAttribute('data-createProfile')}`);
	}
	event.stopPropagation();
});

$(`#createProfileButton`).bind(`click`, () => {
	const name = document.querySelector('input[name="name"]').value;
	profile = new Profile(name);
	saveProfile();
	toggleModal(`#menu`);
});

$(`.panel-body`).bind(`swipeup`, () => {
	changeTileWith(`up`);
});

$(`.panel-body`).bind(`swipedown`, () => {
	changeTileWith(`down`);
});

$(`.panel-body`).bind(`swipeleft`, () => {
	changeTileWith(`left`);
});

$(`.panel-body`).bind(`swiperight`, () => {
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
				$(newBoard.alreadyTileSelected).toggleClass(`selected`);
			break;
			case `left`:
				changeTilesPosition(document.querySelector(`[x="${x - 1}"][y="${y}"]`));
				$(newBoard.alreadyTileSelected).toggleClass(`selected`);
			break;
			case `up`:
				changeTilesPosition(document.querySelector(`[x="${x}"][y="${y - 1}"]`));
				$(newBoard.alreadyTileSelected).toggleClass(`selected`);
			break;
			case `down`:
				changeTilesPosition(document.querySelector(`[x="${x}"][y="${y + 1}"]`));
				$(newBoard.alreadyTileSelected).toggleClass(`selected`);
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
			toTop = $(firstTile).offset().top,
			toLeft = $(firstTile).offset().left,
			fromTop = $(secondTile).offset().top,
			fromLeft = $(secondTile).offset().left;

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
			$(firstTile).attr(`y`, secondY);
			$(secondTile).attr(`y`, firstY);
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
		const getActualHeight = $(`.panel-body`).children().height(),
			boardSize = newBoard.size * newBoard.size;
		for (let i = 0; i < boardSize; i += 1) {
			$(`.panel-body`).children()[i].style.minHeight = getActualHeight + `px`;
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

			const toTop = $(tile).offset().top,
				toLeft = $(tile).offset().left,
				fromTop = $(newBoard.alreadyTileSelected).offset().top,
				fromLeft = $(newBoard.alreadyTileSelected).offset().left;
						
			let distanseX,
				distanseY;

			tempTile = newBoard.arrayOfTiles[y2][x2];
			newBoard.arrayOfTiles[y2][x2] = newBoard.arrayOfTiles[y1][x1];
			newBoard.arrayOfTiles[y1][x1] = tempTile;

			$(tile).attr(`x`, `${x2}`);
			$(tile).attr(`y`, `${y2}`);
			$(newBoard.alreadyTileSelected).attr(`x`, `${x1}`);
			$(newBoard.alreadyTileSelected).attr(`y`, `${y1}`);

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
				$(tile).css({'top':'0px', 'left':'0px'});
				$(newBoard.alreadyTileSelected).css({'top':'0px', 'left':'0px'});
				parentFirstTile.replaceChild(childParentSecondTile, childParentFirstTile);
				parentSecondTile.appendChild(childParentFirstTile);

				newBoard.alreadyTileSelected = '';

				engine();
			});
			profile.actualStatistics.turns += 1;
			profile.totalStatistics.turns += 1;
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
		if ($(event.target).hasClass(`tile`)) {
			if (newBoard.alreadyTileSelected === event.target) {
				$(event.target).toggleClass(`selected`);
				newBoard.alreadyTileSelected = ``;
			} else if (newBoard.alreadyTileSelected === ``) {
				$(event.target).toggleClass(`selected`);
				newBoard.alreadyTileSelected = event.target;
			} else {
				if (changeTilesPosition(event.target)) {
					$(newBoard.alreadyTileSelected).toggleClass(`selected`);
				} else {
					$(newBoard.alreadyTileSelected).toggleClass(`selected`);
					newBoard.alreadyTileSelected = event.target;
					$(event.target).toggleClass(`selected`);
				}
			}
		}
	}
};

const refreshAmount = (id, variable, time = 200, callback = function() {}) => {
	const oldNumber = parseInt($(`#${id}`).text(), 10);
	$(`#${id}`)
	.prop(`number`, oldNumber)
	.animateNumber(
		{
			number: variable
		},
	time,
	callback
	);
};

class Achievement {
	constructor(_name, _description, _imageSrc, _parametr, _condition) {
		this.name = _name;
		this.description = _description;
		this.imageSrc = _imageSrc;
		this.completed = false;
		this.condition = function () {
			if (typeof _condition === 'boolean') {
				if (profile[_parametr] === _condition) {
					this.completed = true;
				}
			} else if (typeof _condition === 'number') {
				if (profile[_parametr] >= _condition) {
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
		this.points = 0;
		this.turns = 0;
		this.achievements = [ ];
		this.actualStatistics = {
			points: 0,
			turns: 0,
			typesOfTiles: [0, 0, 0, 0, 0, 0]
		};
		this.totalStatistics = {
			points: 0,
			turns: 0
		};
		this.addAchievements();
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
			this.achievements.push(new Achievement('Szczęściarz','Zrób combosa 4x!','images/lucky.svg','combo',4));
			this.achievements.push(new Achievement('Dziecko szczęścia!','Zrób combosa 8x!','images/child.svg','combo',8));
			this.achievements.push(new Achievement('Wciągnięty','Spędź 30 min w grze!','images/sucked.svg','timeSpentInGame',30));
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
		const divForTiles = $(`.panel-body`)[0];
		for (let i = 0; i < this.size; i += 1) {
			for (let j = 0; j < this.size; j += 1) {
				const creatingDiv = $('<div>', { 'class': 'col-xs-2 no-padding' }),
					creatingImg = $('<img>', { 'class': 'no-padding tile', 'src': this.arrayOfTiles[i][j].imageSrc });
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
					profile.totalStatistics.points += this.typesOfTiles[i];
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case (4 || 8):
					profile.actualStatistics.points += this.typesOfTiles[i] * 2;
					profile.totalStatistics.points += this.typesOfTiles[i] * 2;
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case (5 || 10):
					profile.actualStatistics.points += this.typesOfTiles[i] * 3;
					profile.totalStatistics.points += this.typesOfTiles[i] * 3;
					profile.actualStatistics.typesOfTiles[i] += this.typesOfTiles[i];
					break;
				case 7:
					profile.actualStatistics.points += this.typesOfTiles[i] + 4;
					profile.totalStatistics.points += this.typesOfTiles[i] + 4;
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
		for (let i = 0; i < this.size; i += 1) {
			for (let j = 0; j < this.size; j += 1) {
				if (array[i][j].toDelete) {
					for (let k = 0; k < $(`.tile`).length; k += 1) {
						if (parseInt($(`.tile`)[k].getAttribute(`x`), 10) === j && parseInt($(`.tile`)[k].getAttribute(`y`), 10) === i) {
							const tile = $(`.tile`)[k];
							$(tile).animate({
								opacity: 0
							}, 200, () => {
								tile.src = ``;
								tile.className = `col-xs-2 no-padding`;
								tile.remove();
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
			boardSize = this.size * this.size;
		let i = 0;

		if (this.clearTilesObj.length) {
			for (let j = 0; j < objLength; j += 1) {
				this.arrayOfTiles[this.clearTilesObj[j][0]][this.clearTilesObj[j][1]] = new Tile(this.randomTypeOfTile(this.bundleObj));
			}

			for (let k = 0; k < boardSize; k += 1) {
				if ($(".col-xs-2")[k].children.length === 0) {
					const creatingImg = $(`<img>`, { 'class': `no-padding tile`, 'src': `images/${this.arrayOfTiles[this.clearTilesObj[i][0]][this.clearTilesObj[i][1]].type}.svg` });
					$(creatingImg).attr(`x`, `${this.clearTilesObj[i][1]}`);
					$(creatingImg).attr(`y`, `${this.clearTilesObj[i][0]}`);
					$(creatingImg).css(`opacity`, `0`);
					creatingImg.appendTo($(".col-xs-2")[k]);
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
		$(`.panel-body`)[0].innerHTML = ``;
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
		checkAllAchievements();
		checkAllTasks();
		saveProfile();
		newBoard.ableToSelect = true;
	}

};

const createNewBoard = () => {
	newBoard = new Board(8, `gems`);
};

const showAchievementsDOM = () => {
	const achievementsDiv = $(`#achievementsDiv`);
	achievementsDiv.empty();
	for (let i = 0; i <= profile.achievements.length - 1; i += 1) {
		let glyphon;
		if (profile.achievements[i].completed) {
			glyphon = '<span class= "glyphicon glyphicon-ok text-success" aria-hidden="true"></span>';
		} else {
			glyphon = '<span class= "glyphicon glyphicon-remove text-danger" aria-hidden="true"></span>';
		}
		achievementsDiv.append(`<div class="achievement"><span>${glyphon+profile.achievements[i].name+glyphon}</span><img src="${profile.achievements[i].imageSrc}"><span>${profile.achievements[i].description}</span></div>`)
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
	const popup = $(`#popup`);
	if (popup.hasClass('in')) {
		setTimeout(() => {
			popup.append(content);
			popup.modal(`toggle`);
		}, 3000);
		setTimeout(() => {
			popup.modal(`toggle`);
			popup.empty();
		}, 5500);
	} else {
		popup.append(content);
		popup.modal(`toggle`);
		setTimeout(() => {
			popup.modal(`toggle`);
			popup.empty();
		}, 2500);
	}
}

const saveProfile= () => {
	if (window.localStorage) {
		localStorage.setItem(`profile`, JSON.stringify({
			name: profile.name,
			achievements: profile.achievements
		}));
	}
}
const loadProfile = () => {
	if (window.localStorage && localStorage.getItem(`profile`)) {
		let loadedData = JSON.parse(localStorage.getItem(`profile`));
		profile = new Profile(loadedData.name);
		for (let i = 0; i < loadedData.achievements.length; i += 1) {
			if (loadedData.achievements[i].completed) {
				profile.achievements[i].completed = true;
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
	$(`.modal.fade.in`).modal(`toggle`);
	$(id).modal(`toggle`);
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
		const creatingTask = $(`<div>`, { 'class': `no-padding text-center pull-left`}),
			creatingImg = $(`<img>`, { 'class': `img-responsive no-padding`, 'src': newBoard.tasks[i].imageSrc, 'alt': `...`}),
			creatingAmountSpan = $(`<span>`).html(`${newBoard.tasks[i].amount}x`),
			creatingActualSpan = $(`<span>`, { 'id': `task-${i}`}).html(`0`);
		$(creatingTask).css({
			'width': `${100/newBoard.tasks.length}%`,
			'border-radius': '40px'
		});
		$(creatingImg).css({
			'height': `28px`,
			'margin': `auto`
		});
		creatingTask.appendTo(divForTasks);
		creatingAmountSpan.appendTo(creatingTask);
		creatingImg.appendTo(creatingTask);
		creatingActualSpan.appendTo(creatingTask);
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
					$(`#task-${i}`).parent().css('background-color', 'rgba(0, 255, 0, 0.5)');
				}
			} 
			refreshAmount(`task-${i}`, profile.actualStatistics.typesOfTiles[i]);
			if (newBoard.tasks[i].completed) {
				tasksCompleted += 1;
			} 
		}

		if (tasksCompleted === length + 1) {
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
	$(`#divForTasks`)[0].innerHTML = ``;
	delete newBoard
}

(() => {
	loadProfile();

	if (typeof profile !== 'undefined') {
		$(`#menu`).modal(`toggle`);
	} else {
		$(`#createProfile`).modal(`toggle`);
	}
})();

