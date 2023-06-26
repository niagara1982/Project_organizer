// global theme
class GlobalTheme {
	constructor() {
		const storedTheme = localStorage.getItem('glTheme');
		this.changeIcoTheme = document.querySelector('[data-gl-theme]');
		this.changeThemeGl = document.querySelector('.glTheme');
		this.bodyEl = document.body;

		this.changeThemeGl.addEventListener('click', this.changeGlTheme.bind(this));

		storedTheme === 'dark'
			? this.darkThemeGl()
			: storedTheme === 'light'
			? this.lightThemeGl()
			: null;
	}

	lightThemeGl() {
		this.bodyEl.classList.remove('dark');
		this.changeIcoTheme.setAttribute('class', 'fa-solid fa-moon');
		localStorage.glTheme = 'light';
	}

	darkThemeGl() {
		this.bodyEl.classList.add('dark');
		this.changeIcoTheme.setAttribute('class', 'fa-solid fa-sun');
		localStorage.glTheme = 'dark';
	}

	changeGlTheme() {
		this.bodyEl.classList.contains('dark')
			? this.lightThemeGl()
			: this.darkThemeGl();
	}
}

// forecast city
class FrCity {
	constructor(city, changed) {
		this.city = city;
		this.changed = changed;
	}
}

// new task
class Task {
	constructor(title, description, priority) {
		this.title = title;
		this.description = description;
		this.priority = priority;
		this.status = 'Open';
	}
}

// Task for todoList
class CalcTheme {
	constructor() {
		this.changeIco = document.querySelector('[data-theme]');
		this.changeThemeBtn = document.querySelector('.changeTheme');
		this.calcEl = document.querySelector('.calc');
		this.loadTheme();
		this.changeThemeBtn.addEventListener('click', this.changeTheme.bind(this));
	}

	lightTheme() {
		this.calcEl.classList.remove('dark');
		this.changeIco.setAttribute('class', 'fa-solid fa-moon');
		localStorage.setItem('calcTheme', 'light');
	}

	darkTheme() {
		this.calcEl.classList.add('dark');
		this.changeIco.setAttribute('class', 'fa-solid fa-sun');
		localStorage.setItem('calcTheme', 'dark');
	}

	changeTheme() {
		this.calcEl.classList.contains('dark')
			? this.lightTheme()
			: this.darkTheme();
	}

	loadTheme() {
		const storedTheme = localStorage.getItem('calcTheme');
		if (storedTheme === 'dark') {
			this.darkTheme();
		} else if (storedTheme === 'light') {
			this.lightTheme();
		}
	}
}

// calc history
class CalcHistory {
	constructor(value, result) {
		this.value = value;
		this.result = result;
	}
}

// get current exchange on mobile devices
class getTabletCurrentExchange {
	static API_URL =
		'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
	static #instance = null;
	#data = [];

	#init() {
		const form = document.querySelector('.tcurrentExchange');

		form.addEventListener('click', this.onCurrencyExchangeClick.bind(this));

		this.fromSelectEl = document.querySelector('.tfrom select');
		this.toSelectEl = document.querySelector('.tto select');
		this.exchangeRateEl = document.querySelector('form .texchangeRate');
		this.exchangeAmountEl = document.querySelector('.tcurrentExchange input');
		this.exchangeResultEl = document.querySelector('form .texchangeResult');

		this.fromSelectEl.addEventListener(
			'change',
			this.onSelectCurrencyChange.bind(this)
		);
		this.toSelectEl.addEventListener(
			'change',
			this.onSelectCurrencyChange.bind(this)
		);
		this.exchangeAmountEl.addEventListener(
			'input',
			this.onExchangeAmountInput.bind(this)
		);
	}

	onCurrencyExchangeClick(el) {
		if (el.target.parentElement.classList.contains('ticon')) {
			el.target.className = 'icon-active';
			setTimeout(() => (el.target.className = ''), 200);
			const val = this.fromSelectEl.value;
			this.fromSelectEl.value = this.toSelectEl.value;
			this.toSelectEl.value = val;

			this.onSelectCurrencyChange();
		}
	}

	#calcExchange() {
		const fromItem = this.#data.find(
			item => item.cc === this.fromSelectEl.value
		);
		const toItem = this.#data.find(item => item.cc === this.toSelectEl.value);

		let fromValue = 1;
		let toValue = fromItem.rate / toItem.rate;

		const fromResValue = +this.exchangeAmountEl.value;
		const toResValue = (fromResValue * fromItem.rate) / toItem.rate;

		while (toValue < 1) {
			fromValue = fromValue / toValue;
			toValue = 1;
		}

		let date = new Date().toLocaleDateString();
		this.exchangeRateEl.textContent =
			`${fromValue.toFixed(5) * 1} ${fromItem.cc} = ` +
			`${toValue.toFixed(5) * 1} ${toItem.cc}${date ? ' on ' + date : ''}`;

		this.exchangeResultEl.textContent =
			`${fromResValue.toFixed(5) * 1} ${fromItem.cc} = ` +
			`${toResValue.toFixed(5) * 1} ${toItem.cc}`;
	}

	onExchangeAmountInput() {
		let value = this.exchangeAmountEl.value;

		this.exchangeAmountEl.value =
			(parseFloat(value) || 1).toString() +
			(value.substring(value.length - 1) === '.' ? '.' : '');

		this.#calcExchange();
	}

	onSelectCurrencyChange() {
		this.#calcExchange();
	}

	constructor() {
		getTabletCurrentExchange.#instance = this;
		this.#init();
	}

	static run() {
		const instance =
			getTabletCurrentExchange.#instance || new getTabletCurrentExchange();
		instance.loadExchangeRate();
		return instance;
	}

	loadExchangeRate() {
		fetch(getTabletCurrentExchange.API_URL)
			.then(response => response.json())
			.then(this.handleExchangeRate.bind(this));
	}

	#makeCurrencyItem(code, name, selected = false) {
		let flag = flag_money;

		if (code === 'EUR') {
			flag = flag_euro;
		} else if (code === 'XDR') {
			flag = flag_xdr;
		} else {
			const country = countryList[code];
			if (country) {
				const desc = country_flags.find(item => item.code === country);
				if (desc) {
					flag = desc.flag;
				}
			}
		}

		const option = document.createElement('option');
		option.innerHTML = (flag ? flag + ' ' : '') + name;
		option.value = code;
		if (selected) {
			option.selected = true;
		}

		return option;
	}

	handleExchangeRate(data) {
		data.push({ r030: 1, txt: 'Українська гривня', rate: 1, cc: 'UAH' });
		this.#data = data.sort((a, b) => a.txt.localeCompare(b.txt));

		this.fromSelectEl.textContent = '';
		this.toSelectEl.textContent = '';

		this.#data.forEach(item => {
			this.fromSelectEl.appendChild(
				this.#makeCurrencyItem(item.cc, item.txt, item.cc === 'USD')
			);
			this.toSelectEl.appendChild(
				this.#makeCurrencyItem(item.cc, item.txt, item.cc === 'UAH')
			);
		});

		this.onSelectCurrencyChange(this.fromSelectEl);
	}
}

// get current exchange on desktop devices
class getPcCurrentExchange {
	static API_URL =
		'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
	static #instance2 = null;
	#data = [];

	#init() {
		const form = document.querySelector('.currentExchange');

		form.addEventListener('click', this.onCurrencyExchangeClick.bind(this));

		this.fromSelectEl = document.querySelector('.from select');
		this.toSelectEl = document.querySelector('.to select');
		this.exchangeRateEl = document.querySelector('form .exchangeRate');
		this.exchangeAmountEl = document.querySelector('.currentExchange input');
		this.exchangeResultEl = document.querySelector('form .exchangeResult');

		this.fromSelectEl.addEventListener(
			'change',
			this.onSelectCurrencyChange.bind(this)
		);
		this.toSelectEl.addEventListener(
			'change',
			this.onSelectCurrencyChange.bind(this)
		);
		this.exchangeAmountEl.addEventListener(
			'input',
			this.onExchangeAmountInput.bind(this)
		);
	}

	onCurrencyExchangeClick(el) {
		if (el.target.parentElement.classList.contains('icon')) {
			el.target.className = 'icon-active';
			setTimeout(() => (el.target.className = ''), 200);
			const val = this.fromSelectEl.value;
			this.fromSelectEl.value = this.toSelectEl.value;
			this.toSelectEl.value = val;

			this.onSelectCurrencyChange();
		}
	}

	#calcExchange() {
		const fromItem = this.#data.find(
			item => item.cc === this.fromSelectEl.value
		);
		const toItem = this.#data.find(item => item.cc === this.toSelectEl.value);

		let fromValue = 1;
		let toValue = fromItem.rate / toItem.rate;

		const fromResValue = +this.exchangeAmountEl.value;
		const toResValue = (fromResValue * fromItem.rate) / toItem.rate;

		while (toValue < 1) {
			fromValue = fromValue / toValue;
			toValue = 1;
		}

		let date = new Date().toLocaleDateString();
		this.exchangeRateEl.textContent =
			`${fromValue.toFixed(5) * 1} ${fromItem.cc} = ` +
			`${toValue.toFixed(5) * 1} ${toItem.cc}${date ? ' on ' + date : ''}`;

		this.exchangeResultEl.textContent =
			`${fromResValue.toFixed(5) * 1} ${fromItem.cc} = ` +
			`${toResValue.toFixed(5) * 1} ${toItem.cc}`;
	}

	onExchangeAmountInput() {
		let value = this.exchangeAmountEl.value;

		this.exchangeAmountEl.value =
			(parseFloat(value) || 1).toString() +
			(value.substring(value.length - 1) === '.' ? '.' : '');

		this.#calcExchange();
	}

	onSelectCurrencyChange() {
		this.#calcExchange();
	}

	constructor() {
		getPcCurrentExchange.#instance2 = this;
		this.#init();
	}

	static run() {
		const instance =
			getPcCurrentExchange.#instance2 || new getPcCurrentExchange();
		instance.loadExchangeRate();
		return instance;
	}

	loadExchangeRate() {
		fetch(getPcCurrentExchange.API_URL)
			.then(response => response.json())
			.then(this.handleExchangeRate.bind(this));
	}

	#makeCurrencyItem(code, name, selected = false) {
		let flag = flag_money;

		if (code === 'EUR') {
			flag = flag_euro;
		} else if (code === 'XDR') {
			flag = flag_xdr;
		} else {
			const country = countryList[code];
			if (country) {
				const desc = country_flags.find(item => item.code === country);
				if (desc) {
					flag = desc.flag;
				}
			}
		}

		const option = document.createElement('option');
		option.innerHTML = (flag ? flag + ' ' : '') + name;
		option.value = code;
		if (selected) {
			option.selected = true;
		}

		return option;
	}

	handleExchangeRate(data) {
		data.push({ r030: 1, txt: 'Українська гривня', rate: 1, cc: 'UAH' });
		this.#data = data.sort((a, b) => a.txt.localeCompare(b.txt));

		this.fromSelectEl.textContent = '';
		this.toSelectEl.textContent = '';

		this.#data.forEach(item => {
			this.fromSelectEl.appendChild(
				this.#makeCurrencyItem(item.cc, item.txt, item.cc === 'USD')
			);
			this.toSelectEl.appendChild(
				this.#makeCurrencyItem(item.cc, item.txt, item.cc === 'UAH')
			);
		});

		this.onSelectCurrencyChange(this.fromSelectEl);
	}
}
