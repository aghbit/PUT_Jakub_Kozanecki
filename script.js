class MapApp {
  // declaring map varaible and array of markers on the map
  #startPosition = [];
  #map;
  #markers = [];
  // #markers_specific = [];

  // asking user for permisson to get his location
  checkCurrentPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.getPosition);
    }
  }

  // getting latitude and longitude and calling render map function
  getPosition = (pos) => {
    const lat = pos.coords.latitude;
    const lan = pos.coords.longitude;

    this.#startPosition = [lat, lan];
    this.renderMap(lat, lan);
  };

  // rendering map on users position and adding listener => adding markers
  renderMap(lat, lan) {
    this.#map = L.map("map").setView([lat, lan], 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);

    this.#map.on("click", this.addMarker);
  }

  // showing form to fill new marker
  addMarker = (e) => {
    this.showForm();
    const coords = e.latlng;

    document
      .querySelector(".submit")
      .addEventListener("click", this.renderMarker.bind(this, coords));
  };

  // rendering new marker on the map and adding popup to it
  renderMarker = (coords) => {
    const title = document.querySelector(".trip-name").value;
    const latlng = document.querySelector(".latlng");
    const date = document.querySelector(".trip-date").value;
    const date_e = document.querySelector(".trip-date-e").value;
    const desc = document.querySelector(".trip-desc").value;

    // latlng.value = `${coords.lat} ${coords.lng}`;
    // console.log(latlng);

    const markup = `
    <div class="popup">
        <h2>${title}</h2>
        <h4>${new Date(date).toLocaleDateString("pl-PL")} - ${new Date(
      date_e
    ).toLocaleDateString("pl-PL")}</h4>
        <h3>${desc}</h3>
        <p class="more-btn">More</p>
        <p class="delete">Delete</p>
    </div>
    `;

    L.marker([coords.lat, coords.lng], { draggable: true })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        }).setContent(markup)
      );

    this.#markers.push({
      title: title,
      date_start: date,
      date_end: date_e,
      description: desc,
      coords: [coords.lat, coords.lng],
    });

    // saving data in browser cache
    this._setLocalStorage();
    this.hideForm();
  };

  // rendering markers from browser cache
  renderMarkerFromCache(data) {
    const markup = `
    <div class="popup">
        <h2>${data.title}</h2>
        <h4>${new Date(data.date_start).toLocaleDateString(
          "pl-PL"
        )} - ${new Date(data.date_end).toLocaleDateString("pl-PL")}</h4>
        <h3>${data.description}</h3>
        <p class="more-btn">More</p>
        <p class="delete">Delete</p>
    </div>
    `;

    L.marker([data.coords[0], data.coords[1]], { draggable: true })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        }).setContent(markup)
      );
  }

  addMarkerFromForm = (e) => {
    const [lat, lng] = document.querySelector(".trip-latlng").value.split(" ");

    const title = document.querySelector(".trip-name").value;
    const date = document.querySelector(".trip-date").value;
    const date_e = document.querySelector(".trip-date-e").value;
    const desc = document.querySelector(".trip-desc").value;

    const markup = `
    <div class="popup">
        <h2>${title}</h2>
        <h4>${new Date(date).toLocaleDateString("pl-PL")} - ${new Date(
      date_e
    ).toLocaleDateString("pl-PL")}</h4>
        <h3>${desc}</h3>
        <p class="more-btn">More</p>
        <p class="delete">Delete</p>
    </div>
    `;

    L.marker([lat, lng], { draggable: true })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        }).setContent(markup)
      );

    this.#markers.push({
      title: title,
      date_start: date,
      date_end: date_e,
      description: desc,
      coords: [lat, lng],
    });

    // saving data in browser cache
    this._setLocalStorage();
    this.hideForm();
  };

  // rendering List of Trips
  renderListPage = () => {
    const page = document.querySelector(".page");
    page.innerHTML = "";
    let markup = "";

    const data = JSON.parse(localStorage.getItem("markers"));

    if (!data) {
      alert("No trips added yet!");
      this.renderHomePage();
      return;
    }

    this.#markers = data;

    this.#markers.forEach((mark) => {
      markup += this.createListElement(mark);
    });

    page.innerHTML = `<div class="trip-list__container">${markup}</div><div class="sort-btns"><button>s</button></div>`;

    // document.querySelector(".map-view").classList.add("blur");
    this.listPageListener();
    // this.moreBtnListener();
  };

  // add event listener on click and zoom to specific marker
  listPageListener = () => {
    document.querySelectorAll(".trip-list__el").forEach((el) => {
      el.addEventListener("click", (e) => {
        const lat = e.target.closest(".trip-list__el").dataset.lat;
        const lng = e.target.closest(".trip-list__el").dataset.lng;

        this.#map.setView([lat, lng], 17);
      });
    });
  };

  moreBtnListener = () => {
    document.querySelectorAll(".more-btn").addEventListener("click", () => {
      this.renderListPage();
      console.log("clicked");
    });
  };

  // creating element with trip => it's added to list of trips
  createListElement = (data) => {
    return `
      <div class="trip-list__el" data-lat="${data.coords[0]}" data-lng="${
      data.coords[1]
    }">
        <h2>${data.title}</h2>
        <h4>${new Date(data.date_start).toLocaleDateString(
          "pl-PL"
        )} - ${new Date(data.date_end).toLocaleDateString("pl-PL")}</h4>
        <h3>${data.description}</h3>
      </div>
    `;
  };

  // rendering Home Page
  renderHomePage = () => {
    const page = document.querySelector(".page");
    page.innerHTML = "";
    page.innerHTML = `

    <div class="new-trip-panel hidden">
      <div class="new-trip-panel__option">
        <label for="trip-name">Trip name</label>
        <input type="text" class="trip-name" />
      </div>

      <div class="new-trip-panel__option">
        <label for="trip-name">Start of Trip</label>
        <input type="date" class="trip-date" />
      </div>

      <div class="new-trip-panel__option">
        <label for="trip-name">End of trip</label>
        <input type="date" class="trip-date-e" />
      </div>

      <div class="new-trip-panel__option">
        <label for="trip-name">Description</label>
        <textarea type="text" class="trip-desc" rows="20"></textarea>
      </div>

      <button class="btn submit">Dodaj</button>
      <button class="btn dismiss">CANCEL</button>
    </div>`;

    document.querySelector(".map-view").classList.remove("blur");
  };

  newTripForm = () => {
    const form = document.querySelector(".new-trip-panel");
    const markup = `
    <div class="new-trip-panel__option">
          <label for="trip-name">Trip name</label>
          <input type="text" class="trip-name" />
        </div>

        <div class="new-trip-panel__option">
          <label for="trip-name">Lat / Lng</label>
          <input type="text" class="trip-latlng" value="${
            this.#startPosition[0]
          } ${this.#startPosition[1]}"/>
        </div>

        <div class="new-trip-panel__option">
          <label for="trip-name">Start of Trip</label>
          <input type="date" class="trip-date" />
        </div>

        <div class="new-trip-panel__option">
          <label for="trip-name">End of trip</label>
          <input type="date" class="trip-date-e" />
        </div>

        <div class="new-trip-panel__option">
          <label for="trip-name">Description</label>
          <textarea type="text" class="trip-desc" rows="15"></textarea>
        </div>

        <button class="btn submit_f">ADD</button>
        <button class="btn dismiss">CANCEL</button>
    `;

    form.innerHTML = "";
    form.innerHTML = markup;

    document
      .querySelector(".submit_f")
      .addEventListener("click", this.addMarkerFromForm);

    document.querySelector(".dismiss").addEventListener("click", this.hideForm);

    this.showForm();
  };

  showForm() {
    document.querySelector(".new-trip-panel").classList.remove("hidden");
  }

  hideForm() {
    document.querySelector(".new-trip-panel").classList.add("hidden");
  }

  //saving data to browser cachce
  _setLocalStorage() {
    localStorage.setItem("markers", JSON.stringify(this.#markers));
    // localStorage.setItem(
    //   "markersSpecific",
    //   JSON.stringify(this.#markers_specific)
    // );
  }

  // retrieving data from browser cache
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("markers"));
    // const data2 = JSON.parse(localStorage.getItem("markersSpecific"));

    if (!data) return;

    this.#markers = data;

    this.#markers.forEach((mark) => {
      this.renderMarkerFromCache(mark);
    });
  }

  // initalization of application
  init = () => {
    document
      .querySelector(".list-page")
      .addEventListener("click", this.renderListPage);
    this.checkCurrentPosition();

    document
      .querySelector(".home")
      .addEventListener("click", this.renderHomePage);

    document
      .querySelector(".new-trip")
      .addEventListener("click", this.newTripForm);

    document.querySelector(".dismiss").addEventListener("click", this.hideForm);

    setTimeout(() => {
      this._getLocalStorage();
    }, 1000);
  };
}

const mapManager = new MapApp();

mapManager.init();

// - dodanie opcji usuwania znacznika
// - przeniesienie bazy z pamięci przeglądarki do firebasea
// - dodanie opcji sortowania
// - dodanie mozliwosci uzytkownikowi dodawania zdjec
// - popup zwiazany z przyciskiem more
