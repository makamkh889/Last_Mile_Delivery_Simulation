let vehicleArray = retrieveArrayFromSession("vehicleArray");

function retrieveArrayFromSession(Storage) {
  let storedData = JSON.parse(sessionStorage.getItem(Storage));
  return storedData;
}

const country = vehicleArray[vehicleArray.length - 1].country;
const city = vehicleArray[vehicleArray.length - 1].city;

getLngLat(country, city);

let cityCoordinates = [
  retrieveArrayFromSession("lat"),
  retrieveArrayFromSession("lng"),
];

let map;
var markers = [];
var clickLabel;

async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: cityCoordinates[0], lng: cityCoordinates[1] },
    zoom: 15,
  });
  clickLabel = new google.maps.InfoWindow({
    content: "Center of City",
    position: { lat: cityCoordinates[0], lng: cityCoordinates[1] },
  });
  clickLabel.open(map);
  let checkclick = false;
  map.addListener("click", function (event) {
    if (checkclick === true) {
      sweatAlert(
        "good jop",
        "you enter all needed markers on map...",
        "success"
      );
    } else {
      checkclick = true;
      if (document.querySelector(".Numberoforders input").value === "0") {
        sweatAlert("Take Care", "Enter Number of Orders first...", "warning");
      } else {
        let RestaurantsData = SetRestaurantData(
          +vehicleArray[vehicleArray.length - 1].NumberOfstores,
          getPosition(+vehicleArray[vehicleArray.length - 1].NumberOfstores)
        );
        let VehiclesData = SetVehicleData(
          +(vehicleArray.length - 1),
          getPosition(+(vehicleArray.length - 1))
        );
        let OrdersData = SetOrdersData(
          +document.querySelector(".Numberoforders input").value,
          getPosition(+document.querySelector(".Numberoforders input").value)
        );
        [RestaurantsData, VehiclesData, OrdersData] = dataToShow(
          RestaurantsData,
          VehiclesData,
          OrdersData
        );
        DrawMarkers(RestaurantsData, VehiclesData, OrdersData);
      }
    }
  });
}

function sweatAlert(title, text, type) {
  swal({
    title: title,
    text: text,
    type: type,
    confirmButtonText: "understand :)",
  });
}

function DrawMarkers(RestaurantsData, VehiclesData, OrdersData) {
  for (
    let j = 0;
    j < +vehicleArray[vehicleArray.length - 1].NumberOfstores;
    j++
  ) {
    placeMarker(RestaurantsData[j], VehiclesData, 0);
  }
  for (let j = 0; j < +(vehicleArray.length - 1); j++) {
    placeMarker(VehiclesData[j], OrdersData, 1);
  }
  for (
    let j = 0;
    j < +document.querySelector(".Numberoforders input").value;
    j++
  ) {
    placeMarker(OrdersData[j], OrdersData, 2);
  }
}

function placeMarker(Data, storeArray, num) {
  var image = {
    url: Data.image,
    size: new google.maps.Size(50, 71),
    anchor: new google.maps.Point(10, 34),
    scaledSize: new google.maps.Size(25, 25),
  };
  var marker = new google.maps.Marker({
    position: { lat: Data.lat, lng: Data.lng },
    map,
    icon: image,
    title: "Me",
  });
  let contentString;
  if (num === 0) {
    contentString = setContentResturant(Data);
  } else if (num === 1) {
    contentString = setContentVehicle(Data);
  } else {
    contentString = setContentOrders(Data);
  }

  const infowindow = new google.maps.InfoWindow({
    content: contentString,
    ariaLabel: "Uluru",
  });
  marker.addListener("mouseover", () => {
    infowindow.open({
      anchor: marker,
      map,
    });
  });
  marker.addListener("mouseout", function () {
    infowindow.close({
      anchor: marker,
      map,
    });
  });

  if (num === 0 || num === 1) {
    for (let i = 0; i < Data.IDs_Other.length; i++) {
      let currentRoute = null;

      marker.addListener("click", function () {
        map.setOptions({ disableDoubleClickZoom: false });
        const originLat = Data.lat;
        const originLng = Data.lng;
        const destinationLat = storeArray[Data.IDs_Other[i] - 1].lat;
        const destinationLng = storeArray[Data.IDs_Other[i] - 1].lng;

        if (currentRoute) {
          currentRoute.setMap(null); // Remove the existing route from the map
        }

        drawRoute(originLat, originLng, destinationLat, destinationLng)
          .then((response) => {
            if (currentRoute) {
              currentRoute.setDirections(response); // Update the existing route
            } else {
              currentRoute = new google.maps.DirectionsRenderer({
                map: map,
                suppressMarkers: true,
                directions: response,
              });
            }
          })
          .catch((status) => {
            console.error("Directions request failed due to " + status);
          });
      });

      marker.addListener("dblclick", function () {
        map.setOptions({ disableDoubleClickZoom: false });
        if (currentRoute) {
          currentRoute.setMap(null); // Remove the route from the map
          currentRoute = null; // Reset the currentRoute variable
        }
      });
    }
  }

  markers.push(marker);
}

async function getLngLat(country, city) {
  const apiKey = "AIzaSyBqRmfbzi0SEuglZt0fBjrJvKfRXnQFpdM";
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${city},${country}&key=${apiKey}`
  );
  const data = await response.json();

  if (data.status === "OK") {
    const { lat, lng } = data.results[0].geometry.location;

    sessionStorage.setItem("lat", lat);
    sessionStorage.setItem("lng", lng);
  } else {
    console.error("Failed to retrieve latitude and longitude.");
  }
}
initMap();

function checkIfAddressIsStreet(latitude, longitude) {
  var url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      var isStreet = data.results.some((place) =>
        ["street_address", "route"].some((type) => place.types.includes(type))
      );
      if (isStreet) {
        return true;
      } else {
        return false;
      }
    })
    .catch((error) => console.log(error));
}

function getRandomLatLng(center, radius) {
  let lat = center[0] + (Math.random() - 0.5) * radius;
  let lng = center[1] + (Math.random() - 0.5) * radius;
  return [lat, lng];
}

function getPosition(num) {
  let positions = [];
  let lat, lng;
  [lat, lng] = getRandomLatLng(cityCoordinates, 0.0095);
  for (let i = 0; i < num; i++) {
    while (checkIfAddressIsStreet(lat, lng) === false) {
      [lat, lng] = getRandomLatLng(cityCoordinates, 0.0095);
    }
    positions.push([lat, lng]);
    [lat, lng] = getRandomLatLng(cityCoordinates, 0.0095);
  }
  return positions;
}

function SetRestaurantData(num, position) {
  let array = [];
  for (let i = 0; i < num; i++) {
    let AllCapacityoOfOrdersvalue = getRandomNumber(0, 1000);
    let Capacity_Of_Orders_Need_Fridge_value = getRandomNumber(
      0,
      AllCapacityoOfOrdersvalue
    );
    let vehicleID = [];
    let storedData = {
      ID: i + 1,
      image: "/img/1.png",
      lat: position[i][0],
      lng: position[i][1],
      All_Capacity_Of_Orders: AllCapacityoOfOrdersvalue,
      Capacity_Of_Orders_Need_Fridge: Capacity_Of_Orders_Need_Fridge_value,
      capacity_remaining_after_delivery: AllCapacityoOfOrdersvalue,
      capacity_Fridge_remaining_after_delivery:
        Capacity_Of_Orders_Need_Fridge_value,
      IDs_Other: vehicleID,
    };
    array.push(storedData);
  }
  return array;
}

function SetVehicleData(num, position) {
  let array = [];
  for (let i = 0; i < num; i++) {
    let initialCapcityFridge =
      vehicleArray[i].fridge === false
        ? 0
        : getRandomNumber(0, vehicleArray[i].fridgeCapacity);
    let initialCapcity = getRandomNumber(0, vehicleArray[i].capacity);
    let iconUrl =
      vehicleArray[i].type === "Bicycles"
        ? "/img/Bicycles.png"
        : vehicleArray[i].type === "Motorcycles"
        ? "/img/Motorcycles.png"
        : vehicleArray[i].type === "Cars"
        ? "/img/Cars.png"
        : "/img/Vans.png";
    let OrdersID = [];
    let storedData = {
      ID: i + 1,
      lat: position[i][0],
      lng: position[i][1],
      image: iconUrl,
      type: vehicleArray[i].type,
      capacity: +vehicleArray[i].capacity,
      Need_fridge: vehicleArray[i].fridge,
      fridge_Capacity: +vehicleArray[i].fridgeCapacity,
      current_capacitance: initialCapcity,
      current_fridge_capacitance: initialCapcityFridge,
      initial_capacity: initialCapcity,
      initial_fridge_capacity: initialCapcityFridge,
      IDs_Other: OrdersID,
    };
    array.push(storedData);
  }
  return array;
}

function SetOrdersData(num, position) {
  let array = [];
  for (let i = 0; i < num; i++) {
    let iconUrl = "/img/home.png";
    let storedData = {
      ID: i + 1,
      image: iconUrl,
      lat: position[i][0],
      lng: position[i][1],
      capacity: 0,
      fridge_Capacity: 0,
    };
    array.push(storedData);
  }
  return array;
}

function dataToShow(RestaurantsData, VehiclesData, OrdersData) {
  for (let i = 0; i < RestaurantsData.length; i++) {
    for (let j = 0; j < VehiclesData.length; j++) {
      let minimum_capacity = Math.min(
        VehiclesData[j].capacity - VehiclesData[j].current_capacitance,
        RestaurantsData[i].capacity_remaining_after_delivery
      );
      let minimum_capacity_fridge = Math.min(
        VehiclesData[j].fridge_Capacity -
          VehiclesData[j].current_fridge_capacitance,
        RestaurantsData[i].capacity_Fridge_remaining_after_delivery
      );
      RestaurantsData[i].capacity_remaining_after_delivery -= minimum_capacity;
      RestaurantsData[i].capacity_Fridge_remaining_after_delivery -=
        minimum_capacity_fridge;
      VehiclesData[j].current_capacitance += minimum_capacity;
      VehiclesData[j].current_fridge_capacitance += minimum_capacity_fridge;
      if (minimum_capacity_fridge > 0 || minimum_capacity > 0) {
        RestaurantsData[i].IDs_Other.push(VehiclesData[j].ID);
      }
    }
  }

  let sumCapacity = 0,
    sumCapacityfridge = 0;
  for (let i = 0; i < VehiclesData.length; i++) {
    sumCapacity +=
      VehiclesData[i].current_capacitance - VehiclesData[i].initial_capacity;
    sumCapacityfridge +=
      VehiclesData[i].current_fridge_capacitance -
      VehiclesData[i].initial_fridge_capacity;
  }
  for (let i = 0; i < VehiclesData.length; i++) {
    let current =
      VehiclesData[i].current_capacitance - VehiclesData[i].initial_capacity;
    let current_fridge =
      VehiclesData[i].current_fridge_capacitance -
      VehiclesData[i].initial_fridge_capacity;
    for (let j = 0; j < OrdersData.length; j++) {
      if (Math.round(sumCapacity / OrdersData.length) < current) {
        OrdersData[j].capacity = Math.round(sumCapacity / OrdersData.length);
        current -= OrdersData[j].capacity;
      } else if (
        current != 0 &&
        Math.round(sumCapacity / OrdersData.length) >= current
      ) {
        OrdersData[j].capacity = current;
        current = 0;
      }
      if (Math.round(sumCapacityfridge / OrdersData.length) < current_fridge) {
        OrdersData[j].fridge_Capacity = Math.round(
          sumCapacityfridge / OrdersData.length
        );
        current_fridge -= OrdersData[j].fridge_Capacity;
      } else if (
        current_fridge != 0 &&
        Math.round(sumCapacityfridge / OrdersData.length) >= current_fridge
      ) {
        OrdersData[j].fridge_Capacity = current_fridge;
        current_fridge = 0;
      }

      VehiclesData[i].IDs_Other.push(OrdersData[j].ID);
    }
  }

  return [RestaurantsData, VehiclesData, OrdersData];
}

function getRandomNumber(a, b) {
  if (a > b) {
    [a, b] = [b, a];
  }
  const random = Math.round(Math.random() * (b - a) + a);
  return random;
}

function setContentVehicle(VehiclesData) {
  let IDs = "";
  if (VehiclesData.IDs_Other.length > 0) {
    IDs = "Order(";
    for (let i = 0; i < VehiclesData.IDs_Other.length - 1; i++) {
      IDs += VehiclesData.IDs_Other[i];
      IDs += "), Order(";
    }
    IDs += VehiclesData.IDs_Other[VehiclesData.IDs_Other.length - 1];
    IDs += ")";
  } else {
    IDs = "There are no orders to deliver.";
  }
  let img =
    VehiclesData.type === "Bicycles"
      ? "/img/Bicycles.png"
      : VehiclesData.type === "Motorcycles"
      ? "/img/Motorcycles.png"
      : VehiclesData.type === "Cars"
      ? "/img/Cars.png"
      : "/img/Vans.png";
  let display = "block";
  if (VehiclesData.Need_fridge === false) {
    display = "none";
  }
  let content = document.createElement("div");
  content.innerHTML = `
<div class="container">
    <div class="row">
        <img class="col s3" src=${img} heigth=30px>
        <p class="col s3">${VehiclesData.type}   (${VehiclesData.ID})</p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">Capacity : <span style="font-size: 15px; color: rgb(107, 106, 106); font-weight: 500;" > Full:${VehiclesData.capacity} || Current:${VehiclesData.current_capacitance} || initial:${VehiclesData.initial_capacity}</span></p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">Has fridge ?! :${VehiclesData.Need_fridge}</p>
    </div>
     <div class="row" style="display:${display}" >
<p style="font-size: 18px; color: brown; font-weight: 500;">Capacity of Fridge : <span style="font-size: 15px; color: rgb(107, 106, 106); font-weight: 500;" > Full:${VehiclesData.fridge_Capacity} || Current:${VehiclesData.current_fridge_capacitance} || initial:${VehiclesData.initial_fridge_capacity}</span></p></div>
<div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">a list of the order IDs that each vehicle will deliver  :<br><span style="color:black">${IDs}</span></p>
    </div>
</div>
 `;
  return content;
}

function setContentResturant(RestaurantsData) {
  let content = document.createElement("div");
  let IDs = "";
  if (RestaurantsData.IDs_Other.length > 0) {
    IDs = "vehicle(";
    for (let i = 0; i < RestaurantsData.IDs_Other.length - 1; i++) {
      IDs += RestaurantsData.IDs_Other[i];
      IDs += "), vehicle(";
    }
    IDs += RestaurantsData.IDs_Other[RestaurantsData.IDs_Other.length - 1];
    IDs += ")";
  } else {
    IDs = "No vehicle is currently available for delivery orders.";
  }
  content.innerHTML = `
<div class="container">
    <div class="row">
        <img src="/img/1.png" heigth=30px>
          <p style="font-size: 18px; color: brown; font-weight: 500;">Store name :<span style="color:black">Store (${RestaurantsData.ID})</span></p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">Capacity of Order :<span style="color:black">${RestaurantsData.All_Capacity_Of_Orders}</span></p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">Capacity remaining after delivery :<span style="color:black">${RestaurantsData.capacity_remaining_after_delivery}</span></p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">Capacity of Order Need Fridge :<span style="color:black">${RestaurantsData.Capacity_Of_Orders_Need_Fridge}</span></p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">Capacity fridge remaining after delivery :<span style="color:black">${RestaurantsData.capacity_Fridge_remaining_after_delivery}</span></p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">IDs of vehicles that take orders from this restaurant :<br><span style="color:black">${IDs}</span></p>
    </div>
</div>
 `;
  return content;
}

function setContentOrders(OrdersData) {
  let content = document.createElement("div");
  content.innerHTML = `
<div class="container">
    <div class="row">
        <img src="${OrdersData.image}" heigth=30px>
          <p style="font-size: 18px; color: brown; font-weight: 500;">Home ID :<span style="color:black">Home (${OrdersData.ID})</span></p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">Ordering capacity :<span style="color:black">${OrdersData.capacity}</span></p>
    </div>
    <div class="row">
        <p style="font-size: 18px; color: brown; font-weight: 500;">Ordering capacity demands the use of a fridge :<span style="color:black">${OrdersData.fridge_Capacity}</span></p>
    </div>
</div>
 `;
  return content;
}

function drawRoute(originLat, originLng, destinationLat, destinationLng) {
  return new Promise((resolve, reject) => {
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
    });

    const origin = new google.maps.LatLng(originLat, originLng);
    const destination = new google.maps.LatLng(destinationLat, destinationLng);

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(response);
          resolve(response);
        } else {
          reject(status);
        }
      }
    );
  });
}
