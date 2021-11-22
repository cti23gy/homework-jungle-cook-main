var loggedIn = false;
var ingredCounter = 3;
var instrCounter = 3;
var recipeType = 0;

var curRecipe = 0;

var User = {
    firstname: "",
    lastname: "",
    fullname: "",
    email: "cti23gy@gmail.com"
};

var USER_RECIPES = [
];

function route() {
    let hashTag = window.location.hash;
    let pageID = hashTag.replace("#/", "");

    if(!pageID) { //default
        navToPage("home");
    } else if (pageID == "loginfire") { //login buttons
        login();
        navToPage("loginpage");
    } else if (pageID == "signupfire") {
        createUser();
        navToPage("loginpage");
    } else if (pageID == "signoutfire") {
        signOut();
        navToPage("loginpage");
    }else if (pageID == "createnewrecipe") { //new recipes
        createNewRecipe();
        navToPage("yourrecipe");
    } else if (pageID == "viewrecipe") { //specific recipe page
        //loadCurrentRecipe() happens with onclick
        navToPage("viewrecipe");
    } else if (pageID == "edit") { //recipe edit buttons
        editRecipe();
        navToPage("yourrecipe");
    }else if (pageID == "delete") {
        //deleteRecipe() happens with onclick
        navToPage("yourrecipe");
    }
    else {
        navToPage(pageID);
    }
}

function navToPage(pageName) {
    $.get(`pages/${pageName}/${pageName}.html`, function(data) {
        //console.log(data);
        $("#app").html(data);
        if(loggedIn) {
            $(".recipe_option").css("display", "block");
            $(".navlogin").css("display", "none");
            $(".navsignout").css("display", "block");
        } else {
            $(".recipe_option").css("display", "none");
            $(".navlogin").css("display", "block");
            $(".navsignout").css("display", "none");
        }
        if (pageName == "yourrecipe") {
            loadUserRecipes();
        } else {
            loadPublicRecipes();
        }

        if((pageName == "viewrecipe" || pageName == "editrecipe") && recipeType == 1) {
            loadCurrentRecipeUser();
        } else {
            loadCurrentRecipePublic();
        }
    });
}

////////////////////Firebase Code Start!

function initFirebase() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            //user is signed in get information
            console.log("connected");

            firebase.auth().currentUser.updateProfile({
                displayName: User.fullname,
            })
            .then(() => {
                // Update successful
                updateSiteWithInfo();
                // ...
              }).catch((error) => {
                // An error occurred
                // ...
            });  
            loggedIn = true;
            $(".recipe_option").css("display", "block");
            $(".navlogin").css("display", "none");
            $(".navsignout").css("display", "block");
            $(".pname").css("display", "block");
            $(".pname").html(User.email);
            loadUserRecipes();
        } else {
            console.log("user is not there");
            loggedIn = false;
            $(".recipe_option").css("display", "none");
            $(".navlogin").css("display", "block");
            $(".navsignout").css("display", "none");
            $(".pname").css("display", "none");
            loadPublicRecipes();
        }
    });
}

function createUser() {
    let password = $("#c_password").val();
    let email = $("#c_email").val();
    User.firstname = $("#c_firstname").val();
    User.lastname = $("#c_lastname").val();

    User.fullname = User.firstname + " " + User.lastname;
    User.email = email;

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

    User.email = email;
    
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

////////////////////Firebase Code End!


////////////////////Display Information Code Start!

function updateSiteWithInfo() {
    let user = firebase.auth().currentUser;
    $(".pname").html(user.displayName);
}

function loadUserRecipes() { 
    $("#recipe").empty();
        $.each(USER_RECIPES, function(index, recipe) {
            $("#recipe").append(`
            <div class="recipeblock">
                <img class="image" src="${recipe.image}"/>
                <a class="view_button" href="#/viewrecipe" onclick="setRecipe(${index}, 1)">View</a>
                
                <a class="edit_button" href="#/editrecipe" onclick="editRecipeSetUp(${index}, 1)">Edit Recipe</a>
                <a class="delete_button" href="#/delete" onclick="deleteRecipe(${index})">Delete</a>
                
                <div class="content">
                    <h3>${recipe.recipename}</h3>
                    <div class="line"></div>
                    <p>${recipe.description}</p>
                    <div class="content-ex"><img class="icon-timer" src="../images/time.svg"/><h4>${recipe.timer}</h4></div>
                    <div class="content-ex"><img class="icon-serving" src="../images/servings.svg"/><h4>${recipe.servings} servings</h4></div>
                </div>
            </div>
            `);
        });
    
}

function loadPublicRecipes() {
    $("#recipe").empty();
    $.getJSON("data/data.json", function(recipes) {
        $.each(recipes.PUBLIC_RECIPES, function(index, recipe) {
            $("#recipe").append(`
            <div class="recipeblock">
                <img class="image" src="${recipe.image}"/>
                <a class="view_button" href="#/viewrecipe" onclick="setRecipe(${index}, 0)">View</a>
                <div class="content">
                    <h3>${recipe.recipename}</h3>
                    <div class="line"></div>
                    <p>${recipe.description}</p>
                    <div class="content-ex"><img class="icon-timer" src="../images/time.svg"/><h4>${recipe.timer}</h4></div>
                    <div class="content-ex"><img class="icon-serving" src="../images/servings.svg"/><h4>${recipe.servings} servings</h4></div>
                </div>
            </div>
            `);
        });
    })
    .fail(function(jqxhr, textStatus, error) {
        console.log(jqxhr);
        console.log(textStatus);
        console.log(error);
    });
}

function setRecipe(id, type) {
    curRecipe = id;
    if (type == 1) {
        recipeType = 1;
    } else {
        recipeType = 0;
    }
}

function loadCurrentRecipeUser() {
    var ingredlist = ``;
    var instrulist = ``;
    $.each(USER_RECIPES, function(index, recipe) {
        if (index == curRecipe) {
            $.each(recipe.ingredientslist, function(i, ingred) {
                ingredlist += `<p>${ingred}</p>`;
            });
            $.each(recipe.instructionslist, function(i, instru) {
                instrulist += `<p>${i+1}. ${instru}</p>`;
            });
            $("#viewwindow").append(`
            <div class="recipeblock">
            <h2>${recipe.recipename}</h2>
                <img class="image" src="${recipe.image}"/>
                <div class="content">
                    <h3>Description:</h3>
                    <p>${recipe.description}</p>
                    <h3>Total Time:</h3>
                    <p>${recipe.timer}</p>
                    <h3>Servings:</h3>
                    <p>${recipe.servings} servings</p>
                </div>
            </div>
            <div class="listcontent">
                <h3>Ingredients:</h3>
                ${ingredlist}
                <h3>Instructions:</h3>
                ${instrulist}
                <a class="edit_button" href="#/editrecipe">Edit Recipe</a>
            </div>
            `);
        }
    });
}

function loadCurrentRecipePublic() {
    $("#viewwindow").empty();
    $.getJSON("data/data.json", function(recipes) {
        var ingredlist = ``;
        var instrulist = ``;
        $.each(recipes.PUBLIC_RECIPES, function(index, recipe) {
            if (index == curRecipe) {
                $.each(recipe.ingredientslist, function(i, ingred) {
                    ingredlist += `<p>${ingred}</p>`;
                });
                $.each(recipe.instructionslist, function(i, instru) {
                    instrulist += `<p>${i+1}. ${instru}</p>`;
                });
                $("#viewwindow").append(`
                <div class="recipeblock">
                <h2>${recipe.recipename}</h2>
                    <img class="image" src="${recipe.image}"/>
                    <div class="content">
                        <h3>Description:</h3>
                        <p>${recipe.description}</p>
                        <h3>Total Time:</h3>
                        <p>${recipe.timer}</p>
                        <h3>Servings:</h3>
                        <p>${recipe.servings} servings</p>
                    </div>
                </div>
                <div class="listcontent">
                    <h3>Ingredients:</h3>
                    ${ingredlist}
                    <h3>Instructions:</h3>
                    ${instrulist}
                </div>
                `);
            }
        });
    })
    .fail(function(jqxhr, textStatus, error) {
        console.log(jqxhr);
        console.log(textStatus);
        console.log(error);
    });
    //navToPage("viewrecipe");
}

////////////////////Display Information Code End!

function addIngred(e) {
    ingredCounter++;
    $(".form1").append(`<input id="ind${ingredCounter}" type="text" placeholder="Ingredient ${ingredCounter}" />`);
    $(".form1").append(`<div class="line"></div>`);
}

function addInstr(e) {
    instrCounter++;
    $(".form2").append(`<input id="ins${instrCounter}" type="text" placeholder="Instruction ${instrCounter}" />`);
    $(".form2").append(`<div class="line"></div>`);
}

function createNewRecipe() {
    let addRecipeImage = $("#add-recipe-image").val();
    let addRecipeName = $("#add-recipe-name").val();
    let addRecipeDesc = $("#add-recipe-desc").val();
    let addTotalTime = $("#add-total-time").val();
    let addServingSize = $("#add-serving-size").val();

    let ingredArray = [];
    let instrArray = [];

    for (let i = 0; i < ingredCounter; i++) {
        ingredArray[i] = $(`#ind${i+1}`).val()
    }
    for (let i = 0; i < instrCounter; i++) {
        instrArray[i] = $(`#ins${i+1}`).val()
    }
    //console.log(addRecipeImage, addRecipeName, addRecipeDesc, addTotalTime, addServingSize);
    //console.log(ingredArray, instrArray);
    
    console.log(USER_RECIPES);
    USER_RECIPES.push({
        recipename: addRecipeName,
        description: addRecipeDesc,
        timer: addTotalTime,
        servings: addServingSize,
        image: addRecipeImage,
        ingredientslist: ingredArray,
        instructionslist: instrArray
    });
    console.log(USER_RECIPES);
}

function editRecipeSetUp(id, type) {
    setRecipe(id, type);

    console.log(USER_RECIPES[id].recipename);
    $("#add-recipe-image").val(USER_RECIPES[id].image);
    $("#add-recipe-name").val(USER_RECIPES[id].recipename);
    $("#add-recipe-desc").val(USER_RECIPES[id].description);
    $("#add-total-time").val(USER_RECIPES[id].timer);
    $("#add-serving-size").val(USER_RECIPES[id].servings);

    for (let i = 0; i < ingredCounter; i++) {
        $(`#ind${i+1}`).val(USER_RECIPES[id].ingredientslist[i]);
    }
    for (let i = 0; i < instrCounter; i++) {
        $(`#ins${i+1}`).val(USER_RECIPES[id].instructionslist[i]);
    }
}

function editRecipe() {
    let addRecipeImage = $("#add-recipe-image").val();
    let addRecipeName = $("#add-recipe-name").val();
    let addRecipeDesc = $("#add-recipe-desc").val();
    let addTotalTime = $("#add-total-time").val();
    let addServingSize = $("#add-serving-size").val();

    let ingredArray = [];
    let instrArray = [];

    for (let i = 0; i < ingredCounter; i++) {
        ingredArray[i] = $(`#ind${i+1}`).val()
    }
    for (let i = 0; i < instrCounter; i++) {
        instrArray[i] = $(`#ins${i+1}`).val()
    }
    //console.log(addRecipeImage, addRecipeName, addRecipeDesc, addTotalTime, addServingSize);
    //console.log(ingredArray, instrArray);
    
    console.log(USER_RECIPES);
    USER_RECIPES[curRecipe] = ({
        recipename: addRecipeName,
        description: addRecipeDesc,
        timer: addTotalTime,
        servings: addServingSize,
        image: addRecipeImage,
        ingredientslist: ingredArray,
        instructionslist: instrArray
    });
    console.log(USER_RECIPES);
}

function deleteRecipe(id) {
    USER_RECIPES.splice(id, 1);
    navToPage("yourrecipe");
}

function initListeners() {
    $(window).on("hashchange", route);
    route();
}

$(document).ready(function() {
    //navToPage("home");
    try {
        let app = firebase.app();
        initListeners();
        initFirebase();
    } catch {
        console.error(e);
    }
    
});