// getting places from APIs
function loadPlaces(position) {
    const params = {
        radius: 300,    // search places not farther than this value (in meters)
        clientId: 'LKIVYXOAL2SY3YPZOVIP53RASXZCQVDB1THBGRKJAQXHBIZI',
        clientSecret: 'HQOIPXLLVZ1EMY0WUEXNJBXWLUIA3VTKJUDGI1HIUW3CT3WC',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API (limit param: number of maximum places to fetch)
    const endpoint = `https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=30 
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};


/**
 * converts a XYZ vector3 to longitude latitude (Direct Polar)
 * @param lng longitude
 * @param lat latitude
 * @param vector3 optional output vector3
 * @returns a unit vector of the 3d position
 */
function lonLatToVector3( lng, lat )
{
    out = out || new THREE.Vector3();

    //flips the Y axis
    lat = Math.PI / 2 - lat;

    return [
        Math.sin( lat ) * Math.sin( lng ),
        Math.cos( lat ),
        Math.sin( lat ) * Math.cos( lng )
    ];

}

window.onload = () => {
    const scene = document.querySelector('a-scene');

    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {
        alert(position.coords.latitude + " " + position.coords.longitude)
        var val = lonLatToVector3(position.coords.longitude, position.coords.latitude)
        console.log(val)
        alert(val)
        // than use it to load from remote APIs some places nearby
        loadPlaces(position.coords)
            .then((places) => {
                places.forEach((place) => {
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;
                    // alert("places.count" + longitude + " " + longitude);
                    console.log(longitude, latitude)
                    // add place name
                    const placeText = document.createElement('a-link');
                    placeText.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                    placeText.setAttribute('title', place.name);
                    placeText.setAttribute('scale', '15 15 15');
                    
                    placeText.addEventListener('loaded', () => {
                        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
                    });

                    scene.appendChild(placeText);
                });
            })
    },
        (err) => console.error('Error in retrieving position', err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};