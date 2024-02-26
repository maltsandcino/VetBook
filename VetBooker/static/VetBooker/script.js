// Fetch data for booking, to see what the soonest availability is based on specialization. This data will be drawn from the django form.

function submitBooking() {
  
    let data_body = document.querySelector(`#Pet Name${id}`).value;
    
    fetch('/book', {
        method: 'POST',
        body: JSON.stringify({
            body: data_body,
            post: postid
        })
    })
    .then(response => {
        if(response.ok) {
            
             return response.json();
        }
         else {
             alert("Please choose a different appointment date");
             
         }
    })
}