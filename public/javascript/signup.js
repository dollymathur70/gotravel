/**
 * Created by dolly on 1/10/17.
 */
$(function () {

    $('#submit').click(function () {

        if($('#emailid').val().indexOf('@') == -1){
            window.alert("incorrect email-id");
            return;
        }

        var str=$('#setpassword').val();
        if(str.length<8){
                window.alert("Password too short");
                return;
        }

        if($('#setpassword').val() != $('#reenterpassword').val()){
            window.alert("password doesn't match");
            return;
        }
        $.get('/presentemail',{
            e : $('#emailid').val()
        },function (info) {

            if(info.success == false){
                window.alert("Account from this e-mail id already exists");
                $('.form')[0].reset();
                return;

            }
            else{
                $.post('/submit',{
                    f : $('#firstname').val(),
                    l : $('#lastname').val(),
                    e : $('#emailid').val(),
                    p : $('#setpassword').val()

                },function (info) {
                    window.location.href = "/profile?emailid=" + $('#emailid').val();
                    $('.form')[0].reset();

                });

            }

        });

    });

    $('#login').click(function () {
        console.log("hello dolly");
        console.log($('#signedinemailid').val())
        console.log($('#signedinpassword').val())
        $.post('/login', {
            username: $('#signedinemailid').val(),
            password: $('#signedinpassword').val()
        }).done(function (data) {
            if(data.success == true) {
                window.location.href = "/profile?f=" + data.f + "&l=" + data.l;
            }
            else{
                window.alert("Wrong emailid or password");
            }

        }).fail(function () {
            console.log(2);
        })
    })

});
