// Set the configuration for your app
var config = {
    apiKey: "AIzaSyB-JrTrNyiwG3ujlFAgbfYNO5BIleTa188",
    authDomain: "short-url-ffd96.firebaseapp.com",
    // For databases not in the us-central1 location, databaseURL will be of the
    // form https://[databaseName].[region].firebasedatabase.app.
    // For example, https://your-database-123.europe-west1.firebasedatabase.app
    databaseURL: "https://short-url-ffd96-default-rtdb.europe-west1.firebasedatabase.app/"
};
firebase.initializeApp(config);

// Get a reference to the database service
var database = firebase.database();

document.querySelector('button').addEventListener('click', function(event) {
    // Get the last ID
    firebase.database().ref('lastId').get().then(function(snapshot) {
        var longUrl = document.querySelector('[name="url"]').value;
        var nextId = snapshot.val() + 1;

        // Use base 64
        var key = base10ToBase64(nextId);

        // Increment the last ID
        firebase.database().ref('lastId').set(nextId);

        // Store the URL
        database.ref('urls/' + key).set(longUrl);
    });

});

// Base 10 to base 64 conversion
function base10ToBase64(key) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';
    var base = chars.length;
    var str = '', i;
    while(key) {
        i = key % base;
        key = Math.floor(key / base);
        str = chars.charAt(i) + str;
    }
    return str;
}

// Check for hash in url
function checkForHash(){
    // Remove # from hash
    var hash = window.location.hash.substring(1);

    if("" !== hash){
        firebase.database().ref(`urls/${hash}`).get().then(function(snapshot) {
            // Searh for long url in database
            var longUrl = snapshot.val();
    
            // If exists, redirect
            window.location = 'string' === typeof longUrl && longUrl.match(/^https?:\/\//g)
                ? longUrl 
                : "http://localhost/short-url/main.html";
        });
    }   
}

checkForHash();
window.setInterval(checkForHash, 2000);

