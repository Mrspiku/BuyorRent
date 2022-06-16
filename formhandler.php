<? php
$name = $_POST['name'];
$email_id = $_POST['email'];
$city = $_POST['city'];
$message = $_POST['message'];


$email_from ='priyanka96325@gmail.com';
$email_subject = 'New visitor';
$email_body = "User Name: $name.\n".
               "User Name: $email_id.\n".
               "User Name: $city.\n".
               "User Name: $message.\n";


$to = 'priyanka96325@gmail.com';


$headers ="From: $email_from \r\n";    //  \r is carriage return  

$headers .="Reply-To: $email_id \r\n";


mail($to, $email_subject,$email_body,$headers);
header("Location: contact.html");
?>
