let boxCount = 0;
let boxContainer = document.getElementById("boxContainer");

let minus = document.querySelector(".minus_stores");
minus.addEventListener("click", function () {
  decrease("Number_of_stores", "false");
});

let plus = document.querySelector(".plus_stores");
plus.addEventListener("click", function () {
  increase("Number_of_stores", "false");
});

let minus_vehicle = document.querySelector(".minus_Vehicles");
minus_vehicle.addEventListener("click", function () {
  decrease("Number_of_Vehicles", "true");
});

let plus_vehicle = document.querySelector(".plus_Vehicles");
plus_vehicle.addEventListener("click", function () {
  increase("Number_of_Vehicles", "true");
});

function increase(elementId, makeBox) {
  const num = document.querySelector("." + elementId);
  let a = parseInt(num.innerText);
  a++;
  num.innerText = a;
  if (makeBox === "true") {
    addbox();
  }
}

function decrease(elementId, makeBox) {
  const num = document.querySelector("." + elementId);
  let a = parseInt(num.innerText);
  if (a > 0) {
    a--;
    num.innerText = a;
  }
  if (makeBox === "true") {
    removebox();
  }
}

function addbox() {
  // Create box container
  boxCount++;
  let box = document.createElement("div");
  box.className = "box";
  box.id = "box" + boxCount;
  box.value = `Info of Vehicle (${boxCount})`;
  box.innerHTML = `
<div class="row">
  <fieldset class="newVehicle">
    <legend class="Info_of_Vehicle">${box.value}</legend>
    <div class="row">
      <div class="col s6 m6 l3">
        <label for="cars">Type: </label>
      </div>
      <div class="col s6 m6 l3">
        <select class="browser-default selectType">
          <option value="Bicycles">Bicycles</option>
          <option value="Motorcycles">Motorcycles</option>
          <option value="Cars">Cars</option>
          <option value="Vans">Vans</option>
        </select>
      </div>
      <div class="col s6 m6 l3">
        <label>Capacity: </label>
      </div>
      <div class="col s6 m6 l3 ">
        <input type="number" class="browser-default capacityInput" type="number" min="0" value='0'
          placeholder=" number kg">
      </div>
    </div>
    <div class="row">
      <div class="col s6 m6 l6"></div>
      <div class="col s6 m6 l6">
        <label class='valid-cap' style="display: none">The Capacity Must Be Less Than or Equal 1000</label>
      </div>
    </div>
    <div class="row accept_fridge">
      <div class="col s6 m6 l6">
        <label>Does The Vehicles Accept Fridge </label>
      </div>
      <div class="col s6 m6 l6">
        <label class="container">
          <input class="with-gap yes" type="radio" value="yes">
          <span class="yes">YES</span>
        </label>
        <label class="container">
          <input class="with-gap no" type="radio" value="no" checked>
          <span class="no">NO</span>
        </label>
      </div>
    </div>
    <div class="row capacity_fridge" style="display: none;">
      <div class="col s6 m6 l3">
        <label id='last'>Capacity of Fridge: </label>
      </div>
      <div class="col s6 m6 l3 ">
        <input type="number" class="browser-default capacityFridgeInput" min="0" placeholder=" number kg" value='0'>
      </div>
    </div>
</div>
  `;

  // Append the box to the container
  boxContainer.appendChild(box);
  const radioButtons = box.querySelectorAll('input[type="radio"]');
  radioButtons.forEach((radioButton) => {
    radioButton.addEventListener("click", function () {
      handleFridgeOption(this, `${box.id}`);
    });
  });
}

function handleFridgeOption(selectedOption, id) {
  const box = document.getElementById(id);
  const otherOption = selectedOption.value === "yes" ? "no" : "yes";
  const otherRadioButton = box.querySelector("." + otherOption);
  otherRadioButton.checked = false;
  selectedOption.value === "yes"
    ? (document.querySelector(`#${id} .capacity_fridge`).style.display =
        "block")
    : (document.querySelector(`#${id} .capacity_fridge`).style.display =
        "none");
}

function removebox() {
  if (boxCount > 0) {
    const lastBox = document.getElementById("box" + boxCount);
    boxContainer.removeChild(lastBox);
    boxCount--;
  }
}

function initializeCountryStateSelection(
  countryStateInfo,
  countrySelection,
  stateSelection
) {
  stateSelection.disabled = true;
  stateSelection.length = 1;

  for (let country in countryStateInfo) {
    countrySelection.options[countrySelection.options.length] = new Option(
      country,
      country
    );
  }

  countrySelection.onchange = (e) => {
    stateSelection.disabled = false;
    stateSelection.length = 1;

    const selectedCountry = e.target.value;
    const states = countryStateInfo[selectedCountry];

    for (let state of states) {
      stateSelection.options[stateSelection.options.length] = new Option(
        state,
        state
      );
    }
  };

  // Retrieve the selected country from localStorage if available
  const selectedCountry = localStorage.getItem("selectedCountry");
  if (selectedCountry) {
    countrySelection.value = selectedCountry;

    // Trigger the 'change' event to populate the city selection
    const changeEvent = new Event("change");
    countrySelection.dispatchEvent(changeEvent);
  }

  // Save the selected country to localStorage when it changes
  countrySelection.onchange = (e) => {
    const selectedCountry = e.target.value;
    localStorage.setItem("selectedCountry", selectedCountry);
  };
}

initializeCountryStateSelection(
  countryStateInfo,
  document.querySelector("#Country"),
  document.querySelector("#State")
);

let startSimulationBtn = document.getElementById("Start_Simulation");
startSimulationBtn.addEventListener("click", function () {
  startSimulation(
    document.querySelector(".Number_of_stores"),
    document.querySelector("#Country"),
    document.querySelector("#State"),
    document.querySelector(".check_country"),
    document.querySelector(".check_city")
  );
});

function startSimulation(
  NumberOfstores,
  country,
  city,
  classOfCountry,
  classOfCity
) {
  vehicleArray = listOfVehicles(boxCount);
  saveValuesInArray(NumberOfstores, country, city);
  saveArrayToSession(vehicleArray);
  if (Validation(country, city, classOfCountry, classOfCity)) {
    window.location.href = "/map.html";
  }
}

var vehicleArray = [];

function saveArrayToSession(myArray) {
  sessionStorage.setItem("vehicleArray", JSON.stringify(myArray));
}

function saveValuesInArray(NumberOfstores, country, city) {
  let vehicle1 = {
    NumberOfstores: +NumberOfstores.innerHTML,
    country: country.value,
    city: city.value,
  };
  vehicleArray.push(vehicle1);
}

function listOfVehicles(numberOfVehicles) {
  let array = [];
  for (let i = 1; i <= numberOfVehicles; i++) {
    let box = boxContainer.querySelector("#box" + i);
    let typeOfvehicle = box.querySelector(".selectType");
    let capacityInput = box.querySelector(".capacityInput");
    let Radio = box.querySelector(".yes");
    let capacityFridgeInput = box.querySelector(".capacityFridgeInput");
    // Create an object to store the vehicle information
    let vehicle = {
      type: typeOfvehicle.value,
      capacity: capacityInput.value,
      fridge: Radio.checked,
      fridgeCapacity: +capacityFridgeInput.value,
      currentCapacitance: 0,
      currentCapacitanceFridge: 0,
    };
    // Push the vehicle object to the vehicleArray
    array.push(vehicle);
  }
  return array;
}

function Validation(country, city, classOfCountry, classOfCity) {
  if (country.value === "Choose Your Country") {
    classOfCountry.style.display = "block";
    return false;
  } else if (city.value === "Choose Your City") {
    classOfCountry.style.display = "none";
    classOfCity.style.display = "block";
    return false;
  } else {
    classOfCountry.style.display = "none";
    classOfCity.style.display = "none";
    return true;
  }
}
