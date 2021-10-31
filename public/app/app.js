
function route() {
    let hashTag = window.location.hash;
    let pageID = hashTag.replace("#/", "");

    

    if(!pageID) {
        navToPage("home");
    } else if (pageID == "loginfire") {
        login();
        navToPage("loginpage");
    } else if (pageID == "signupfire") {
        createUser();
        navToPage("loginpage");
    } else if (pageID == "signoutfire") {
        signOut();
        navToPage("loginpage");
    } else {
        navToPage(pageID);
    }

}

function navToPage(pageName) {
    $.get(`pages/${pageName}/${pageName}.html`, function(data) {
        console.log(data);
        $("#app").html(data);
    });
}

///////////

function initFirebase() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            //user is signed in get information
            console.log("connected");
            $(".recipe_option").css("display", "block");
            $(".navlogin").css("display", "none");
            $(".navsignout").css("display", "block");
        } else {
            console.log("user is not there");
            $(".recipe_option").css("display", "none");
            $(".navlogin").css("display", "block");
            $(".navsignout").css("display", "none");
        }
    });
}

function createUser() {
    let password = $("#c_password").val();
    let email = $("#c_email").val();
    let firstname = $("#c_firstname").val();
    let lastname = $("#c_lastname").val();

    console.log(password);
    console.log(email);
    console.log(firstname);
    console.log(lastname);



    firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in 
            var user = userCredential.user;
            console.log(user);
            // ...
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorMessage);
            // ..
        });
}

function login() {
    let password = $("#l_password").val();
    let email = $("#l_email").val();
    firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      var user = userCredential.user;
      console.log("signed in");
      // ...
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorMessage);
    });
}

function signOut() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("signed out")
      }).catch((error) => {
        // An error happened.
        console.log(error);
      });
}


/////////////

function initListeners() {
    $(window).on("hashchange", route);
    route();

}

$(document).ready(function() {
    //initListeners();
    //navToPage("home");


    try {
        let app = firebase.app();
        initFirebase();
        initListeners();
    } catch {
        console.error(e);
    }
    
});