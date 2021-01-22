//Variable to store the searched city
var city = "";

// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $("#clear-history");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty = $("#humidity");
var currentWSpeed = $("#wind-speed");
var currentUvindex = $("#uv-index");

// Stored City variable
var storedCity = [];

// Searches to see if the city exists already in the entries from the storage
function find(previousCity) {
    for (var i = 0; i < storedCity.length; i++) {
        if (previousCity.toUpperCase() === storedCity[i]) {
            return -1;
        }
    }
    return 1;
}

//API key
var APIKey = "2f432bb67a2b5fd45e65dbcba0aef9ef";

// Display the curent and future weather to the user after grabing the city form the input text box
function displayWeather(event) {
    event.preventDefault();
    if (searchCity.val().trim() !== "") {
        city = searchCity.val().trim();
        currentWeather(city);
    }
}

//AJAX call
function currentWeather(city) {
    //Builds the URL so we can get a data from server side
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {

        //Parse the response to display the current weather including the City name. the Date and the weather icon. 
        // console.log(response);
        //Data object from server side Api for icon
        var weathericon = response.weather[0].icon;
        var iconurl = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";
        // The date format method from  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date = new Date(response.dt * 1000).toLocaleDateString();
        //Parse the response for name of city and concatanate the date and icon.
        $(currentCity).html(response.name + "(" + date + ")" + "<img src=" + iconurl + ">");
        

        //Convert Temp to Fahrenheit
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        console.log(Math.floor(tempF))

        //Display the Humidity
        $(currentHumidty).html(response.main.humidity + "%");

        //Display UVIndex using geographic coordinates
        UVIndex(response.coord.lon, response.coord.lat);
        forecast(response.id);
        if (response.cod == 200) {
            storedCity = JSON.parse(localStorage.getItem("cityname"));
            console.log(storedCity);
            if (storedCity == null) {
                storedCity = [];
                storedCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname", JSON.stringify(storedCity));
                addToList(city);
            }
            else {
                if (find(city) > 0) {
                    storedCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(storedCity));
                    addToList(city);
                }
            }
        }

    });
}

//UV index response.
function UVIndex(ln, lt) {
    //Builds the url for uvindex.
    var uvURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvURL,
        method: "GET"
    }).then(function (response) {
        $(currentUvindex).html(response.value);
    });
}

//5 Day Forecast of current city searched
function forecast(cityid){
    var daypassed= false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){
            var date= new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var iconcode= response.list[((i+1)*8)-1].weather[0].icon;
            var iconurl="https://openweathermap.org/img/wn/"+iconcode+".png";
            var tempF=(((tempK-273.5)*1.80)+32).toFixed(2);
            var humidity= response.list[((i+1)*8)-1].main.humidity;
        
            $("Date"+i).html(date);
            $("Img"+i).html("<img src="+iconurl+">");
            $("Temp"+i).html(tempF);
            $("Humidity"+i).html(humidity+"%");
        }
        
    });
}

//Adds the passed city on the search history
function addToList(previousCity){
    var listEl= $("<li>"+previousCity.toUpperCase()+"</li>");
    $(listEl).attr("class","list-group-item");
    $(listEl).attr("data-value",previousCity.toUpperCase());
    $(".list-group").append(listEl);
}

//Displays past search again when clicked in search history
function searchHistory(event){
    var liEl=event.target;
    if (event.target.matches("li")){
        city=liEl.textContent.trim();
        currentWeather(city);
    }

}

//Render Function
function renderLastCity(){
    $("ul").empty();
    var storedCity = JSON.parse(localStorage.getItem("cityname"));
    if(storedCity!==null){
        storedCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<storedCity.length;i++){
            addToList(storedCity[i]);
        }
        city=storedCity[i-1];
        currentWeather(city);
    }

}

//Clears search history for page
function clearHistory(event){
    event.preventDefault();
    storedCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}

//Event Handlers
$("#search-button").on("click",displayWeather);
$(document).on("click",searchHistory);
$(window).on("load",renderLastCity);
$("#clear-history").on("click",clearHistory);

