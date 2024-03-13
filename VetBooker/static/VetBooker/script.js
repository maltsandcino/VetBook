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
    document.getElementById('numberSearch').addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          manageCustomerSearch();
        }
    })
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
        if (document.querySelector(".customerResults")){
            customerResults = document.querySelector(".customerResults")
            customerResults.innerHTML = "";
            customerResults.innerHTML = `<div class='resultsTop' style='text-align:left;'><div id="editName">${data.name}</div></div> <div name='resultsBigContainer' class='flex-row'> <div id='categories'><p id="editEmail">E-Mail</p><p id="editTelephone">Telephone</p><p id="editAddress">Address</p><p>Pets</p><button id="editPets">Edit Pets</button></div><div id='results'><div id="containEmail"><p>${data.email}</p></div> <div id="containAddress"><p>${data.address}</p></div> <div id="containTelephone"><p>${data.telephone}</p></div></div> </div>`
            managementDiv.append(customerResults);
            let results = document.getElementById('results');
            const petInfo = data.pets.map((pet) => `<p>${pet.name}: ${pet.species} </p><p class="petList"> <button onclick="remove(${pet.id})">Remove</button> <button onclick="viewBookings(${pet.id})">View Appointments</button></p>`);
            results.innerHTML += petInfo.join('');
            editPetsEvent = document.getElementById('editPets').addEventListener("click", (event) => {remove(data.pets);});
            editNameEvent = document.getElementById('editName').addEventListener("click", (event) => {editUser(data, "name");});
            editTelEvent = document.getElementById('editTelephone').addEventListener("click", (event) => {editUser(data, "telephone");});
            editEmailEvent = document.getElementById('editEmail').addEventListener("click", (event) => {editUser(data, "email");});
            editAddressEvent = document.getElementById('editAddress').addEventListener("click", (event) => {editUser(data, "address");});
        }
        else {
            const customerResults = document.createElement('div');
            customerResults.className = 'customerResults'
            customerResults.innerHTML = `<div class='resultsTop' style='text-align:left;'><div id="editName">${data.name}</div></div> <div name='resultsBigContainer' class='flex-row'> <div id='categories'><p id="editEmail">E-Mail</p><p id="editTelephone">Telephone</p><p id="editAddress">Address</p><p>Pets</p><button id="editPets">Edit Pets</button></div><div id='results'><div id="containEmail"><p id="editEmail">${data.email}</p></div> <div id="containAddress"><p id="editAddress">${data.address}</p></div> <div id="containTelephone"><p id="editTelephone">${data.telephone}</p></div></div> </div>`
            managementDiv.append(customerResults);
            let results = document.getElementById('results');
            const petInfo = data.pets.map((pet) => `<p>${pet.name}: ${pet.species} </p><p class="petList"><button onclick="remove(${pet.id})">Remove</button> <button onclick="viewBookings(${pet.id})">View Appointments</button></p>`);
            results.innerHTML += petInfo.join('');
            editPetsEvent = document.getElementById('editPets').addEventListener("click", (event) => {remove(data.pets);});
            editNameEvent = document.getElementById('editName').addEventListener("click", (event) => {editUser(data, "name");});
            editTelEvent = document.getElementById('editTelephone').addEventListener("click", (event) => {editUser(data, "telephone");});
            editEmailEvent = document.getElementById('editEmail').addEventListener("click", (event) => {editUser(data, "email");});
            editAddressEvent = document.getElementById('editAddress').addEventListener("click", (event) => {editUser(data, "address");});
        }

     })
}

function remove(petid) {
    if (confirm("Are you sure you want to remove this pet? Click OK to confirm removal.") == true){
        
        fetch('/petremoval', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
        },
        body: JSON.stringify({
            id: petid
        })
        })
        .then(response => {
            if(response.ok) {
                
                 return response.json();
            }
             else {
                 alert("Current Pet does not have an owner.");
                 
             }
        })
        .then(data => {
            manageCustomerSearch();
        })
    
    }
    else {
    }
}

function viewBookings(petid){
    console.log(petid)
}

function submitUserEdits(id, value, field){
    fetch('/clientedit', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
    },
    body: JSON.stringify({
        id: id,
        new_value: value,
        field: field
    })
    })
    .then(response => {
        if(response.ok) {
             return response.json();
        }
         else {
             alert("not implemented."); 
         }
    })
    .then(data => {
        manageCustomerSearch();
    })
}

// TO DO: Add functionality for user Tel (don't forget to change THE VALUE in the search box with this one), Email, address

function editUser(data, field) {
    if (field === "name") {
    nameDiv = document.querySelector(".resultsTop")
    nameDiv.innerHTML = `<input id="nameInput" type="text" value="${data.name}" class="clearInput">`
    nameInput = document.getElementById("nameInput")
    nameInput.focus();
    nameInput.setSelectionRange(nameInput.value.length, nameInput.value.length);
    nameInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            submitUserEdits(data.id, nameInput.value, field)
        }
        })
    }
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