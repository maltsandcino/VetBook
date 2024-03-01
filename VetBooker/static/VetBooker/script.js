// Fetch data for booking, to see what the soonest availability is based on specialization. This data will be drawn from the django form.
document.addEventListener('DOMContentLoaded', () =>{
    ;
})

function manageCustomer() {
    let managementDiv = document.querySelector("#managementDiv");
    managementDiv.innerHTML = "";
    managementDiv.classList.toggle('notVisible');
    const customerSearch = document.createElement('div')
    customerSearch.innerHTML = `<fieldset><label for="numberSearch">For existing customers, enter their telephone number:</label>
    <input type="text" id="numberSearch" name="numberSearch"> <button id="customerEdit">Search</button>
    </fieldset>`
    managementDiv.append(customerSearch)
    document.getElementById('customerEdit').addEventListener('click', manageCustomerSearch)
}

// function getCookie(name) {
//     const value = `; ${document.cookie}`;
//     const parts = value.split(`; ${name}=`);
//     if (parts.length === 2) return parts.pop().split(';').shift();
// }

function manageCustomerSearch() {
    let clientNumber = document.getElementById('numberSearch').value;
    
    // const csrfToken = getCookie('csrftoken');
 

    fetch('/clientsearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
        },
        body: JSON.stringify({
            number: clientNumber
        })
    })
    .then(response =>{
        if(response.ok) {
            
            return response.json();
        }
        else {
            alert("Customer not found, please review telephone number.");
        }
    })
    .then(data => {
        let managementDiv = document.querySelector("#managementDiv");
        const customerResults = document.createElement('div');
        customerResults.className = 'customerResults'
        customerResults.innerHTML = `<div class='resultsTop' style='text-align:center;'>${data.name}</div> <div name='resultsBigContainer' class='flex-row'> <div id='categories'><p>E-Mail</p><p>Telephone</p><p>Address</p><p>Pets</p></div><div id='results'>${data.email}</p> <p>${data.address}</p> <p>${data.telephone}</p></div> </div>`
        managementDiv.append(customerResults);
        let results = document.getElementById('results');
        const petInfo = data.pets.map((pet) => `${pet.name}: ${pet.species}`);
        results.innerHTML += petInfo.join('<hr>');

     })
}

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