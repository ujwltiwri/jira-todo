const uid = new ShortUniqueId();
let modalCont = document.querySelector(".modal-cont");
let addBtn = document.querySelector(".add-btn");
let textAreaCont = document.querySelector(".textarea-cont");
const colors = ["lightpink", "lightgreen", "lightblue", "black"];
let ticketColor = colors[colors.length - 1]; //black
const mainCont = document.querySelector(".main-cont");
let ticketsArr = [];
let priorityColorCont = document.querySelectorAll(".priority-color-cont>*");
let ticketCont = document.querySelector(".ticket-cont");
let toolBoxColorCont = document.querySelectorAll(".toolbox-color-cont>div");
const removeBtn = document.querySelector(".remove-btn");
let isModalActive = false;

addBtn.addEventListener("click", () => {
  if (!isModalActive) {
    //then make it active
    modalCont.style.display = "flex";
  } else {
    //then make it in active again
    modalCont.style.display = "none";
  }

  isModalActive = !isModalActive; //flag to check if modal is active or non-active
});

//2. Work to be done is to make tickets
modalCont.addEventListener("keydown", (keyPress) => {
  if (keyPress.key == "Shift") {
    // 1-> Call CreateTicket Function
    createTicket(ticketColor, textAreaCont.value);

    //2nd -> alter display and update isModalPresent
    modalCont.style.display = "none";
    isModalActive = !isModalActive;

    //3rd -> Empty Textarea
    textAreaCont.value = "";

    // 4th->display ticket Container
  }
});

function createTicket(ticketColor, data, ticketId) {
  let id = ticketId || uid();

  let ticketCont = document.createElement("div");
  ticketCont.setAttribute("class", "ticket-cont");
  ticketCont.innerHTML = `
  <div class="ticket-color ${ticketColor}"></div>
  <div class="ticket-id">${id}</div>
  <div class="task-area">${data}</div>
  <div class="ticket-lock">
  <i class="fa-solid fa-lock"></i>
  </div>
  `;
  mainCont.appendChild(ticketCont);

  //push the data of every ticket into ticketsArr Array
  if (!ticketId) {
    ticketsArr.push({
      ticketColor,
      ticketId: id,
      ticketTask: data,
    });
  }

  //if ticket is being generated for 1st time then save it into localStorage
  localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  handelRemoval(ticketCont, ticketId);
  handleLock(ticketCont, ticketId);
  handleColor(ticketCont, ticketId);
}

//getting data from local storage
if (localStorage.getItem("tickets")) {
  ticketsArr = JSON.parse(localStorage.getItem("tickets"));
  ticketsArr.forEach((ticketObj) =>
    createTicket(
      ticketObj.ticketColor,
      ticketObj.ticketTask,
      ticketObj.ticketId
    )
  );
}

//select color for ticket creation
priorityColorCont.forEach((colorsdiv) => {
  colorsdiv.addEventListener("click", () => {
    priorityColorCont.forEach((tickets) => {
      tickets.classList.remove("active");
    });

    colorsdiv.classList.add("active");
    ticketColor = colorsdiv.classList[0];
  });
});

//getting ticket on basis of ticket color
for (let i = 0; i < toolBoxColorCont.length; i++) {
  toolBoxColorCont[i].addEventListener("click", () => {
    let currColor = toolBoxColorCont[i].classList[0];
    let filteredTicketArr = ticketsArr.filter(
      (filterdTickets) => filterdTickets.ticketColor == currColor
    );

    //1-> remove all the tickets from ui
    let allTickets = document.querySelectorAll(".ticket-cont");
    allTickets.forEach((tickets) => tickets.remove());

    // 2nd-> display filtered tickets
    filteredTicketArr.forEach((filteredTickets) =>
      createTicket(
        filteredTickets.ticketColor,
        filteredTickets.ticketTask,
        filteredTickets.ticketId
      )
    );
  });

  //show all tickets when double clicked
  toolBoxColorCont[i].addEventListener("dblclick", () => {
    // 1->remove available tickets
    let allTickets = document.querySelectorAll(".ticket-cont");
    allTickets.forEach((tickets) => tickets.remove());

    // 2-> show all tickets
    ticketsArr.forEach((tickets) =>
      createTicket(tickets.ticketColor, tickets.ticketTask, tickets.ticketId)
    );
  });
}

//make remove button active
let isRemoveBtnActive = false;
removeBtn.addEventListener("click", () => {
  if (!isRemoveBtnActive) {
    //remove btn is active
    removeBtn.style.color = "red";
  } else {
    removeBtn.style.color = "white";
  }

  isRemoveBtnActive = !isRemoveBtnActive;
});

//helps in removing the tickets
function handelRemoval(ticketCont, ticketId) {
  ticketCont.addEventListener("click", function () {
    if (!isRemoveBtnActive) return;
    let index = getTicketidx(ticketId);
    // 1-> Delete the ticket from ticketsArr
    // console.log("before", ticketsArr);
    ticketsArr.splice(index, 1);
    // console.log("After", ticketsArr);

    //set in local storage
    localStorage.setItem("tickets", JSON.stringify(ticketsArr));

    //remove from ui
    ticketCont.remove();
  });
}

function getTicketidx(id) {
  let idx = ticketsArr.findIndex((element) => element.ticketId == id);
  return idx;
}

// make lock button active to edit tickets
let unlock = "fa-lock-open";

function handleLock(ticketCont, ticketId) {
  let ticketLock = ticketCont.querySelector(".ticket-lock");
  let lock = ticketLock.children[0].classList[1];
  const taskArea = ticketCont.querySelector(".task-area");

  ticketLock.addEventListener("click", () => {
    if (ticketLock.children[0].classList.contains(lock)) {
      //then unlock the ticket
      // 1->remove lock class
      ticketLock.children[0].classList.remove(lock);

      // 2-> add unlock class
      ticketLock.children[0].classList.add(unlock);

      //make content editable
      taskArea.setAttribute("contenteditable", "true");
    } else if (ticketLock.children[0].classList.contains(unlock)) {
      //then lock the ticket

      // 2-> add lock class
      ticketLock.children[0].classList.add(lock);

      //1-> remove unlock class
      ticketLock.children[0].classList.remove(unlock);

      //make content non editable
      taskArea.setAttribute("contenteditable", "false");
    }

    //set edited ticket in local storage
    let idx = getTicketidx(ticketId);
    ticketsArr[idx].ticketTask = taskArea.innerHTML;
    localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  });
}

//change ticket priority color
function handleColor(ticketCont, id) {
  let ticketColor = ticketCont.querySelector(".ticket-color");

  ticketColor.addEventListener("click", () => {
    let currColor = ticketColor.classList[1];
    let currColoridx = colors.indexOf(currColor);
    let newColoridx = (currColoridx + 1) % 4;

    //change the ticket color
    // 1->remove current ticket color
    ticketColor.classList.remove(currColor);
    // 2-> add next color
    ticketColor.classList.add(colors[newColoridx]);

    //update in local storage
    let idx = getTicketidx(id);
    ticketsArr[idx].ticketColor = colors[newColoridx];
    localStorage.setItem("tickets", JSON.stringify(ticketsArr));
  });
}
