document.querySelector("#submit").addEventListener("click", onSubmit);

//define your own keys here:
const openWeatherApiKey = config.openWeatherApiKey;
const weatherApiKey = config.weatherApiKey;

let textBox = document.getElementById("zip-input");
textBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        onSubmit();
    }
});

function onSubmit() {
	let zipCode = document.getElementById("zip-input").value;
	let countryCode = document.getElementById('country-code-input').value;

	let errorMessage = document.createElement("p");
	errorMessage.style.color = "rgb(237, 100, 90)";
	errorMessage.textContent = "Please enter a zip code";
	errorMessage.className = "error-message";
	errorMessage.id = "error";

	let inputDiv = document.querySelector(".container-1");
	let allErrorMessages = inputDiv.getElementsByTagName("p");

	if (zipCode === "" && allErrorMessages.length === 0) {
		inputDiv.appendChild(errorMessage);
	} else if (zipCode != "" && allErrorMessages.length === 1) {
		let theExactSameErrorMesaage = document.getElementById("error");
		theExactSameErrorMesaage.innerHTML = "";
		makeApiCall(zipCode, countryCode);
		//anything else that does not meet these conditions
	} else {
		makeApiCall(zipCode, countryCode);
	}
}

function makeApiCall(zipCode, countryCode) {
	const openWeatherApiCall = `http://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&appid=${openWeatherApiKey}&units=imperial`;

	$.getJSON(openWeatherApiCall, function(data) {
		
		allh1s = document.getElementsByTagName("h1");
		//data is the whole json object
		//debugging: console.log(data);

		if (allh1s.length === 0) {
			addElements(data, zipCode);

		} else if (allh1s.length === 1) {
			//remove all elements
			let elementsDiv = document.getElementById("elements-div");
			elementsDiv.innerHTML = "";
			let canvasDiv = document.getElementById('canvas-div');
			canvasDiv.innerHTML = '';
			//add everything back
			addElements(data, zipCode);
		}
	})
}

function addElements(data, zipCode) {
	//creates the elements
	let title = document.createElement("h1");
	let mainTemp = document.createElement("p");
	let minTemp = document.createElement("p");
	let maxTemp = document.createElement("p");
	let clouds = document.createElement("p");
	let cloudDescription = document.createElement("p");
	let humidity = document.createElement("p");

	//puts the text
	title.textContent = `${data["name"]}'s Weather`;
	mainTemp.textContent = `Main temperature: ${Math.round(
		data.main.temp
	)} degrees`;
	minTemp.textContent = `Minimum Temperature: ${Math.round(
		data.main.temp_min
	)} degrees`;
	maxTemp.textContent = `Maximum Temperature: ${Math.round(
		data.main.temp_max
	)} degrees`;
	clouds.textContent = `Cloudiness: ${data.clouds.all}%`;
	let cloudDescriptionTextContent = data.weather[0].description;
	cloudDescription.textContent = `Cloud description: ${
		cloudDescriptionTextContent.charAt(0).toUpperCase() +
		cloudDescriptionTextContent.slice(1)
		}`;
	humidity.textContent = `Humidity: ${data.main.humidity}%`;

	//adds the elements to the proper div
	document.querySelector(".container-4").appendChild(title);
	document.querySelector(".container-4").appendChild(mainTemp);
	document.querySelector(".container-4").appendChild(minTemp);
	document.querySelector(".container-4").appendChild(maxTemp);
	document.querySelector(".container-4").appendChild(clouds);
	document.querySelector(".container-4").appendChild(cloudDescription);
	document.querySelector(".container-4").appendChild(humidity);
	//add graph

	addGraph(zipCode);
}

function onDaysChange() {
	let dropDownDays = document.getElementById('drop-down-days');
	return dropDownDays.value;
}

function onColorsChange() {
	let dropDownColors = document.getElementById('drop-down-colors');
	return dropDownColors.value;
}

function addGraph(zipCode) {

	let colors = {
		red: '255, 68, 0', //rgb colors 
		orange: '255, 200, 0',
		yellow: '255, 251, 0',
		green: '119, 255, 0',
		blue: '0, 149, 255',
		purple: '183, 0, 255',
		transparent: 'transparent',
	}
	let months = {
		'Jan': 01,
		'Feb': 02,
		'Mar': 03,
		'Apr': 04,
		'May': 05,
		'Jun': 06,
		'Jul': 07,
		'Aug': 08,
		'Sep': 09,
		'Oct': 10,
		'Nov': 11,
		'Dec': 12,
	}
	let temps = new Array();
	let days = new Array();

	let i;
	//i starts at 7, and decrements all the way down to 0
	for (i = onDaysChange(); i >= 0; i--) {
		//Change it so that it is i days in the past.
		let currDate = new Date();

		let pastDate = currDate.getDate() - i;
		currDate.setDate(pastDate);

		let string = currDate.toString();
		let words = string.split(" ");

		let day = words[2]
		let month = computeMonth(words[1], months); //the month in a number. Ex: 'Feb' is 2 
		// the month in a string value is words[1]. Ex: 'Jan'
		let year = words[3];
		//year-month-day
		let pastFullDay = `${year}-${month}-${day}`;
		//make api call for past full day

		let weatherApiCall = `http://api.weatherapi.com/v1/history.json?key=${weatherApiKey}&q=${zipCode}&dt=${pastFullDay}&debug=1`;

		$.getJSON(weatherApiCall, function (data) {
			avgTempForEachDay = data['forecast']['forecastday'][0]['day']['avgtemp_f'];

			//append temps
			temps.push(avgTempForEachDay);
			days.push(`${words[1]} ${takeAwayZero(day)}`); //start of the array will be the most recent temps
			debugging: console.log(pastFullDay, avgTempForEachDay);
		})
	}
	//!creates canvas
	let canvas = document.createElement('canvas');
	let canvasDiv = document.getElementById('canvas-div');
	canvas.id = 'lineChart';
	canvasDiv.appendChild(canvas);

	var ctxL = document.getElementById("lineChart").getContext('2d');

	var gradientFill = ctxL.createLinearGradient(0, 0, 0, 290);

	let graphColor = computeColor(onColorsChange(), colors);

	let information = {
		type: 'line',
		data: {
			labels: days,
			datasets: [
				{
					label: "Average temperature",
					data: temps,
					backgroundColor: gradientFill,
					borderColor: [
						'black',
					],
					borderWidth: 2,
					pointBorderColor: "#fff",
					pointBackgroundColor: "rgba(173, 53, 186, 0.1)",
				}
			]
		},
		options: {
			responsive: true,
			responsiveAnimationDuration: 1000,
			legend: {
				labels: {
					fontColor: "white",
					fontSize: 18,
				}

			},
			scales: {
				yAxes: [{ ticks: { fontColor: "aliceblue", } }],

				xAxes: [{ ticks: { fontColor: "aliceblue", } }],
			},
		},
	};

	if (colors[onColorsChange()] != 'transparent') {
		gradientFill.addColorStop(0, `rgba(${graphColor}, 1)`);
		gradientFill.addColorStop(1, `rgba(${graphColor}, 0.3)`);
		/*information.options.scales.yAxes[0].ticks.fontColor = `rgb(${computeColor(onColorsChange(), colors)}`;
		information.options.scales.xAxes[0].ticks.fontColor = `rgb(${computeColor(onColorsChange(), colors)}`; */

	} else if (colors[onColorsChange()] === 'transparent') {
		gradientFill.addColorStop(0, `rgba(0, 0, 0, 0)`);
		gradientFill.addColorStop(1, `rgba(0, 0, 0, 0)`);
		information.data.datasets[0].borderColor = 'white';
		/*information.options.scales.yAxes[0].ticks.fontColor = `white`;
		information.options.scales.xAxes[0].ticks.fontColor = `white`; */

	}

	var myLineChart = new Chart(ctxL, information);

	let note = document.createElement('em');
	note.id = 'note';
	note.className = 'note';

	let noteDiv = document.querySelector('.container-2-half');
	let allNotes = noteDiv.getElementsByTagName('em');
	console.log(allNotes.length);


	if (allNotes.length === 0) {
		noteDiv.appendChild(note);

	} else if (allNotes.length === 1) {
		noteDiv.innerHTML = '';
		noteDiv.appendChild(note);
	}

	note.textContent = '*Note: If the graph does not display after clicking submit, try pressing ctrl-shift-i (cmd-shift-c on mac) twice';
	noteDiv.appendChild(note);
	noteDiv.appendChild(document.createElement('br'));
}

function takeAwayZero(number) {
	if (number < 10) {
		number = number.substring(1);
	}
	return number;
}

function computeMonth(month, months) {
	return months[month];
}

function computeColor(color, colors) {
	return colors[color];
}