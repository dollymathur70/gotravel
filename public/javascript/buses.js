/**
 * Created by dolly on 27/8/17.
 */

$(function () {

    $('.datepicker').datepicker({
        dateFormat : 'dd/mm/yyyy'
    });

    $("#checkbuses").click(function () {

        console.log($('#origin').val());
        console.log($('#destination').val());
        console.log($('#checkindate').val());
        console.log($('#checkoutdate').val());

        if($('#origin').val() === "" || $('#destination').val() === "" || $('#checkindate').val() === ""){
            window.alert("Fill complete details");
            return;
        }

        var m1 = $('#checkindate').val().substring(0,2);
        var d1 = $('#checkindate').val().substring(3,5);
        var y1 = $('#checkindate').val().substring(6,10);

        var m2 = $('#checkoutdate').val().substring(0,2);
        var d2 = $('#checkoutdate').val().substring(3,5);
        var y2 = $('#checkoutdate').val().substring(6,10);

        checkin = y1+m1+d1;

        checkout = y2+m2+d2;

        console.log(checkin);
        console.log(checkout);

        if(checkout === 'undefined'){
            console.log(1);
            window.location.href = "/showbuses?o="+ $("#origin").val() +
                "&d=" +  $("#destination").val() +
                "&ci=" + checkin;
        }

        else {

            console.log(2);
            window.location.href = "/showbuses?o=" + $("#origin").val() +
                "&d=" + $("#destination").val() +
                "&ci=" + checkin +
                "&co=" + checkout;

        }
    })

});