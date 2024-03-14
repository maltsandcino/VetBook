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
    document.getElementById('numberSearch').focus()
    document.getElementById('customerEdit').addEventListener('click', () => {manageCustomerSearch()})
    document.getElementById('numberSearch').addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          manageCustomerSearch();
        }
    })
}

function manageCustomerSearch(args) {
    
    if(!document.getElementById("managePets").classList.contains("notVisible")){
        document.getElementById("managePets").classList.toggle("notVisible")
    }
    let clientNumber = document.getElementById('numberSearch').value;
    
    if (args) {
        clientNumber = args
    }

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
            customerResults.innerHTML = `<div class='resultsTop' style='text-align:left;'><div id="editName">${data.name}</div></div> <div name='resultsBigContainer' class='flex-row'> <div id='categories'><p id="editEmail">E-Mail</p><p id="editAddress">Address</p><p id="editTelephone">Telephone</p><p>Pets</p><button id="editPets">Edit Pets</button></div><div id='results'><div id="containEmail"><p>${data.email}</p></div> <div id="containAddress"><p>${data.address}</p></div> <div id="containTelephone"><p>${data.telephone}</p></div></div> </div>`
            managementDiv.append(customerResults);
            let results = document.getElementById('results');
            const petInfo = data.pets.map((pet) => `<p>${pet.name}: ${pet.species} </p><p class="petList"> <button onclick="remove(${pet.id})">Remove</button> <button onclick="viewBookings(${pet.id})">View Appointments</button></p>`);
            results.innerHTML += petInfo.join('');
            editPetsEvent = document.getElementById('editPets').addEventListener("click", (event) => {showPetsModal(data);});
            editNameEvent = document.getElementById('editName').addEventListener("click", (event) => {editUser(data, "name");});
            editTelEvent = document.getElementById('editTelephone').addEventListener("click", (event) => {editUser(data, "telephone");});
            editEmailEvent = document.getElementById('editEmail').addEventListener("click", (event) => {editUser(data, "email");});
            editAddressEvent = document.getElementById('editAddress').addEventListener("click", (event) => {editUser(data, "address");});
        }
        else {
            const customerResults = document.createElement('div');
            customerResults.className = 'customerResults'
            customerResults.innerHTML = `<div class='resultsTop' style='text-align:left;'><div id="editName">${data.name}</div></div> <div name='resultsBigContainer' class='flex-row'> <div id='categories'><p id="editEmail">E-Mail</p><p id="editAddress">Address</p><p id="editTelephone">Telephone</p><p>Pets</p><button id="editPets">Edit Pets</button></div><div id='results'><div id="containEmail"><p id="editEmail">${data.email}</p></div> <div id="containAddress"><p id="editAddress">${data.address}</p></div> <div id="containTelephone"><p id="editTelephone">${data.telephone}</p></div></div> </div>`
            managementDiv.append(customerResults);
            let results = document.getElementById('results');
            const petInfo = data.pets.map((pet) => `<p>${pet.name}: ${pet.species} </p><p class="petList"><button onclick="remove(${pet.id})">Remove</button> <button onclick="viewBookings(${pet.id})">View Appointments</button></p>`);
            results.innerHTML += petInfo.join('');
            editPetsEvent = document.getElementById('editPets').addEventListener("click", (event) => {showPetsModal(data);});
            editNameEvent = document.getElementById('editName').addEventListener("click", (event) => {editUser(data, "name");});
            editTelEvent = document.getElementById('editTelephone').addEventListener("click", (event) => {editUser(data, "telephone");});
            editEmailEvent = document.getElementById('editEmail').addEventListener("click", (event) => {editUser(data, "email");});
            editAddressEvent = document.getElementById('editAddress').addEventListener("click", (event) => {editUser(data, "address");});
        }

     })
}
function showPetsModal(data) {
    document.getElementById("managePets").classList.toggle('notVisible');
    document.getElementById("addExisting").addEventListener('click', (event) => {getExistingPet(data)});
    document.getElementById("createNew").addEventListener('click', (event) => {addNewPet(data)});
}

function getExistingPet(data){
    user_id = data.id
    fetch('/petSearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
        },
        body: JSON.stringify({
            owner: "None"
        })
    })
    .then(response =>{
        if(response.ok) {
            
            return response.json();
        }
        else {
            alert("No unowned Pets found in Database");
        }
    })
    //Create dropdown menu with exant pets
    .then(data => {
        // console.log(data.options)
        for (let pet of data.options){
            console.log(pet.name)
        }
            
        // console.log(data)
    const existingPets = document.createElement('div');
    existingPets.classList = "flex-center-wrap"
    existingPets.innerHTML = `<div class="hundredW"><select class="marginAuto" name="petSelect" id="petSelect"></select></div>`;
    existingPets.innerHTML += document.getElementById("managePets").innerHTML;
    document.getElementById("managePets").innerHTML = "";
    document.getElementById("managePets").append(existingPets);
    
    data.options.forEach(option => {
        console.log(option.name)
        const object = document.createElement('option');
        object.value = option.id;
        object.textContent = option.name;
        selectList = document.getElementById("petSelect")
        console.log(selectList)
        selectList.appendChild(object)
        
    });

    
})
}

function addNewPet(data){
    console.log(data)
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
        if (field === "telephone"){
            manageCustomerSearch(value)
        }
        else{
        manageCustomerSearch();}
    })
}

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
    else if (field === "telephone") {
        telDiv = document.querySelector("#containTelephone")
        telDiv.innerHTML = `<input id="telInput" type="text" value="${data.telephone}" class="clearInput">`
        telInput = document.getElementById("telInput")
        telInput.focus();
        telInput.setSelectionRange(telInput.value.length, telInput.value.length);
        telInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                submitUserEdits(data.id, telInput.value, field)
            }
            })
        }
        else if (field === "email") {
            emailDiv = document.querySelector("#containEmail")
            emailDiv.innerHTML = `<input id="emailInput" type="text" value="${data.email}" class="clearInput">`
            emailInput = document.getElementById("emailInput")
            emailInput.focus();
            emailInput.setSelectionRange(emailInput.value.length, emailInput.value.length);
            emailInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    submitUserEdits(data.id, emailInput.value, field)
                }
                })
            }
            else if (field === "address") {
                addressDiv = document.querySelector("#containAddress")
                addressDiv.innerHTML = `<input id="addressInput" type="text" value="${data.address}" class="clearInput">`
                addressInput = document.getElementById("addressInput")
                addressInput.focus();
                addressInput.setSelectionRange(addressInput.value.length, addressInput.value.length);
                addressInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        submitUserEdits(data.id, addressInput.value, field)
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