const image = document.querySelector('.menu-icon-container');
const hiddenDiv = document.querySelector('.menu-container');
const icon = document.querySelector(".menu")

image.addEventListener('mouseenter', () => {
  hiddenDiv.style.display = 'block';
  icon.style.filter = "brightness(0) invert(1)";
});

hiddenDiv.addEventListener('mouseenter',() => {
  hiddenDiv.style.display = 'block';
});

const hideDiv = () => {
  hiddenDiv.style.display = 'none';
};

image.addEventListener('mouseleave', hideDiv);
hiddenDiv.addEventListener('mouseleave', hideDiv);




function toggleRadio() {
  const radioBtn = document.getElementById('radio-btn');
  const currentSrc = radioBtn.getAttribute('src');

  if (currentSrc.includes('icons/radio-button-on.svg')) {
    radioBtn.setAttribute('src', 'icons/radio-button-on.svg');
  } else {
    radioBtn.setAttribute('src', 'icons/radio-off.svg');
  }
}

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const eyeIcon = document.getElementById('eye-icon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    eyeIcon.src = 'icons/preview.svg'; 
  } else {
    passwordInput.type = 'password';
    eyeIcon.src = 'icons/preview.svg'; }
}


  const headers = document.querySelectorAll('.selectable');

  headers.forEach(header => {
    header.addEventListener('click', () => {
      headers.forEach(h => h.classList.remove('active'));
      header.classList.add('active');
    });
  });

 const tabs = document.querySelectorAll('.clickable');

 tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('current'));
      tab.classList.add('current');
    } )
 }
 )

function toggleMenu(element) {
    element.classList.toggle("active");
  }

  function selectMenu(selectedItem) {
    
    const allItems = document.querySelectorAll(".menu-item");
    allItems.forEach(item => item.classList.remove("selected"));

    selectedItem.classList.add("selected");
  }

const courses = [
    { Expired : false,
      star : true,
      image:"images/imageMask.png",
      title: "Acceleration",
      subject:"Physics",
      grade:" 7",
      additional: "+2",
      units:"4",
      lessons:"18",
      topics :"24",
      dropdownOptions: ["Mr. Frank Class A", "Mr. Frank Class B","Mr. Frank Class C"],
      students:"50",
      startdate:"21-Jan-2020",
      enddate:"21-Aug-2020",
      iconsEnabled: { view: true, calender: true, favourite: true, dashboard: true }
      },
    {  Expired : false,
      star : true,
      image:"images/imageMask-1.png",
      title: "Displacement, Velocity and Speed",
      subject:"Physics 2" ,
      grade:" 6",
      additional: "+3",
      units:"2",
      lessons:"15",
      topics :"20",
      dropdownOptions: [],
      students: "",
      startdate:"",
      enddate:"",
      iconsEnabled: { view: true, calender: false, favourite: false, dashboard: true } },
    {  Expired : false,
      star : true,
      image:"images/imageMask-3.png",
      title: "Introduction to Biology: Micro organisms and how they affec...",
      subject:"Biology",
      grade:" 4",
      additional: "+1",
      units:"5",
      lessons:"16",
      topics :"22",
      dropdownOptions: ["All Classes", "Mr. Frank Class B","Mr. Frank Class C"],
      students:"300",
      startdate:"",
      enddate:"",
      iconsEnabled: { view: true, calender: false, favourite: false, dashboard: true } },
       {  Expired : true,
      star : false,
      image:"images/imageMask-2.png",
      title: "Introduction to High School Mathematics",
      subject:"Mathematics",
      grade:"8",
      additional: "+3",
      units:"",
      lessons:"",
      topics :"",
      dropdownOptions: ["All Classes", "Mr. Frank Class A","Mr. Frank Class C"],
      students:"44",
      startdate:"14-Oct-2019",
      enddate:"20-Oct-2020",
      iconsEnabled: { view: true, calender: true, favourite: true, dashboard: true } },
      
  ];
 const course_container = document.getElementById("courses");

 const iconMap = {
    view: "icons/preview.svg",
    calender: "icons/manage course.svg",
    favourite: "icons/grade submissions.svg",
    dashboard: "icons/reports.svg"
  };

 courses.forEach(course => {
    const card = document.createElement("div");
    card.className = "card" + (course.Expired ? " expired" : "");

    let dropdownHTML = "";

if (course.dropdownOptions.length > 0) {
  dropdownHTML = `
    <div class="custom-select">
      <select name="class" id="dropdown">
        <option value="" disabled selected hidden >Classes</option>
        ${course.dropdownOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
      </select>
    </div>
  `;
} else {
  dropdownHTML = `
    <div class="custom-select">
      <select name="class" id="dropdown" disabled>
        <option>No classes</option>
      </select>
    </div>
  `;
}

    
    let iconsHTML = "";
    for (const [key, enabled] of Object.entries(course.iconsEnabled)) {
      const iconClass = enabled ? "icon" : "icon disabled";
      iconsHTML += `<span class="${iconClass}" title="${key} style="">
                <img class="icon-img ${key}-icon" src="${iconMap[key]}" alt="${key}" >
              </span>`;

    }

    card.innerHTML = `
    
    <div class="course-details" style="padding-bottom:16px;border-bottom:1px solid #ccc;margin-right:24px;font-family:'Quicksand';font-weight:600px;">
    <div class="image-div">
    <img src="${course.image}" alt="${course.title}" style="border-radius: 2px;">
    </div>
    <div class="specifications">
    <div style="display:flex; align-items:flex-start;">
       <div class="card-title" style="font-size:16px;width:260px;font-weight:600px;">${course.title}</div>
       ${course.star ? '<img src = "icons/favourite.svg" class="star-icon" >' : ''}
    </div>
    <div style="display:flex; margin-top:10px;">
       <div class="info" style="font-size:12px;font-weight:600px;color:#666666">${course.subject}</div>
       <div class="info" style="font-size:12px;margin-left: 18px;display:flex;font-weight:600px;color:#666666" >Grade  ${course.grade} <div style="color:#1F7A54;margin-left:2px;"> ${course.additional}</div></div>
    </div>
      <div style="display:flex; margin-top: 5px; ">
        ${course.units ? `<div class="info" style="font-size:12px;display:flex;"><strong>${course.units}</strong><div style="font-weight:600px;margin-left:2px;color:#666666">Units</div> </div>` : ''}
        ${course.lessons ? `<div class="info" style="font-size:12px; margin-left:6px;display:flex;"><strong>${course.lessons}</strong> <div style="font-weight:600px;margin-left:2px;color:#666666">Lessons</div></div>` : ''}
        ${course.topics ? `<div class="info" style="font-size:12px; margin-left:6px;display:flex;"><strong>${course.topics}</strong> <div style="font-weight:600px;margin-left:2px;color:#666666">Topics</div></div>` : ''}
      </div>
       ${dropdownHTML}
      <div style="display:flex; margin-top: 5px;">
        ${course.students ? `<div class="info" style="font-size:12px;font-weight:600px;color:#666666">${course.students} Students</div>` : ''}
        ${course.startdate ? `<div class="info" style="font-size:12px; margin-left:17px;font-weight:600px;color:#666666">${course.startdate} - </div>` : ''}
        ${course.enddate ? `<div class="info" style="font-size:12px; margin-left:2px;font-weight:600px;color:#666666">${course.enddate}</div>` : ''}
      </div>

    </div>
    </div>
    <div style="padding-left:24px;padding-right:24px;display:flex;gap:100px;margin-top:18px;padding-bottom:9px;">${iconsHTML}</div>
    `;

    const wrapper = document.createElement("div");
  wrapper.className = "card-wrapper";
  if (course.Expired) {
    wrapper.innerHTML = `<div class="expired-label">Expired</div>`;
  }
  wrapper.appendChild(card);
  course_container.appendChild(wrapper);
});

const announcements = [
  {
    pa: "Wilson Kumar",
    seen : true,
    message : "No classes will be held on 21st Nov",
    course : "",
    attachments : 2,
    date : "15-Sep-2018",
    time : "07:21 pm"
  },
   {
    pa: "Samson White",
    seen : false,
    message : "Guest lecture on Geometry on 20th September",
    course : "",
    attachments : 2 ,
    date : "15-Sep-2018",
    time : "07:21 pm"
  },
   {
    pa: "Wilson Kumar",
    seen : true,
    message : "Additional course materials available on request",
    course : "Mathematics 101",
    attachments : 0,
    date : "15-Sep-2018",
    time : "07:21 pm"
  },
   {
    pa: "Wilson Kumar",
    seen : false,
    message : "No classes will be held on 25th Dec",
    course : "",
    attachments : 0,
    date : "15-Sep-2018",
    time : "07:21 pm"
  },
   {
    pa: "Wilson Kumar",
    seen : false,
    message : "Additional course materials available on request",
    course : "Mathematics 101",
    attachments : 0,
    date : "15-Sep-2018",
    time : "07:21 pm"
  },
   {
    pa: "Wilson Kumar",
    seen : true,
    message : "No classes will be held on 21st Nov",
    course : "",
    attachments : 2,
    date : "15-Sep-2018",
    time : "07:21 pm"
  }
]

const announcements_tab = document.getElementsByClassName("announcements-tab");
announcements.forEach(announcement => {
   const card = document.createElement("div");
    card.className = "card" + (announcement.seen ? " seen" : "");
    

})
