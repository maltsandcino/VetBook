
document.addEventListener('DOMContentLoaded', () =>{

    if (document.getElementById("approvalGallery")){
        document.getElementById("approvalGallery").addEventListener('click', () => {approveAccount()})
    }
    if (document.getElementById("dateSelect")){
        document.getElementById('dateSelect').valueAsDate = new Date();
    }

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

    if (document.getElementById("search")){
        document.getElementById("search").addEventListener('click', () => {findUserBookings()});
        document.getElementById('clientTel').addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              findUserBookings();
            }
        }
    )
    }

    if (document.getElementById("generate")){
        document.getElementById("generate").addEventListener('click', () => {generateBookings()})
    }
})

//Change the animation to the fifty div, and change the animation of the approvalDiv to make this more smooth.
function approveAccount() {

    console.log(event.target)
    var element = event.target
    var id = ""

    if(element.className === 'approvalDiv'){
    id = element.id
    }
    if(element.className === 'fifty'){
        id = element.parentNode.id
        element = element.parentNode
    }
    if(element.className === 'approvalP'){ 
        id = element.parentNode.parentNode.id
        element = element.parentNode.parentNode
    }

    let modal = document.getElementById("modal");
    modal.classList.toggle("notVisible")

    let yes = document.getElementById("yes");
    let no = document.getElementById("no");

    const removalHandler = (event) => {
        createActiveUser(id, element)
        yes.removeEventListener('click', removalHandler)
    }

    
    yes.removeEventListener('click', removalHandler) 

    yes.addEventListener('click', removalHandler);
    yes.hasEventListener = true;

    no.addEventListener('click', () => {
        yes.removeEventListener('click', removalHandler)
        if(!modal.classList.contains("notVisible")){
            modal.classList.toggle("notVisible");}
    } )
    
}

async function createActiveUser(data, element){
    console.log(data)

    let response = await fetch('/approval', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}`
        },
        body: JSON.stringify({
            user: data,
        })
    });
    try {const result = await response.json()
        console.log("Checking:")
        console.log(result.user_id)      
        }    

    catch (error) {
        console.log(error)
    }

    document.getElementById("modal").classList.toggle("notVisible")
    element.style.animationPlayState = 'running';
}

async function findUserBookings() {
    let clientTel = document.getElementById("clientTel").value;
    console.log(clientTel)
    
    let mainDiv = document.getElementById("appointmentContainer");
    mainDiv.innerHTML = '<div id="appointmentGallery"></div>'

    let response = await fetch('/clientAppointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}`
        },
        body: JSON.stringify({
            client: clientTel,
        })
    });
    try {const result = await response.json()
     
        let bookings = result.bookings
        console.log(result.bookings)
        document.getElementById("nameContainer").classList.toggle("notVisible")
        document.getElementById("name").innerHTML = `${result.name}`;
       
        if(result.bookings){
        for (const [i, value] of Object.entries(bookings)) {
            let sibDiv = document.getElementById("appointmentGallery");
            let aDiv = document.createElement('div');
            aDiv.classList.add("appointmentDiv");
            aDiv.classList.add("flex-spaced")
            aDiv.id = `appointment_${i}`;
            aDiv.innerHTML = `<div class="fifty"><p>Subject:</p>
                                <p>Day:</p>
                                    <p>Time:</p>
                                    <p>Duration:</p></div>
                                <div class="fifty">
                                <p>${value[0]}</p>
                                <p>${value[1]}</p>
                                <p>${value[2]}</p>
                                <p>${value[3]} Minutes</p></div>`
            aDiv.addEventListener('click', function() {window.location.href = `./appointment/${value[4]}`})
            sibDiv.parentNode.insertBefore(aDiv, sibDiv);
        }}      
        
        // bookings.forEach(function (booking) {
        //     console.log(booking);
        // });
    
    }
    catch (error) {
        if(!document.getElementById("nameContainer").classList.contains("notVisible")){
            document.getElementById("nameContainer").classList.toggle("notVisible")
        }
        console.log(error)
    }
}
async function generateBookings(){
    let vet_id = document.getElementById("vetSelect").value;
    let date = document.getElementById("dateSelect").value;
    let mainDiv = document.getElementById("appointmentContainer");
    mainDiv.innerHTML = '<div id="appointmentGallery"></div>'

    let response = await fetch('/generateAppointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}`
        },
        body: JSON.stringify({
            vet: vet_id,
            date: date
        })
    });
    try {const result = await response.json()
        // console.log(result.bookings)

        let bookings = result.bookings
        if(result.bookings){
        for (const [i, value] of Object.entries(bookings)) {
            let sibDiv = document.getElementById("appointmentGallery");
            let aDiv = document.createElement('div');
            aDiv.classList.add("appointmentDiv");
            aDiv.classList.add("flex-spaced")
            aDiv.id = `appointment_${i}`;
            aDiv.innerHTML = `<div class="fifty"><p>Subject:</p>
                                <p>Day:</p>
                                    <p>Time:</p>
                                    <p>Duration:</p></div>
                                <div class="fifty">
                                <p>${value[0]}</p>
                                <p>${value[1]}</p>
                                <p>${value[2]}</p>
                                <p>${value[3]} Minutes</p></div>`
            aDiv.addEventListener('click', function() {window.location.href = `./appointment/${value[4]}`})
            sibDiv.parentNode.insertBefore(aDiv, sibDiv);
        
            
            ;
        }}


       
        
        // bookings.forEach(function (booking) {
        //     console.log(booking);
        // });
    
    }
    catch (error) {
        console.log(error)
    }
}


//TODO: Remove event listener to avoid doubbly doing this.
async function submitBooking(telephone, pet, date, time, doctor, length, note, subject){
    console.log("hey")
    
    let response = await fetch('/addappointment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}`
        },
        body: JSON.stringify({
            number: telephone,
            doctorID: doctor,
            date: date,
            time: time,
            note: note,
            petID: pet,
            duration: length,
            title: subject
        })
    });
    try {const result = await response.json();
    console.log(result.status)
    if (result.status === "400"){
        alert("Please verify your data and try to submit again.");
        modalDiv.classList.toggle("notVisible");
    }
        document.getElementById("confirmationModal").innerHTML = `<div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;"><h4 style="margin: auto;">Booking for <i>${result.name}</i> has been successfully submited.</h4><h5>Forwarding to appointment.</h5></div>`
        document.getElementById("confirmationModal").classList.toggle("successful")
        // document.getElementById("confirm").disabled = true;
        setTimeout(function() {
            window.location.href = `./appointment/${result.id}`;
         }, 3000);

    }
    
    
    catch (error) {
        console.log(error)
    }
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
    let subject = document.getElementById("medicalDomainSelector").value;

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
    let modalType = document.getElementById("modalType")
    
    modalTitle.innerHTML = `Appointment Confirmation for <i>${petName}</i>`
    modalName.innerHTML = `${petName}`
    modalDoctor.innerHTML = `${doctor}`
    modalDay.innerHTML = `${date}`
    modalTime.innerHTML = `${time}`
    modalDuration.innerHTML = `${length}`
    modalNote.innerHTML = `${note}`
    modalType.innerHTML = `${subject}`
    
    modalDiv.classList.toggle("notVisible")
    date = date.split(",").pop()
    date = date[7] + date[8] + date[9] + date[10] + date[3] + date[4] + date[5] + date[3] + date[1] + date[2]
    console.log(date)
    // telephone, pet, date, time, doctor, length, note
    
   const handleConfirmClick = (event) => { 
    
    
       submitBooking(clientTel, pet, date, time, doctorID, lengthValue, note, subject);
       confirm.removeEventListener('click', handleConfirmClick)
   }
    
    let confirm = document.getElementById("confirm") 
    confirm.addEventListener('click', handleConfirmClick);


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
            if(document.getElementById("customAppointment").classList.contains("notVisible")){
            document.getElementById("customAppointment").classList.toggle("notVisible")}
            customDiv.innerHTML = ""
            const objectArray = Object.keys(data);
            dateValue = objectArray[0]
            
            for(key of objectArray){
                const selector = document.createElement("select")
                selector.innerHTML = selector.innerHTML + `<option disabled selected>${key}</option>`
            
                for (value of data[key]){
                    selector.innerHTML = selector.innerHTML + `<option>${value}</option>`
                }
                
                customDiv.innerHTML = customDiv.innerHTML + `<div class='flex-column'><select data-value="${vet}" data-paginator="${dateValue}" id="customSelect">${selector.innerHTML}</select><button id="customSubmit">Submit</button></div>`
                document.getElementById("customSubmit").addEventListener('click', () => {customConfirmationDiv()})
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

function customConfirmationDiv(){
   
    let date = document.getElementById("customSelect").dataset.paginator
    let doctor = document.getElementById("customMedicalDomainSelector").value;
    let doctorID = document.getElementById("customSelect").dataset.value;
    let clientTel = document.getElementById("bookingPhonenumber").value.replace(/\s/g, '');
    let note = document.getElementById("clientNotes").value;
    let lengthValue = parseInt(document.getElementById("customDurationSelector").value);
    let time = document.getElementById("customSelect").value;
    let petSelect = document.getElementById("petSelect");
    let petOption = petSelect.options[petSelect.selectedIndex];
    let petName = petOption.value.split(":")[0]
    let pet = petOption.dataset.pet;
    let length = "NaN"
    let subject = "Custom Appointment";

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
    let modalType = document.getElementById("modalType")
    
    modalTitle.innerHTML = `Appointment for <i>${petName}</i>`
    modalName.innerHTML = `${petName}`
    modalDoctor.innerHTML = `${doctor}`
    modalDay.innerHTML = `${date}`
    modalTime.innerHTML = `${time}`
    modalDuration.innerHTML = `${length}`
    modalNote.innerHTML = `${note}`
    modalType.innerHTML = `${subject}`
    
    modalDiv.classList.toggle("notVisible")
    date = date.split(",").pop()
    date = date[7] + date[8] + date[9] + date[10] + date[3] + date[4] + date[5] + date[3] + date[1] + date[2]
    console.log(date)
    // telephone, pet, date, time, doctor, length, note
    
   const handleConfirmClick = (event) => { 
    
    
       submitBooking(clientTel, pet, date, time, doctorID, lengthValue, note, subject);
       confirm.removeEventListener('click', handleConfirmClick)
   }
    
    let confirm = document.getElementById("confirm") 
    confirm.addEventListener('click', handleConfirmClick);
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
                    console.log(event.target.dataset.value)
                    
                    //Make sure the custom doctor select automatically gets changed to the selected doctor above, to avoid issues.
                    let customSelect = document.getElementById("customMedicalDomainSelector")
                    
                    for(let i = 0; i < customSelect.options.length; i++){
                        let option = customSelect.options[i].value
                        
                        if(event.target.dataset.value == option){
                        customSelect.selectedIndex = i
                        }
                    }
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

function manageCustomer(args) {
    if(!document.getElementById("managePets").classList.contains("notVisible")){
        document.getElementById("managePets").classList.toggle("notVisible");
    }
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
    if(args){
        document.getElementById('numberSearch').value = args
        manageCustomerSearch()
    }
}

function manageCustomerSearch(args) {
    
    if(document.getElementById("existingPets")){
        document.getElementById("existingPets").remove()
        document.getElementById("managePets").classList.toggle('notVisible')
        document.getElementById("managePets").innerHTML = `<button id="addExisting">Add Existing Pets</button><button id="createNew">Add New Pet</Button>`
        
    }
   
    clientNumber = document.getElementById('numberSearch').value.replace(/\s/g, '');
    
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
            if(!document.getElementById("managePets").classList.contains("notVisible")){
                document.getElementById("managePets").classList.toggle("notVisible");
            }
            customerResults = document.querySelector(".customerResults")
            customerResults.innerHTML = "";
            return { then: function() {} }
        }
    })
    .then(data => {
        let managementDiv = document.querySelector("#managementDiv");
        if (document.querySelector(".customerResults")){
            customerResults = document.querySelector(".customerResults")
            customerResults.innerHTML = "";
            customerResults.innerHTML = `<div class='resultsTop' style='text-align:left;'></div> <div name='resultsBigContainer' class='flex-row'> <div id='categories'><p id="editName" class="flex-spaced-between">Client <span class="textRight">✏️</span></p><p id="editEmail" class="flex-spaced-between">E-Mail <span class="textRight">✏️</span></p><p id="editAddress" class="flex-spaced-between">Address <span class="textRight">✏️</span></p><p id="editTelephone" class="flex-spaced-between">Telephone <span class="textRight">✏️</span></p><p>Pets</p><button id="editPets">Edit Pets</button></div><div id='results'><div containName><p>${data.name}</p></div><div id="containEmail"><p>${data.email}</p></div> <div id="containAddress"><p>${data.address}</p></div> <div id="containTelephone"><p>${data.telephone}</p></div></div> </div>`
            managementDiv.append(customerResults);
            let results = document.getElementById('results');
            const petInfo = data.pets.map((pet) => `<p>${pet.name}: ${pet.species} </p><p class="petList"> <button onclick="remove(${pet.id})">Remove</button><a href="./petAppointments/${pet.id}"><button>View Appointments</button></a></p>`);
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
            customerResults.innerHTML = `<div class='resultsTop flex-spaced-between' style='text-align:left;'></div> <div name='resultsBigContainer' class='flex-row'> <div id='categories'><p id="editName" class="flex-spaced-between">Client <span class="textRight">✏️</span></p><p id="editEmail" class="flex-spaced-between">E-Mail <span class="textRight">✏️</span></p><p id="editAddress" class="flex-spaced-between">Address <span class="textRight">✏️</span></p><p id="editTelephone" class="flex-spaced-between">Telephone <span class="textRight">✏️</span></p><p>Pets</p><button id="editPets">Edit Pets</button></div><div id='results'><div id="containName"><p>${data.name}</p></div><div id="containEmail"><p id="editEmail">${data.email}</p></div> <div id="containAddress"><p id="editAddress">${data.address}</p></div> <div id="containTelephone"><p id="editTelephone">${data.telephone}</p></div></div> </div>`
            managementDiv.append(customerResults);
            let results = document.getElementById('results');
            const petInfo = data.pets.map((pet) => `<p>${pet.name}: ${pet.species} </p><p class="petList"><button onclick="remove(${pet.id})">Remove</button><a href="./petAppointments/${pet.id}"><button>View Appointments</button></a></p>`);
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
    console.log("showPetsModal")
    if(document.getElementById("selectContainer")){document.getElementById("selectContainer").classList.toggle("notVisible");

    }

    const newPetHandler = (event) => {
        
        document.getElementById("createNew").removeEventListener('click', newPetHandler);
        if(data){
            document.getElementById("createNew").addEventListener('click', newPetHandler)
        }
        addNewPet(data);
    }
    
    if(!document.getElementById("createNew").hasEventListener){
        document.getElementById("createNew").addEventListener('click', newPetHandler);
        document.getElementById("createNew").hasEventListener = true;
    }



    document.getElementById("managePets").classList.toggle('notVisible');
    document.getElementById("addExisting").addEventListener('click', (event) => {getExistingPet(data)});

    
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
    existingPets.innerHTML = `<div class="hundredW" id="selectContainer"><select class="marginAuto" name="petSelect" id="petSelect"></select><button id="submitAddExisting">Submit Change</button></div>`;
    // existingPets.innerHTML += document.getElementById("managePets").innerHTML;
    document.getElementById("above").innerHTML = "";
    document.getElementById("above").append(existingPets);
    
    data.options.forEach(option => {
        
        const object = document.createElement('option');
        object.value = option.id;
        object.textContent = option.name;
        selectList = document.getElementById("petSelect")
        
        selectList.appendChild(object)
   
    });
    document.getElementById("submitAddExisting").addEventListener("click", () => {
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
    console.log("addNewPet")
    if(data === undefined){
        console.log("data undefined")
        var closeData = data
    }
    let bg = document.getElementById("bg")
    bg.classList.toggle("bg")
    document.getElementById("addPet").classList.toggle("notVisible");
    if(document.getElementById("ownerP")){
        document.getElementById("ownerP").remove()
    }
    
    if(data){
        const ownerP = document.createElement("p")
        const node = document.getElementById("lastNode")
        ownerP.setAttribute("Id", "ownerP")
        ownerP.setAttribute("data-owner", `${data.id}`)
        ownerP.innerHTML = `<div class="flex-spaced-apart">
        <label for="petBreed" data-owner="${data.id}">User</label><p>${data.name}</p> 
        </div>`
        node.parentNode.insertBefore(ownerP, node.nextSibling);
    }
    else {
        let data = "none"
    }
    const submitButton = document.getElementById("newPetSubmit")

    const handlePet = (event) => { 
        submitPet(data);
        submitButton.removeEventListener('click', handlePet)
    }
     
     submitButton.addEventListener('click', handlePet);
    
     //Making sure the div can close
     const closeButton = document.getElementById("close")

     identity = event.target.id
     

     const closeNewPetModal = (event) => {
        let bg = document.getElementById("bg");
        bg.classList.toggle("bg");
        document.getElementById("addPet").classList.toggle("notVisible");
        submitButton.removeEventListener('click', handlePet)
        closeButton.removeEventListener('click', closeNewPetModal)
        
        reload = document.getElementById("createNew");
        
      
        }


    closeButton.addEventListener('click', closeNewPetModal);
    
}

//todo: push data to server, handle

async function submitClient(){

    let name = document.getElementById("clientName").value
    let telephone = document.getElementById("clientTelephone").value
    let address = document.getElementById("clientAddress").value
    let email = document.getElementById("clientEmail").value

    if (!name){
        document.getElementById("clientName").focus()
        alert("Please include a name")
        return { then: function() {} }
    }
    if (!telephone){
        document.getElementById("clientTelephone").focus()
        alert("Please include a telephone number")
        return { then: function() {} }
    }
    if (!address){
        document.getElementById("clientAddress").focus()
        alert("Please include an address")
        return { then: function() {} }
    }
    console.log(email.indexOf("."))

    if (email && email.indexOf("@") < 0){
        
        alert("Email address is invalid.")
        return { then: function() {} }
    }
    if ( email && email.lastIndexOf(".") < email.indexOf("@")){
        alert("Email address is invalid.")
        return { then: function() {} }
    }

    let response = await fetch('/addCustomer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFTOKEN': `${document.cookie.split('=').pop()}`
        },
        body: JSON.stringify({
            name: name,
            telephone: telephone,
            address: address,
            email: email,
        })
    });
    if(response.ok){
    try {const result = await response.json()

        console.log(result.message)
        let bg = document.getElementById("bg");
        bg.classList.toggle("bg");
        document.getElementById("addClient").classList.toggle("notVisible");
        console.log(result.tel);
        newTel = parseInt(result.tel);
        manageCustomer(newTel)
    }
    catch (error) {
        console.log("Error")
    }}
    else{
        if(response.status === 501){
            console.log("status 501")
            alert("A client with this telephone number already exists.")
            document.getElementById("clientTelephone").focus()
        }
        
        console.log("Please verify the information provided.")
    }
}

function addClient(){

    document.getElementById("clientName").value = ""
    document.getElementById("clientTelephone").value = ""
    document.getElementById("clientAddress").value = ""
    document.getElementById("clientEmail").value = ""

    let bg = document.getElementById("bg")
    bg.classList.toggle("bg")
    document.getElementById("addClient").classList.toggle("notVisible");
    
    const submitButton = document.getElementById("newClientSubmit")

    const handleClient = (event) => { 
    
        submitClient();
        submitButton.removeEventListener('click', handleClient);
        submitButton.addEventListener('click', handleClient);
        
    }
     
     submitButton.addEventListener('click', handleClient);
    
     //Making sure the div can close
     const closeButton = document.getElementById("closeClient")

     const closeNewClientModal = (event) => {
        let bg = document.getElementById("bg");
        bg.classList.toggle("bg");
        document.getElementById("addClient").classList.toggle("notVisible");
        submitButton.removeEventListener('click', handleClient)
        closeButton.removeEventListener('click', closeNewClientModal)
    }

    closeButton.addEventListener('click', closeNewClientModal);
    
    
}

//todo: handle multiple eventlisteners being added.


async function submitPet(){

    petName = document.getElementById("petName").value
    petSpecies = document.getElementById("petSpecies").value
    petBreed = document.getElementById("petBreed").value
    

    if(document.getElementById("ownerP")){
        owner = document.getElementById("ownerP").dataset.owner
    }
    else{
        owner = "None"
    }
    
    let response = await fetch('/addPet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}`
        },
        body: JSON.stringify({
            name: petName,
            species: petSpecies,
            breed: petBreed,
            owner: owner
        })
    });

    try {const result = await response.json()

        console.log(result.name)
    if (document.getElementById("ownerP")){
        manageCustomerSearch()
    }
        let bg = document.getElementById("bg");
        bg.classList.toggle("bg");
        document.getElementById("addPet").classList.toggle("notVisible");
    }
    catch (error) {
        console.log(error)
    }

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

async function viewBookings(petid){
    let clientTel = document.getElementById("editTelephone").innerHTML;
    clientTel = parseInt(clientTel)
    console.log(clientTel)
    
    let mainDiv = document.getElementById("appointmentContainer");
    mainDiv.innerHTML = '<div id="appointmentGallery"></div>'

    let response = await fetch('/petAppointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': `${document.cookie.split('=').pop()}`
        },
        body: JSON.stringify({
            client: clientTel,
            pet: petid,
        })
    });
    try {const result = await response.json()
     
        let bookings = result.bookings
        console.log(result.bookings)
        document.getElementById("nameContainer").classList.toggle("notVisible")
        document.getElementById("name").innerHTML = `${result.petName}`;
       
        if(result.bookings){
        for (const [i, value] of Object.entries(bookings)) {
            let sibDiv = document.getElementById("appointmentGallery");
            let aDiv = document.createElement('div');
            aDiv.classList.add("appointmentDiv");
            aDiv.classList.add("flex-spaced")
            aDiv.id = `appointment_${i}`;
            aDiv.innerHTML = `<div class="fifty"><p>Subject:</p>
                                <p>Day:</p>
                                    <p>Time:</p>
                                    <p>Duration:</p></div>
                                <div class="fifty">
                                <p>${value[0]}</p>
                                <p>${value[1]}</p>
                                <p>${value[2]}</p>
                                <p>${value[3]} Minutes</p></div>`
            aDiv.addEventListener('click', function() {window.location.href = `./appointment/${value[4]}`})
            sibDiv.parentNode.insertBefore(aDiv, sibDiv);
        }}      
        
        // bookings.forEach(function (booking) {
        //     console.log(booking);
        // });
    
    }
    catch (error) {
        if(!document.getElementById("nameContainer").classList.contains("notVisible")){
            document.getElementById("nameContainer").classList.toggle("notVisible")
        }
        console.log(error)
    }
    
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
            if(response.status === 501){
             alert("Please verify the telephone number."); 
             return { then: function() {} }}
             else{
                alert("Please verify the information provided.");
                return { then: function() {} }}
             }
         }
    )
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
    nameDiv = document.getElementById("containName")
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

