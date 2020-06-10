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
	errorMessage.style.color = "red";
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
		console.log(data);
		
		allh1s = document.getElementsByTagName("h1");
		//data is the whole json object
		console.log(data);

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

function addGraph(zipCode) {
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
	for (i = 7; i >= 0; i--) {
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
			console.log(pastFullDay, avgTempForEachDay);
		})
	}
	//create canvas
	canvasDiv = document.getElementById('canvas-div');
	let canvas = document.createElement('canvas');
	canvasDiv.appendChild(canvas);
	canvas.id = 'myChart';

	var ctx = canvas.getContext('2d');
	var chart = new Chart(ctx, {
		// The type of chart we want to create
		type: 'line',

		// The data for our dataset
		data: {
			labels: days,
			datasets: [{
				label: 'Average temperature for each day within the past week',
				backgroundColor: 'rgb(39, 174, 219)',
				borderColor: 'black',
				data: temps,
			}]
		},

		// Configuration options go here
		options: {
			hover: {
				// Overrides the global setting
				mode: 'index'
			}
		}
	});
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
