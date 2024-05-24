# VetBooker

## Rationale

I was inspired by my wife to build a veterinary clinic booking system. The veterinary assistants in her practice often have to book appointments of varying complexity and lengths via the telephone, and finding a reasonable time slot can sometimes prove difficult with their current software. They need to be aware of many factors, and the time slots can overlap if the people booking appointments aren't careful.

I decided to build a piece of software that eliminates that possibility, and proves the user with specific slots that cannot overlap or run into eachother.
	

## Distinctiveness and Complexity

This project is quite distinct from other projects in this course for a variety of reasons. The first (and less significant) is the structure of the different pages acts like a set of mini-SPAs, while the application itself is not actually an SPA. While we did implement one similar SPA, the scope of the project was small enough that it was sufficient to have all those elements together. In contrast to this, my web application has elements that, while they are related to eachother and data is saved into the same database, differ so much from eachother that separate pages need to be created for a good logical flow. In each of these "sub-SPAs" there is the regular DOM manipulation that you might expect on the front-end based on the back-end API information that it gets.

The **major difference**, however, when comparing this project to other projects, is in how the APIs function. In our previous projects, the main use of APIs was simply to save and retrieve data. There wasn't a lot of back-end logic going on to process the data that we were sending and receiving. In contrast to this, the main usefulness of this project is how the data is processed on the server. Appointment requests are analysed for doctor, predicted procedure length, and requested dates, and a list of times is generated for a (shiftable) weeklong period (or custom day). Any potential collisions are removed from the list, then forwarded to the front-end for use by the user. After the user receives the information and actually tries to save an appointment in the database, data are validated to avoid any database collisions that could potentially be caused by multiple users using different terminals to book appointments.

The rest of the app, beyond the booking system (which was the main purpose for designing the app) is basic data entry and retrieval, providing users with abilities to add clients and pets, and to manage information about them.

## Non-HTML Elements

### views.py

This file contains the logic for the entire app. There are dozens of views, designed as API routes and regular requests, so to discuss all of them would be excessive. Suffice it to say, for regular requests of pages, the server renders the templates, handling any data it needs, depending on whether there has been a POST request or not. Users are required to be logged in to access any of these routes, and for some of them (such as the account approval page), a user must be a superuser (i.e. an administrator) in order to access.

The API routes are where most of the real logic lies. The two most important API routes are **get_avails** (and its sibling custom_times which functions similarly) as well as **add_booking**. 

The first view gets as much information as it can from the front-end: Which doctor do we want, how long will the appointment be, what day will it be (default is the current day, but the app also handles pagination requests that shift the time period by a week forward and backwards), and gets a list of all appointments for that vet for the weeklong period based on that day.

Then, the view creates a dict of all days in the period, with a list of all potential booking times, based in 15 minute blocks, and removes times at the end of the day, depending on the duration of the potential new appointment (for instance, if the clinic closes at 18:00, a 30 minute appointment cannot be booked in at 17:45 as it will run over). Then, the view compares the existing bookings for that vet, and removes time slots where there already is an appointment, or where there will be overlap (i.e. the existing appointment runs into the new one, or vice-versa). Finally this information is sent back to the front-end for processing.

The second of the aforementioned views is add_booking. It is perhaps less robust than get_avails, however it is very important and necessary. It receives a request from the front-end to save a new booking into the database. It must first validate that all the required information is present, before it validates whether a booking already exists that overlaps with this new potential booking, which is one manner of handling database collisions. To do this, it requests all the booking objects for the date of the new booking, takes note of the duration, and converts these times to floats, in order to compare. It handles several different cases (overlap in both directions or at the exact same booking time) and then either approves and saves the new booking, or rejects it.

The algorithms I designed for both of these views are where the real value in this project lies.

### models.py

This contains the tables for the database / the objects that are used throughout the project. The most important models are Pet, Booking, Vet, and Client, though there are models for procedures, shifts, users, skills (of the vet), as well as an unimplemented bill model. Because of the creeping scope of the assignment, bill is not entirely fleshed out, however in future it could be something to be developed to enhance the project. Each of the models contains a variety of fields, and for the four important main models, there are many foreign key (and some many to many) relationships established between the fields and models.

Administrators can add new vets, skills, etc. via the admin page once logged into the app.

### urls.py

This contains two lists of routes: some for page requests (including paths with arguments), and some just for the API for booking, searching, managing customers, etc.

### script.JS

This contains all the front-end scripting. There is a lot of DOM manipulation going on in several functions. No function is initiated on a page and no event-listeners are attached until the DOM has fully loaded, and the page is first checked to ensure that the elements exist on the page. Most of the functions have to do with JSON requests, handling incoming data (such as generating drop-down menus or potential doctors based on their availability and expertise), and validation. There are some functions that are designed for use-ability, for example, on the booking page, selecting a specific vet will highlight that div and change some information in the optional custom booking section, and de-highlight any previously selected vet. When I began the project I was performing fetches differently, and eventually learned to use asynchronous functions to use await clauses in my fetches, which I find more compact and tidier.

### styles.css

The page uses Bootstrap's dark-theme and menu options, so these are actually handled in the layout.html page. However, there is a lot of custom css in this file, and a lot of use of flex elements in order to ensure responsiveness based on size of the viewer's device. It can be used on a mobile, but because of the scenario it's designed for, it does feel much more minimalist when viewed on a desktop. I've tried to reuse as many classes as possible in order to simply the writing of the page as well as have some consistency, but because of all the moving parts there are quite a few custom selectors.

## HTML Templates

The following HTML Templates are present in my project.

### layout

The basic layout for all pages. This includes a menu with options that change depending on the status of the user.

### index

This page welcomes the user. The user then has to select what they need to do, depending on their task, from the menu. The user must be logged in and approved to view this.

### login

Very basic login page, with an option to create an account if necessary.

### register

The registration page allows assistants and vets to create an account in order to use the app. Users have to be approved by an admin in order to actually use the application, to ensure the database is only touched by approved employees.

### approval

This page allows superusers to see who has registered for an account, and approve new accounts in order to grant them access to VetBooker.

### book

This is the most important page. It allows users to select a client, choose which pet they want to make an appointment for, select an appointment complexity (from short to long, 15 - 120 minute appointments), choose a medical domain (such as general, cardiology, etc.), get a list of vets with those specialities, then get a list of available times. Different weeks can be accessed via pagination, and custom days can be inputted. A confimation div becomes visible when the user submits a chosen appointment. If the appointment is successfully submitted, the user is forwarded to a page for that appointment.

### manage

This page allows users to manage the details of a custom, such as their address or phone number, to add or remove pets from the customer, to check the appointments of any particular pet, to add a new customer, and to add new pets.

### petSearch

This page shows all appointments for a particular pet. This is accessed via manage.

### schedule

This page allows staff at the clinic to see what appointments, in order, the veterinarian has for any particular day.

### search

This page allows staff to look for appointments for any particular client, based on telephone number.

### view_specific_booking

This page allows users to see the details of any specific appointment. This is linked to on any of the previous three pages. An appointment can be cancelled from this page.

## How to Run

As with the other assignments in this course, in order to run the project once simply needs to use the command **python manage.py runserver** in the relevant folder. Any new implementation of this program will likely want to clear out the database, and have customaized information about the specific clinic added in in the admin section. I would also recommended creating a new superuser account. This can be done with the command **python manage.py createsuperuser**. 

If deleting all information from the database, one should be careful with editing the entries in for the **shift** model. views.py creates times based on what shift the doctor has. If the doctor has the morning shift, then the times are created from 8:00 to 16:00. If the vet has the afternoon shift, times are created from 12:00 - 20:00. This can be customized by whoever is administrating this software.

## Other requirements

Beyond Django, no other packages need to be installed, thus there is only one requirement in requirements.TXT file. 