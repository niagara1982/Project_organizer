// global variables
const screenWidth =
	window.innerWidth ||
	document.documentElement.clientWidth ||
	document.body.clientWidth;

// global theme
new GlobalTheme();

// open & close navigation
const openNavigation = () => {
	document.body.classList.toggle('overflow');
	document.querySelector('.burgerNav').classList.toggle('open');
	document.querySelector('.nav ul').classList.toggle('visible');

	document.querySelectorAll('.navLink').forEach(btn =>
		btn.addEventListener('click', () => {
			document.body.classList.remove('overflow');
			document.querySelector('.burgerNav').classList.remove('open');
			document.querySelector('.nav ul').classList.remove('visible');
		})
	);
};
document.querySelector('.burgerNav').addEventListener('click', openNavigation);

// search on page
const searchOnPage = () => {
	// variables
	const searchInput = document.getElementById('searchInput'),
		blocks = document.querySelectorAll(
			'.todoBody, .newsContainer, .exchangeRateBody, .advertisementBody, .forecastBody, .screenHistory, .currentExchange'
		);

	blocks.forEach(block => {
		// variables
		const textElements = block.querySelectorAll(
			'h1, h2, h3, p, a, span, select'
		);

		textElements.forEach(element => {
			const elementText = element.innerText.toLowerCase();

			elementText.includes(searchInput.value.trim().toLowerCase())
				? (element.style.backgroundColor = '#3F51B5')
				: (element.style.backgroundColor = 'transparent');

			searchInput.value.trim().toLowerCase() === ''
				? (element.style.backgroundColor = 'transparent')
				: null;
		});
	});
};
document.getElementById('searchInput').addEventListener('input', searchOnPage);

// forecast
let cityFr = [],
	cityForeCast = document.querySelector('.forecastCity');

(() => {
	!localStorage.cityForeCast
		? (cityFr = [{ city: 'Kiev', changed: new Date().toLocaleDateString() }])
		: ((cityFr = JSON.parse(localStorage.getItem('cityForeCast'))),
			// load city
			cityFr.forEach(res => (cityForeCast.value = res.city)));
})();

// update localStorage
const updateFrCity = () =>
	localStorage.setItem('cityForeCast', JSON.stringify(cityFr));

const getForecast = () => {
	// variables
	const getDate = new Date(),
		todayDateEl = document.querySelector('.forecastDayWeek'),
		currentStateEl = document.querySelector('.forecastState'),
		windSpeedEl = document.querySelector('.forecastSpeedWind'),
		currentTempEl = document.querySelector('.forecastTemp'),
		feelsTempEl = document.querySelector('.feelTemp'),
		forecastDailyEl = document.querySelector('.forecastDaily'),
		keyAPI = 'P22aoTtsD8ZL1THlOPs1Fk8NWMpAtKYD';

	// set current week in correct form
	const setCurrentDate = () => {
		todayDateEl.innerHTML = getDate.toLocaleString('en-US', {
			weekday: 'long',
		});
	};

	// request on current forecast
	const fetchCurrentWeather = async city => {
		// variables
		const locationsResponse = await fetch(
			`https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${keyAPI}&q=${city}`
		);
		const locationsData = await locationsResponse.json();
		const locationKey = locationsData[0].Key;

		const weatherResponse = await fetch(
			`http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${keyAPI}&details=true`
		);
		const weatherData = await weatherResponse.json();
		const currentWeather = weatherData[0];

		// weather text
		currentStateEl.innerHTML = `<i class="fas fa-cloud"></i> ${currentWeather.WeatherText}`;

		// wind speed
		windSpeedEl.innerHTML = `
      <i class="fas fa-wind"></i>
      ${currentWeather.Wind.Speed.Metric.Value}
      ${currentWeather.Wind.Speed.Metric.Unit}
    `;

		// current temperature & icon weather
		currentTempEl.innerHTML = `
      <img src="./img/${currentWeather.WeatherIcon < 10 ? '0' : ''}
			${currentWeather.WeatherIcon}-s.png" alt="${currentWeather.WeatherText}" />
      ${Math.round(currentWeather.Temperature.Metric.Value)}&deg;
      ${currentWeather.Temperature.Metric.Unit}
    `;

		// feels like temperature
		feelsTempEl.innerHTML = `
      feels like
      ${currentWeather.RealFeelTemperature.Metric.Value}
      ${currentWeather.RealFeelTemperature.Metric.Unit}
    `;
	};

	// request on daily forecast
	const fetchDailyForecast = async city => {
		// variables
		const locationsResponse = await fetch(
			`https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${keyAPI}&q=${city}`
		);
		const locationsData = await locationsResponse.json();
		const locationKey = locationsData[0].Key;

		const forecastResponse = await fetch(
			`http://dataservice.accuweather.com/forecasts/v1/daily/5day/${locationKey}?apikey=${keyAPI}&details=true&metric=true`
		);
		const forecastData = await forecastResponse.json();
		const dailyForecasts = forecastData.DailyForecasts;

		dailyForecasts.forEach(temp => {
			// variables
			const temperature = temp.Temperature;
			const currentDate = new Date(temp.Date);
			const month = currentDate.toLocaleString('en-US', { month: 'long' });
			const dayOfWeek = currentDate.toLocaleString('en-US', {
				weekday: 'short',
			});

			// day template
			forecastDailyEl.innerHTML += `
        <div class="day">
          <h4 class="weekDay">
						${dayOfWeek}, 
						<span class="date">${currentDate.getDate()}</span>
					</h4>
          <p class="mouth">${month}</p>
          <div class="temp">
            <span class="min">${Math.round(
							temperature.Minimum.Value
						)}&deg;</span>
            <span class="max">...${Math.round(
							temperature.Maximum.Value
						)}&deg;</span>
          </div>
        </div>
      `;
		});
	};

	const handleCityChange = city => {
		const cityEl = city.target.value;
		cityFr = [];
		cityFr.push(new FrCity(cityEl, new Date().toLocaleDateString()));
		updateFrCity();
		forecastDailyEl.innerHTML = '';
		fetchCurrentWeather(cityEl);
		fetchDailyForecast(cityEl);
	};

	setCurrentDate();
	fetchCurrentWeather(cityForeCast.value);
	fetchDailyForecast(cityForeCast.value);
	cityForeCast.addEventListener('change', handleCityChange);
};

// todoList
const BASE_URL = '../data/base.json';
let editId,
	isEditTask = false,
	tasks = [];

// update localStorage
const updateStorage = () =>
	localStorage.setItem('tasks', JSON.stringify(tasks));

(() => {
	!localStorage.tasks
		? fetch(BASE_URL)
				.then(data => data.json())
				.then(task => {
					for (const key in task) {
						tasks[key] = task[key];
						updateStorage(), showTodoList();
					}
				})
				.catch(err => console.error(err))
		: (tasks = JSON.parse(localStorage.getItem('tasks')));
})();

// update task status
function updateTaskStatus(selectedTask) {
	selectedTask.checked
		? (tasks[selectedTask.id].status = 'Done')
		: (tasks[selectedTask.id].status = 'Open');
	updateStorage(), showTodoList();
}

// delete all tasks
function deleteTasks() {
	isEditTask = false;
	tasks = [];
	updateStorage(), showTodoList();
}
document.querySelector('.todoDelete').addEventListener('click', deleteTasks);

// clear todo fields
document.querySelector('.todoClearFields').addEventListener('click', () => {
	document.querySelector('.todoTitle input').value = '';
	document.querySelector('.todoDescription input').value = '';
	document.querySelector('.todoPriority').value = 'Low';
	document.querySelector('.todoError').style.display = 'none';
});

// edit task
function editTask(id, title, description, priority) {
	[editId, isEditTask] = [id, true];
	document.querySelector('.todoTitle input').value = title;
	document.querySelector('.todoDescription input').value = description;
	document.querySelector('.todoPriority').value = priority;
}

// delete task
function deleteTask(id) {
	isEditTask = false;
	tasks.splice(id, 1);
	updateStorage(), showTodoList();
}

// add new task
function addTask() {
	const taskTitleEl = document.querySelector('.todoTitle input'),
		taskDescriptionEl = document.querySelector('.todoDescription input'),
		taskPriorityEl = document.querySelector('.todoPriority'),
		taskErrorEl = document.querySelector('.todoError');

	if (!isEditTask) {
		switch (taskTitleEl.value.trim() && taskDescriptionEl.value.trim()) {
			case '':
				taskErrorEl.style.display = 'block';
				break;

			default:
				taskErrorEl.style.display = 'none';
				tasks.unshift(
					new Task(
						taskTitleEl.value.trim(),
						taskDescriptionEl.value.trim(),
						taskPriorityEl.value
					)
				);
				break;
		}
	} else {
		isEditTask = false;
		tasks[editId].title = taskTitleEl.value.trim();
		tasks[editId].description = taskDescriptionEl.value.trim();
		tasks[editId].priority = taskPriorityEl.value;
	}

	taskTitleEl.value = '';
	taskDescriptionEl.value = '';
	taskPriorityEl.value = 'Low';
	updateStorage(), showTodoList();
}
document.querySelector('.todoAdd').addEventListener('click', addTask);

// show todo list
function showTodoList() {
	const tasksEl = document.querySelector('.tasks');
	let taskTemp = '';

	if (tasks) {
		tasks.forEach((task, id) => {
			let taskCompleted = tasks.status === 'Done' ? 'checked' : '';
			taskTemp += `
					<li class="task">
					<label for="${id}">
						<h4 class="taskTitle ${taskCompleted}">${id + 1}. ${task.title}</h4>

						<div class="taskInfo">
							<input class="taskCheck" onclick="updateTaskStatus(this)" type="checkbox" id="${id}" ${taskCompleted}>
							<p class="taskDescription">${task.description}</p>
            </div>
					</label>

					<div class="taskActions">
						<select class="taskPriority" disabled>
							<option value="Low">Low</option>
							<option value="Minor">Minor</option>
							<option value="Major">Major</option>
							<option value="High">High</option>
						</select>

            <div>
              <button class="taskEdit" onclick='editTask(
                ${id}, "${task.title}", "${task.description}",
                "${task.priority}")'>Edit</button>
              <button class="taskDelete" onclick='deleteTask(${id})'>Delete</button>
            </div>
					</div>
				</li>
					`;
		});

		tasksEl.innerHTML =
			taskTemp || `<span class="empty">Your list is empty!</span>`;

		const taskCheckEl = document.querySelectorAll('.taskCheck'),
			taskTitleEl = document.querySelectorAll('.taskTitle'),
			taskPriorityEl = document.querySelectorAll('.taskPriority');

		for (const key in tasks) {
			// priority
			taskPriorityEl[key].value = tasks[key]['priority'];

			// status
			tasks[key]['status'] === 'Done'
				? (taskCheckEl[key].setAttribute('checked', 'checked'),
				  taskTitleEl[key].classList.toggle('checked'))
				: null;
			updateStorage();
		}
	}
}

// calculator
const screenHistoryEl = document.querySelector('.screenHistory');
let screenValue = '0',
	operand = '',
	operator = '',
	calcHistory = [];

// get calc history
(() => {
	!localStorage.calcHistory
		? (calcHistory = [])
		: (calcHistory = JSON.parse(localStorage.getItem('calcHistory')));
})();

// update localStorage
const updateCalcHistory = () =>
	localStorage.setItem('calcHistory', JSON.stringify(calcHistory));

// calc theme
new CalcTheme().loadTheme();

// update screen
const updateScreen = () =>
	(document.querySelector('.screen').textContent = screenValue);

// clear field
const clearField = btn => {
	screenValue = '0';
	operator = '';
	operand = '';
	updateScreen();

	// clear calc history
	btn.addEventListener('click', () => {
		calcHistory = [];
		screenHistoryEl.innerHTML = '';
		loadCalcHistory(), updateScreen(), updateCalcHistory();
	});
};

// add number
const appendNum = num => {
	screenValue === '0' && num !== '.'
		? (screenValue = num)
		: (screenValue += num);
	updateScreen();
};

const appendOpt = opt => {
	!isNaN(+screenValue) && ((operand = screenValue), (screenValue += opt));
	updateScreen();
};

// percent
const percentOpt = () => {
	screenValue = screenValue === '0' ? '0' : screenValue / 100;
	updateScreen();
};

// delete number
function delNum() {
	screenValue = screenValue.length === 1 ? '0' : screenValue.slice(0, -1);
	updateScreen();
}

const calc = () => {
	const res = new Function('return ' + screenValue)();
	res !== Infinity ? calcHistory.push(new CalcHistory(screenValue, res)) : null;
	screenValue = res === Infinity ? 'Error' : res.toString();

	operator = '';
	operand = '';
	screenHistoryEl.innerHTML = '';
	loadCalcHistory(), updateScreen(), updateCalcHistory();
};

// load calc history
function loadCalcHistory() {
	calcHistory = calcHistory.length > 2 ? calcHistory.slice(1) : calcHistory;
	calcHistory.forEach(el => {
		screenHistoryEl.innerHTML += `
	<p>${el.value}
	<br />
	<span>= ${el.result}</span></p>
	`;
	});
}

// news
const getNews = () => {
	const newsList = document.querySelector('.newsList tbody');

	fetch(`../data/news.json`)
		.then(res => res.json())
		.then(newsArr => {
			screenWidth < 1024
				? (newsArr = newsArr.slice(0, 9))
				: screenWidth <= 2560
				? (newsArr = newsArr.slice(0, 19))
				: null;

			newsArr.forEach(news => {
				const date = new Date(news.publishedAt).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
				});

				document.querySelector('.newsList').innerHTML += `
			    <tr>
			      <td>${date}, ${news.source.name}</td>
			      <td><a href="${news.url}" target="_blank">${news.title}</a></td>
			    </tr>
			   `;
			});
		});
};

// adverts
const ADV = [
	{
		title: 'Iphone 12 mini',
		url: 'https://allo.ua/ua/products/mobile/apple-iphone-12-mini-64gb-blue.html',
		img: 'https://i.allo.ua/media/catalog/product/cache/3/image/710x600/602f0fa2c1f0d1ba5e241f914e856ff9/i/p/iphone-12-mini-blue-select-2020.jpg',
	},
	{
		title: 'MacBook Pro 16 M1 Max 1TB',
		url: 'https://allo.ua/ua/products/notebooks/noutbuk-apple-macbook-pro-16-m1-max-space-gray.html',
		img: 'https://i.allo.ua/media/catalog/product/cache/1/image/710x600/602f0fa2c1f0d1ba5e241f914e856ff9/f/i/file_2123_5.jpg',
	},
	{
		title: 'Apple iPhone 14 Pro Max 256GB Deep Purple',
		url: 'https://allo.ua/ua/products/mobile/apple-iphone-14-pro-max-256gb-deep-purple.html',
		img: 'https://i.allo.ua/media/catalog/product/cache/3/image/710x600/602f0fa2c1f0d1ba5e241f914e856ff9/w/w/wwen_iphone14pro_q422_deep-purple_pdp-images_position-1a_2.jpg',
	},
	{
		title: 'Xiaomi Redmi Note 10 Pro 6/128 Onyx Gray',
		url: 'https://allo.ua/ua/products/mobile/xiaomi-redmi-note-10-pro-6-128-onyx-gray.html',
		img: 'https://i.allo.ua/media/catalog/product/cache/3/image/710x600/602f0fa2c1f0d1ba5e241f914e856ff9/0/_/0_59_13_1.jpg',
	},
];

const showAdverts = () => {
	const advertBodyEl = document.querySelectorAll('.advertBody');
	let template = ``;

	ADV.forEach(adv => {
		template += `
			<div class="advert">
				<a href="${adv.url}" target='_blank'>
					<img src="${adv.img}"
								alt="${adv.title}">
				</a>
			</div>
		`;
	});

	advertBodyEl.forEach(el => {
		el.insertAdjacentHTML('beforeend', template);
	});
};

document.addEventListener('DOMContentLoaded', () => {
	return (
		(getForecast(),
		showTodoList(),
		loadCalcHistory(),
		getNews(),
		screenWidth < 1024
			? getTabletCurrentExchange.run()
			: getPcCurrentExchange.run()),
		showAdverts()
	);
});
