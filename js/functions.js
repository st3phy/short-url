window.addEventListener('DOMContentLoaded', (event) => {
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

    document.querySelector('form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get the last ID
        firebase.database().ref('lastId').get().then(function(snapshot) {
            var inputSelect = document.querySelector('[name="url"]');
            var longUrl = inputSelect.value;
            
            try {
                var url = new URL(longUrl);

                if (url.host === window.location.host) {
                    throw new Error('Must be different from this domain');
                }

                if (!url.protocol.match(/https?:/g)) {
                    throw new Error('Protocol must be http or https');
                }

                var nextId = snapshot.val() + 1;

                // Use base 64
                var key = base10ToBase64(nextId);

                // Increment the last ID
                firebase.database().ref('lastId').set(nextId);

                // Store the URL
                database.ref('urls/' + key).set(longUrl);

                inputSelect.value = document.location.href + '#' + key;
                inputSelect.select();
            } catch (e) {
                // Add error message to dom
                inputSelect.classList.remove("text-success");
                inputSelect.classList.add("text-danger");
                inputSelect.value = e.message;

                // On user click, remove errors
                inputSelect.onclick = function(e) {
                    inputSelect.classList.add("text-success");
                    inputSelect.classList.remove("text-danger");
                    inputSelect.value = '';
                }
            }             
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
    
    document.querySelector('[name="url"]').focus();
    checkForHash();
    window.setInterval(checkForHash, 2000);
});