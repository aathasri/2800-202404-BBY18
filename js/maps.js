function initMap() {
  const mapOptions = {
    zoom: 15,
    center: { lat: 0, lng: 0 },
  };

  const map = new google.maps.Map(document.getElementById('map'), mapOptions);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map.setCenter(userLocation);

        const marker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'Your Location',
        });
      },
      () => {
        handleLocationError(true, map.getCenter());
      }
    );
  } else {
    handleLocationError(false, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, pos) {
  const infoWindow = new google.maps.InfoWindow({
    map: map,
    position: pos,
    content: browserHasGeolocation
      ? 'Error: The Geolocation service failed.'
      : 'Error: Your browser doesn\'t support geolocation.',
  });
}
