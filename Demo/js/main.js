// ===================================================================================
//                Control some main settings for the site here
// ===================================================================================

$(document).ready(function() {
    var menu = $('.navbar-wrapper');
    ul = menu.find('ul');

    $('#wrapper .post').each(function(e) {
        var height = Math.floor((Math.random() * 300) + 100);
        if ($(this).attr('id') == '') {
            ul.append('<li><a href="#post_content_' + e + '"> Link for id: ' + e + '</a></li>');
            $(this).html('This id is: ' + e).height(height).attr('id', 'post_content_' + e);
        } else {
            $(this).html('This id is: ' + $(this).attr('id')).height(height);
        }

    });

    // Pins the menu
    menu.stickUp();
    // Activates classes on scroll.
    menu.scrollActive({
        scanItems: '.post'
    });
});