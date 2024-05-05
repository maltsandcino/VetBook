
document.addEventListener('DOMContentLoaded', () =>{
    if (document.getElementById("medicalDomainSelect")){
    document.getElementById("medicalDomainSelect").addEventListener('click', () => {doctorSelect()})
    ;}
    if (document.getElementById("customDay")){
        document.getElementById("customDay").addEventListener('click', () => {customDoctorSelect()})
    }
    if (document.getElementById("selectClient")){
        document.getElementById("selectClient").addEventListener('click', () => {bookingClient()});
        document.getElementById('bookingPhonenumber').addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              bookingClient();
            }
        })
    }
})


//TODO: Refactor below with more parameters from the Modal Div function, will pass the information directly from Modal Function no need to find it all from scratch here.
async function submitBooking(telephone, pet, date, time, doctor, length, note){

    console.log(telephone, pet, date, time, doctor, length, note)
    
    // let response = await fetch('/addappointment', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'X-CSRFToken': `${document.cookie.split('=').pop()}`
    //     },
    //     body: JSON.stringify({
    //         number: clientTel,
    //         doctorID: doctor,
    //         date: day,
    //         notes: note,
    //         petID: pet,
    //         duration: length
    //     })
    // });
    // try {const result = await response.json();
    // console.log(result)}
    // catch (error) {
    //     console.log("Error")
    // }
}

//Todo: Place information into the <p> Elements, add event listener + helper function to add and remove event listener from buttons, also make div visible and not visible here.
//Todo: Complete validation of selected TIME, if it's not numeric (i.e. they havent chosen a time, its the default (and disabled) date) then this needs to trigger some kind of warning on the page
function confirmationDiv(clicked){

    let position = clicked.dataset.value;
    let date = clicked.id;
    let doctor = document.querySelector(".selected").innerHTML;
    let doctorID = document.getElementById(`date_${position}`).dataset.value;
    let clientTel = document.getElementById("bookingPhonenumber").value.replace(/\s/g, '');
    let note = document.getElementById("clientNotes").value;
    let lengthValue = parseInt(document.getElementById("durationSelector").value);
    let time = document.getElementById(`date_${position}`).value;
    let petSelect = document.getElementById("petSelect");
    let petOption = petSelect.options[petSelect.selectedIndex];
    let petName = petOption.value.split(":")[0]
    let pet = petOption.dataset.pet;
    let length = "NaN"
    

    switch (lengthValue) {
        case 0:
            length = "15 Minutes"
            break;
        case 1:
            length = "30 Minutes"
            break;
        case 2:
            length = "60 Minutes"
            break;
        case 3:
            length = "120 Minutes"
            break;
    }

    if(isNaN(time[0])){
        alert("Please select a valid timeslot.")
        return false
    }
    
    let bg = document.getElementById("bg")
    bg.classList.toggle("bg")
    let modalDiv = document.getElementById("confirmationModal")
    let modalTitle = document.getElementById("modalTitle")
    let modalName = document.getElementById("modalPet")
    let modalDoctor = document.getElementById("modalDoctor")
    let modalDay = document.getElementById("modalDay")
    let modalTime = document.getElementById("modalTime")
    let modalDuration = document.getElementById("modalDuration")
    let modalNote = document.getElementById("modalNote")
    
    modalTitle.innerHTML = `Appointment Confirmation for <i>${petName}</i>`
    modalName.innerHTML = `${petName}`
    modalDoctor.innerHTML = `${doctor}`
    modalDay.innerHTML = `${date}`
    modalTime.innerHTML = `${time}`
    modalDuration.innerHTML = `${length}`
    modalNote.innerHTML = `${note}`
    
    modalDiv.classList.toggle("notVisible")
    date = date.split(",").pop()
    date = date[7] + date[8] + date[9] + date[10] + date[3] + date[4] + date[5] + date[3] + date[1] + date[2]
    console.log(date)
    // telephone, pet, date, time, doctor, length, note
    document.getElementById("confirm").addEventListener('click', submitBooking(clientTel, pet, date, time, doctorID, lengthValue, note))
    

}

function closeModal() {
    let bg = document.getElementById("bg")
    bg.classList.toggle("bg")
    let modalDiv = document.getElementById("confirmationModal")
    modalDiv.classList.toggle("notVisible")
}


function enableSearch() {
    document.getElementById("bookingPhonenumber").disabled = false;
    document.getElementById("selectClient").disabled = false;
    document.getElementById("bookingPhonenumber").value = "";
    document.getElementById("bookingPhonenumber").focus()
    let clientDiv = document.getElementById('clientInformation')
    let paginationDiv = document.getElementById('paginationDiv')
    let doctorDiv = document.getElementById('doctorList')
    let appList = document.getElementById('appointmentList')
    let pDiv = document.getElementById('pDiv')
            
    if (!clientDiv.classList.contains("notVisible")){
        clientDiv.classList.toggle("notVisible")
    }
    if (!paginationDiv.classList.toggle("notVisible")){
        paginationDiv.classList.toggle("notVisible")
    }
    if (!doctorDiv.classList.contains("notVisible")){
        doctorDiv.classList.toggle("notVisible")
    }
    if (!appList.classList.contains("notVisible")){
        appList.classList.toggle("notVisible")   
    }

    if (!pDiv.classList.contains("notVisible")){
        pDiv.classList.toggle("notVisible")   
    }

    document.getElementById("clientNotes").value = "";
}

function bookingClient() {
    let clientTel = document.getElementById("bookingPhonenumber").value.replace(/\s/g, '')

    fetch('/clientsearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
        },
        body: JSON.stringify({
            number: clientTel
        })
    })
    .then(response =>{
        if(response.ok) {
            
            return response.json();
        }
        else {
            alert("Customer not found, please review telephone number.");
            let clientDiv = document.getElementById('clientInformation')
            if (!clientDiv.classList.contains("notVisible")){
                clientDiv.classList.toggle("notVisible")
            }
            return { then: function() {} }
        }
    })
    .then(data => {
        document.getElementById("selectClient").disabled = true;
        document.getElementById("bookingPhonenumber").disabled = true;
      
        let petSelector = document.getElementById('petSelect');
        petSelector.innerHTML = ""
        const petInfo = data.pets.map((pet) => `<option data-pet="${pet.id}" data-owner="${data.id}">${pet.name}: ${pet.species} </option>`);
        
        petSelector.innerHTML += petInfo.join('');
        petSelector.dataset.owner = data.id
        document.getElementById('customerName').innerHTML = `${data.name}`
        //
        document.getElementById('petSelect').value.split(':')[0]
        let clientDiv = document.getElementById('clientInformation')
        clientDiv.classList.toggle("notVisible")
    })

}

function paginate(direction){
    if(direction === "right"){
        end = document.getElementById("date_6")
        doctor = end.dataset.value
        day = end.dataset.paginator
        
        appointmentSearch(doctor, day)
    }
    if(direction === "left"){
        end = document.getElementById("date_0")
        doctor = end.dataset.value
        day = end.dataset.paginator
        
        appointmentSearch(doctor, day, "left")
    }
//to do: grab date from last box, queue from server for dates forwand and backward
//to do: ensure that there is a (hidden) area holding doctor ID and procedure length in the other function in order to ensure I have the correct ID and length to pass to backend
//to do: eventually use some css styling and JS to ensure that the selected doctor div is highlighted so users are positive which dr they are booking for
}

function customDoctorSelect() {
    
    if (!document.getElementById("doctorList").classList.contains("notVisible")){
    document.getElementById("doctorList").classList.toggle("notVisible")
    document.getElementById("appointmentList").innerHTML = ""
    document.getElementById("appointmentList").classList.toggle("notVisible")
    document.getElementById("pDiv").classList.toggle("notVisible")}
    
    date = document.getElementById("customInput").value
    vet = document.getElementById("customMedicalDomainSelector").value
    length = document.getElementById("customDurationSelector").value
    customDiv = document.getElementById("customAppointment")

    fetch('/customTimes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
        },
        body: JSON.stringify({
            doctorID: vet,
            duration: length,
            day: date
        })
    })
    .then(response =>{
        if(response.ok) {
            
            return response.json();
        }
        else {
            alert("Clinic is closed on Sundays, please choose a different day for your appointment.")
            //This could be turned into a div or other message to warn the user instead of an alert.
        }
    })
    .then(data => {
        if(data){
            document.getElementById("customAppointment").classList.toggle("notVisible")
            customDiv.innerHTML = ""
            const objectArray = Object.keys(data);
            dateValue = objectArray[0]
            
            for(key of objectArray){
                const selector = document.createElement("select")
                selector.innerHTML = selector.innerHTML + `<option disabled selected>${key}</option>`
            
                for (value of data[key]){
                    selector.innerHTML = selector.innerHTML + `<option>${value}</option>`
                }
                
                customDiv.innerHTML = customDiv.innerHTML + `<div class='flex-column'><select data-value="${vet}" data-paginator="${dateValue}">${selector.innerHTML}</select><button id="customSubmit">Submit</button></div>`
            // console.log(data)
            }
        }
        else {
        // let vetDiv = document.getElementById("doctorList");
        // vetDiv.innerHTML = "We do not have a doctor practising with that speciality";
        }
        }
        )
    
}

function doctorSelect() {
    if (document.getElementById("doctorList").classList.contains("notVisible")){
        // document.getElementById("doctorList").classList.toggle("notVisible")}
    }

    document.getElementById("customAppointment").classList.toggle("notVisible")

    let medicine = document.getElementById("medicalDomainSelector").value
    
    fetch('/doctorSearch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
        },
        body: JSON.stringify({
            domain: medicine
        })
    })
    .then(response =>{
        if(response.ok) {
            
            return response.json();
        }
        else {
            console.log("We do not have a doctor practising with that speciality");
            let vetDiv = document.getElementById("doctorList");
            vetDiv.innerHTML = "";
        }
    })
    .then(data => {
        if(data){            
            document.getElementById("doctorList").remove();
            let sibDiv = document.getElementById("appointmentList");
            let vDiv = document.createElement('div');
            vDiv.classList.add("flexGallery");
            vDiv.id = "doctorList";
            sibDiv.parentNode.insertBefore(vDiv, sibDiv);
            let vetDiv = vDiv;
            vetDiv.innerHTML = "";
            const vetInfo = data.vet_list.map((vet) => `<div class="vetSelector" data-value=${vet.id}>${vet.vet}</div>`);
            vetDiv.innerHTML += vetInfo.join('');

            const appointmentSearchHandler = (event) => { appointmentSearch(event.target.dataset.value) };

            // Remove existing click event listener (if any)
            vetDiv.removeEventListener('click', appointmentSearchHandler);
            

            // Add the updated click event listener
            vetDiv.addEventListener('click', appointmentSearchHandler);
            // Making sure it is visually obvious which doctor is selected
            selectorDivs = document.querySelectorAll(".vetSelector");
            for(element of selectorDivs){
                element.addEventListener('click', () => {
                    for(let i = 0; i < selectorDivs.length; i++){
                        if(selectorDivs[i].classList.contains("selected")){
                            selectorDivs[i].classList.toggle("selected")
                        }
                    }
                    event.target.classList.toggle("selected")
                })
            }
        }
        else {
            let vetDiv = document.getElementById("doctorList");
            vetDiv.innerHTML = "We do not have a doctor practising with that speciality";
        }
        
})
}



//TODO: Add more validation here
function submissionHandler(event){
    if (event.target.type == "submit"){
        
        confirmationDiv(event.target);
        }
    else {
        
        return false}
        }

function appointmentSearch(e, customDay, direction){

    if (document.getElementById("appointmentList").classList.contains("notVisible")){
        document.getElementById("appointmentList").classList.toggle("notVisible")}
    
    doctorID = e
    if (!doctorID){
        return false
    }
    
    duration = document.getElementById("durationSelector").value
    appointmentDiv = document.getElementById("appointmentList")
        fetch('/getAvailableTimes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
        },
        body: JSON.stringify({
            doctorID: doctorID,
            duration: duration,
            date: customDay,
            direction: direction
        })
    })
    .then(response =>{
        if(response.ok) {
            
            return response.json();
        }
        else {
        }
    })
    .then(data => {
        if(data){
            let pDiv = document.getElementById('pDiv')
            if (pDiv.classList.contains("notVisible")){
                pDiv.classList.toggle("notVisible")   
            }
            appointmentDiv.innerHTML = ""
            const objectArray = Object.keys(data);
            dateValue = objectArray[0]
            
            for(key of objectArray){
                const selector = document.createElement("select")
                selector.innerHTML = selector.innerHTML + `<option disabled selected>${key}</option>`
            
                for (value of data[key]){
                    selector.innerHTML = selector.innerHTML + `<option>${value}</option>`
                }
                
                appointmentDiv.innerHTML = appointmentDiv.innerHTML + `<div class='flex-column'><select id="date_${objectArray.indexOf(key)}" data-value="${doctorID}" data-paginator="${key}">${selector.innerHTML}</select><button id="${key}" data-value="${objectArray.indexOf(key)}">Submit</button></div>`
            // console.log(data)
            }

            appointmentDiv.removeEventListener('click', submissionHandler);
            appointmentDiv.addEventListener('click', submissionHandler);
        }
        else {
        // let vetDiv = document.getElementById("doctorList");
        // vetDiv.innerHTML = "We do not have a doctor practising with that speciality";
        }
        pDiv = document.getElementById("paginationDiv")
        pDiv = document.getElementById("paginationDiv")
        if (pDiv.classList.contains("notVisible")){
            pDiv.classList.toggle("notVisible")
        }}
        )
    
}

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
    
    if(document.getElementById("existingPets")){
        document.getElementById("existingPets").remove()
        document.getElementById("managePets").classList.toggle('notVisible')
        document.getElementById("managePets").innerHTML = `<button id="addExisting">Add Existing Pets</button><button id="createNew">Add New Pet</Button>`
        
    }
    let clientNumber = document.getElementById('numberSearch').value.replace(/\s/g, '');
    
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
    if(document.getElementById("selectContainer")){document.getElementById("selectContainer").classList.toggle("notVisible");

    }
    document.getElementById("managePets").classList.toggle('notVisible');
    document.getElementById("addExisting").addEventListener('click', (event) => {getExistingPet(data)});
    document.getElementById("createNew").addEventListener('click', (event) => {addNewPet(data)});
}

function getExistingPet(data){
    user_id = data.id
    if(document.getElementById("selectContainer")){
        document.getElementById("selectContainer").innerHTML = ""
    }
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
            
        }
            
        // console.log(data)
        if(document.getElementById("existingPets")){
            document.getElementById("existingPets").innerHTML = ""            
        }
    const existingPets = document.createElement('div');
    existingPets.classList = "flex-center-wrap"
    existingPets.id = "existingPets"
    existingPets.innerHTML = `<div class="hundredW" id="selectContainer"><select class="marginAuto" name="petSelect" id="petSelect"></select><button id="addExisting">Submit Change</button></div>`;
    existingPets.innerHTML += document.getElementById("managePets").innerHTML;
    document.getElementById("managePets").innerHTML = "";
    document.getElementById("managePets").append(existingPets);
    
    data.options.forEach(option => {
        
        const object = document.createElement('option');
        object.value = option.id;
        object.textContent = option.name;
        selectList = document.getElementById("petSelect")
        
        selectList.appendChild(object)
   
    });
    document.getElementById("addExisting").addEventListener("click", () => {
        pet_id = document.getElementById("petSelect").value
        addToOwner(user_id, pet_id);
    })
    
})
}

function addToOwner(user, pet){
    fetch('/addOwner', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}` // Include the CSRF token in the header
        },
        body: JSON.stringify({
            owner_id: user,
            pet_id: pet
        })
    })
    .then(response =>{
        if(response.ok) {
            
            return response.json();
        }
        else {
            alert("No unowned Pet or Owner found in Database matching these details");
        }
    })
    //Create dropdown menu with exant pets
    .then(data => {
        console.log(data)

            manageCustomerSearch()
        })
}

function addNewPet(data){
    
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

