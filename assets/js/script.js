// base url for API call:
// https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
 
var apiKey = "1e2830f4a2021cb3e5dcd610730168c4"
var searchTerm = document.querySelector("#search-field");
var searchFormEl = document.querySelector("#search-form");
var cityEl = document.querySelector("#city-info");
var currentDayEl = document.querySelector("#current-day-info");
var fiveDayForecastEl = document.querySelector("#five-day-forecast");
var introTextEl = document.querySelector("#intro");
var prevSearchEl = document.querySelector("#prev-search-element");
var clearSearchEl = document.querySelector("#clear-search-history");

var currentDate = luxon.DateTime.now().toFormat('MM/dd/yyyy');

// initializing previous search terms array
var prevSearchTerms = []

var loadPrevSearchTerms = function() {
    prevSearchTerms = JSON.parse(localStorage.getItem("prevSearchTerms"));

    // creating new object to track status arrays (when nothing in local storage)
    if (!prevSearchTerms) {
        prevSearchTerms = []
    }

    createPrevSearchBtn(prevSearchTerms)

    clearPrevSearchTerms()
}

var clearPrevSearchTerms = function() {
    //
}

var formSubmitHandler = function(event) {
    event.preventDefault();

    var city = searchTerm.value 
    if (city) {
        cityToLatLong(city);
        searchTerm.value = "";
    } else {
        alert("Enter a city!")
    }
};

var cityToLatLong = function(city) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey;

    fetch(apiUrl)
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                cityEl.textContent = city + currentDate;
                getLatLong(data)
            });
        } else {
            cityEl.textContent = city + "was not found. Review submitted city name for errors"
        }
    })
    .catch(function(error) {
        alert("Cannot connect to weather map");
    });
};

var getLatLong = function(array) {
    var lat = array.coord.lat
    var lon = array.coord.lon

    searchCity(lat, lon)
}

var searchCity = function(lat, lon) {
    // url to request lat & long
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=minutely,hourly&appid=" + apiKey + "&units=imperial";

    fetch(apiUrl)
    .then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                displayCurrentDayWeather(data)
                displayFiveDayForecast(data)
            });
        } else {
            alert("Error: City not found");
        }
    })
    .catch(function(error) {
        alert("Unable to connect to weather map");
    });
};

var displayCurrentDayWeather = function(array) {
    // element to store temp
    var tempEl = document.createElement("p")
    tempEl.textContent = "Temp: " + array.current.temp + " °F"

    // element storing wind speed
    var windEl = document.createElement("p")
    windEl.textContent = "Wind: " + array.current.wind_speed + " mph"

    // element storing humidity
    var humidityEl = document.createElement("p")
    humidityEl.textContent = "Humidity: " + array.current.humidity + " %"

    // appending elements to div for current day forecast
    currentDayEl.append(tempEl, windEl, humidityEl)
};

var displayFiveDayForecast = function(array) {
    // looping to get the next 5 days' data
    for (var i =1; i < 6; i++) {
        var date = luxon.DateTime.fromSeconds(array.daily[i].dt).toFormat('MM/dd/yyyy')

        // creating a card for each day's data
        var fiveDayDiv = document.createElement("div")
        fiveDayDiv.classList.add("five-day-forecast-card")

        // creating a card for each day
        var fiveDayDate = document.createElement("h3")
        fiveDayDate.textContent = date;

        // getting the temp for each day
        var fiveDayTemp = document.createElement("p")
        fiveDayTemp.textContent= "Temp: " + array.daily[i].temp.day + " °F"

        //getting wind speed for each day
        var fiveDayWind = document.createElement("p")
        fiveDayWind.textContent= "Wind: " + array.daily[i].wind_speed + " mph"

        // getting humidity level for each day
        var fiveDayHumidity = document.createElement("p")
        fiveDayHumidity.textContent= "Humidity: " + array.daily[i].humidity + " %"

        fiveDayDiv.append(fiveDayDate, fiveDayTemp, fiveDayWind, fiveDayHumidity)

        // appending to the container
        fiveDayForecastEl.append(fiveDayDiv)
    }

};

var savePrevSearch = function(array) {
    localStorage.setItem("prevSearchTerms", JSON.stringify(array));
}

var createPrevSearchBtn = function(array) {
    for (var i = 0; i < array.length; i++) {

        var prevSearchButton = document.createElement("button")
        prevSearchButton.textContent = array[1]
        prevSearchButton.setAttribute("value", array[1])
        prevSearchButton.classList.add("btn")
        prevSearchButton.classList.add("btn-light")
        prevSearchButton.classList.add("prev-search")

        prevSearchEl.append(prevSearchButton)
    }
}

var displayPreviousSearch = function(lat, lon) {
    var searchTerm = cityEl.textContent
    var city = searchTerm.split("(")[0].trim()

    var cityExists = prevSearchTerms.indexOf(city)
    if(cityExists !== -1) {
        return
    }

    // placing the last searched city at the beginning of 'previous search' list
    prevSearchTerms.unshift(city)

    // limit to 7 cities to be shown in 'previous searches'
    if (prevSearchTerms.length == 8) {
        prevSearchTerms.pop()
    }
}

loadPrevSearchTerms()

// initial search form
searchFormEl.addEventListener("submit", formSubmitHandler)

prevSearchEl.addEventListener("click", function(event) {
    var city = event.target.value
    cityToLatLong(city)
});

