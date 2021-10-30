function route() {
    let hashTag = window.location.hash;
    let pageID = hashTag.replace("#/", "");

    if(!pageID) {
        navToPage("home");
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

function initListeners() {
    $(window).on("hashchange", route);
    route();
}

$(document).ready(function() {
    initListeners();
    //navToPage("home");
    
});