const mapStyle = [
    {
      "featureType": "administrative.land_parcel",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
];

function initMap() {

    // Create the map.
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 5,
      center: {lat: -14.2350, lng: -51.9253},
      styles: mapStyle,
    });


    // Load the stores GeoJSON onto the map.
    map.data.loadGeoJson('stores.json', {idPropertyName: 'storeid'});
  
    // Define the custom marker icons, using the store's "category".
    map.data.setStyle((feature) => {
      return {
      icon: {
          url: `pin-blue.png`,
          scaledSize: new google.maps.Size(28, 40),
      },
      };
    });

    const apiKey = 'AIzaSyAyRCb2lQyqy3zxZl83twN4E8tc7jjAy00';
    const infoWindow = new google.maps.InfoWindow();
  
    // Show the information for a store when its marker is clicked.
    map.data.addListener('click', (event) => {
      const category = event.feature.getProperty('category');
      const name = event.feature.getProperty('name');
      const description = event.feature.getProperty('description');
      const whats = event.feature.getProperty('whats');
      const phone = event.feature.getProperty('phone');
      const position = event.feature.getGeometry().get();
      const content = `
        <h2>${name}</h2><p>${description}</p>
        <p><b>Telefone:</b> ${phone}<br/><b>Whatsapp:</b> ${whats}</p>
      `;
  
      infoWindow.setContent(content);
      infoWindow.setPosition(position);
      infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});
      infoWindow.open(map);
    });


    // Build and add the search bar
    const card = document.createElement('div');
    const titleBar = document.createElement('div');
    const title = document.createElement('div');
    const container = document.createElement('div');
    const input = document.createElement('input');
    const options = {
        types: ['address'],
        componentRestrictions: {country: 'br'},
    };

    card.setAttribute('id', 'pac-card');
    title.setAttribute('id', 'title');
    title.textContent = 'Buscar a loja mais pr\u00f3xima';
    titleBar.appendChild(title);
    container.setAttribute('id', 'pac-container');
    input.setAttribute('id', 'pac-input');
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', 'Insira um endere\u00e7o');
    container.appendChild(input);
    card.appendChild(titleBar);
    card.appendChild(container);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(card);

    // Make the search bar into a Places Autocomplete search bar and select
    // which detail fields should be returned about the place that
    // the user selects from the suggestions.
    const autocomplete = new google.maps.places.Autocomplete(input, options);

    autocomplete.setFields(
        ['address_components', 'geometry', 'name',]);


    // Set the origin point when the user selects an address
    const originMarker = new google.maps.Marker({map: map});
    originMarker.setVisible(false);
    let originLocation = map.getCenter();

    autocomplete.addListener('place_changed', async () => {
        originMarker.setVisible(false);
        originLocation = map.getCenter();
        const place = autocomplete.getPlace();

        if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert('Nenhum endere\u00e7o dispon\u00edvel para entrada: \'' + place.name + '\'');
        return;
        }

        // Recenter the map to the selected address
        originLocation = place.geometry.location;
        map.setCenter(originLocation);
        map.setZoom(13);
        console.log(place);

        originMarker.setPosition(originLocation);
        originMarker.setVisible(true);

        // Use the selected address as the origin to calculate distances
        // to each of the store locations
        const rankedStores = await calculateDistances(map.data, originLocation);
        showStoresList(map.data, rankedStores);

        return;
    });
  }