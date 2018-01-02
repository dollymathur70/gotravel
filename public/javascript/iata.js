/**
 * Created by dolly on 9/10/17.
 */

$.getJSON("/flightcodes.js",function (json) {


    let states = [];
    Object.values(codes).forEach(function (value) {
        var obj = {
            city: value.city,
            country: value.country,
            iata: value.iata
        };
        states.push(obj);
    });
    console.log(states);
})



    // $(function () {
    //
    //
    //     var states = [];
    //
    //     $.ajax({
    //         url: './flightcodes.js',
    //         async: false,
    //         dataType: 'json',
    //         success: function (response) {
    //             states = response;
    //             console.log(response);
    //         }
    //
    //
    //     })
    //
    //     console.log(states);
    //
    // });
