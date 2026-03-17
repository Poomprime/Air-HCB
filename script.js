const iconRoom = `<img src="hotel.png" class="icon" alt="Room">`;
const iconNextClean = `<img src="calendar.png" class="icon" alt="Next Clean">`;
const iconSoap = `<img src="air-conditioning.png" class="icon" alt="Soap">`;
const iconAir = `<img src="air-conditioner.png" class="icon" alt="Air Filter">`;

let userConfirmedOnce = false;
let isSearching = false;
let isSpecialRoom = false;
let resultElement, submitBtn, loadingGif, container;

document.addEventListener("DOMContentLoaded", () => {
  resultElement = document.getElementById("result");
  submitBtn     = document.getElementById("submitBtn");
  loadingGif    = document.getElementById("loadingGif");
  container     = document.querySelector(".container");
  const modalOkBtn = document.getElementById("modalOkBtn");
  const modal      = document.getElementById("myModal");
  const roomInput  = document.getElementById("roomNumber");

  roomInput.addEventListener("focus", () => {
    setTimeout(() => {
      roomInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  });

  modalOkBtn.addEventListener("click", () => {
    closeModal();
    userConfirmedOnce = true;
    container.classList.remove("shrink", "expand");
    void container.offsetWidth;
    container.classList.add("shrink");
    setTimeout(() => {
      container.classList.remove("shrink");
      void container.offsetWidth;
      container.classList.add("expand");
    }, 300);
  });

  document.addEventListener("click", (event) => {
    if (modal.classList.contains("show") && event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("show")) {
      closeModal();
      return;
    }
    if (event.key === "Enter" && modal.classList.contains("show")) {
      closeModal();
      return;
    }
    if (event.key === "Enter" && document.activeElement === roomInput && !modal.classList.contains("show")) {
      submitRoom();
      return;
    }
  });

  container.classList.add("animate-on-load");
});

function convertToBangkokTime(dateString) {
  if (!dateString || dateString === "No schedule available") return "N/A";
  return dateString.replace(/(\d{2})(\d{2})(\d{2})/, "$1/$2/20$3");
}

function showModal(message) {
  document.getElementById("modalMessage").innerHTML = message;
  const modal = document.getElementById("myModal");
  modal.style.display = "flex";
  setTimeout(() => modal.classList.add("show"), 10);
}

function closeModal() {
  const modal = document.getElementById("myModal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
    document.getElementById("roomNumber").focus();
  }, 300);
}

document.querySelector("form")?.addEventListener("submit", (e) => e.preventDefault());

function selectSpecialRoom(room) {
  closeModal();
  document.getElementById("roomNumber").value = room;
  isSpecialRoom = true;
  submitRoom();
}

function showSpecialRoomOptions() {
  const specialRooms = [
    "Food Prep.", "Lobby Entrance", "Lobby Reception", "Lobby Delivery",
    "Lobby Toilet", "Exe. Office", "Canteen", "Server Room",
    "Hot Kitchen1", "Hot Kitchen2", "Cold Kitchen", "Restaurant Entrance",
    "Restaurant Bar1", "Restaurant Out door", "GYM 1", "GYM 2",
    "GYM 3", "GYM 4", "GYM 5", "Co working Entrance", "Co working Room1",
    "Co working Room2", "Co working Meeting A", "Co working Meeting B",
    "Co working Meeting C-G", "Co working Meeting H", "Co working Pod",
  ];

  let optionsHtml = `
    <h3 style="margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">เลือกพื้นที่ที่ต้องการ:</h3>
    <div style="max-height: 400px; overflow-y: auto; padding-right: 10px; margin-bottom: 15px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; padding: 5px;">`;

  specialRooms.forEach((room) => {
    optionsHtml += `
      <div style="padding: 5px;">
        <button style="width: 100%; padding: 10px; cursor: pointer; border-radius: 8px;
        background-color: #f5f5f5; border: 1px solid #ddd; transition: all 0.3s ease;
        font-size: 14px; text-align: left; overflow: hidden; text-overflow: ellipsis;"
        onmouseover="this.style.backgroundColor='#e0e0e0'"
        onmouseout="this.style.backgroundColor='#f5f5f5'"
        onclick="selectSpecialRoom('${room}')">${room}</button>
      </div>`;
  });

  optionsHtml += `
      </div>
    </div>
    <div style="text-align: center; padding-top: 10px;">
      <button style="padding: 8px 20px; cursor: pointer; background-color: #f44336; color: white;
      border: none; border-radius: 4px;" onclick="closeModal()">ยกเลิก</button>
    </div>`;

  const modal = document.getElementById("myModal");
  const modalContent = modal.querySelector(".modal-content");
  if (modalContent) {
    modalContent.style.maxWidth = "700px";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "12px";
  }

  showModal(optionsHtml);
  // ✅ จบแค่นี้ ไม่มี fetch
}

function submitRoom() {
  if (isSearching) return;

  const roomInput = document.getElementById("roomNumber");
  roomInput.blur();

  const roomNumber = roomInput.value.trim();

  if (roomNumber === "##") {
    showSpecialRoomOptions();
    return;
  }

  const specialRooms = [
    "Food Prep.", "Lobby Entrance", "Lobby Reception", "Lobby Delivery",
    "Lobby Toilet", "Exe. Office", "Canteen", "Server Room",
    "Hot Kitchen1", "Hot Kitchen2", "Cold Kitchen", "Restaurant Entrance",
    "Restaurant Bar1", "Restaurant Out door", "GYM 1", "GYM 2",
    "GYM 3", "GYM 4", "GYM 5", "Co working Entrance", "Co working Room1",
    "Co working Room2", "Co working Meeting A", "Co working Meeting B",
    "Co working Meeting C-G", "Co working Meeting H", "Co working Pod",
  ];

  const pattern = /^\d+$/;
  const roomNum = parseInt(roomNumber);
  const isValidRoom = (pattern.test(roomNumber) && roomNum >= 301)
                   || specialRooms.includes(roomNumber);

  if (!isValidRoom) {
    showModal("❌ Room number must be 301 or above!");
    return;
  }

  isSearching = true;
  resultElement.innerText = "Searching...";
  resultElement.style.color = "blue";
  loadingGif.style.display = "block";
  submitBtn.disabled = true;
  submitBtn.innerText = "Searching...";
  container.classList.add("shrink");

  if (userConfirmedOnce) {
    container.classList.remove("padding-anim");
    void container.offsetWidth;
    container.classList.add("padding-anim");
  }

  fetch(
    "https://script.google.com/macros/s/AKfycbw9dRZF5k_eVzEmq_mTs-kc1Zg-Qi-xd81UOtr4vNupyW02kIgISMc6CryF0Rt5GrfV/exec?room=" +
      encodeURIComponent(roomNumber)
  )
    .then((response) => response.json())
    .then((data) => {
      isSearching = false;
      loadingGif.style.display = "none";
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit";
      container.classList.remove("expand", "shrink");
      void container.offsetWidth;
      container.classList.add("shrink");
      userConfirmedOnce = false;

      if (data.room) {
        let deepCleanDate     = convertToBangkokTime(data.deep_clean);
        let filterAirDate     = convertToBangkokTime(data.filter_air);
        let nextTimeDate      = convertToBangkokTime(data.next_deepclean);
        let nextFilterAirDate = convertToBangkokTime(data.next_filter_air);

        resultElement.innerHTML = `
          ${iconRoom} <strong class="result-label">Room:</strong> <span class="result-green">${roomNumber}</span> <br>
          ${iconNextClean} <strong class="result-label">Next Deep Clean:</strong> <span class="result-orange">${nextTimeDate}</span> <br>
          ${iconSoap} <strong class="result-label">Latest Deep Clean:</strong> <span class="result-gray">${deepCleanDate}</span> <br>
          ${iconNextClean} <strong class="result-label">Next Air Filter Clean:</strong> <span class="result-orange">${nextFilterAirDate}</span> <br>
          ${iconAir} <strong class="result-label">Latest Air Filter Clean:</strong> <span class="result-gray">${filterAirDate}</span> <br>
        `;
        resultElement.style.color = "green";
        showModal(resultElement.innerHTML);
      } else if (data.error) {
        resultElement.innerText = data.error;
        resultElement.style.color = "red";
        showModal("❌ " + data.error);
      }
    })
    .catch(() => {
      isSearching = false;
      loadingGif.style.display = "none";
      submitBtn.disabled = false;
      submitBtn.innerText = "Submit";
      resultElement.innerText = "❌ An error occurred.";
      resultElement.style.color = "red";
      showModal("❌ Please try again.");
      container.classList.remove("expand", "shrink");
      void container.offsetWidth;
      container.classList.add("shrink");
    });
}
