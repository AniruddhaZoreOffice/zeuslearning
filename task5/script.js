// code to hover on menubar
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
  icon.style.filter = "";
};

image.addEventListener('mouseleave', hideDiv);
hiddenDiv.addEventListener('mouseleave', hideDiv);



// code to hover on announcements
const announcemen_container = document.querySelector('.announcements')
const announcemen_icon = document.querySelector('.announcement-icon');
const announcement_div = document.querySelector('.announcements-tab');
const count = document.querySelector(".count1")

announcemen_container.addEventListener('mouseenter', () => {
  announcement_div.style.display = 'block';
  announcemen_icon.style.filter = "brightness(0) invert(1)";
  count.style.display = 'none';
});

announcement_div.addEventListener('mouseenter',() => {
  announcement_div.style.display = 'block';
});

const hideDiv2 = () => {
  announcement_div.style.display = 'none';
  announcemen_icon.style.filter = "";
  count.style.display = 'block';
};

announcemen_container.addEventListener('mouseleave', hideDiv2);
announcement_div.addEventListener('mouseleave', hideDiv2);


function toggleRadio(buttonId) {
  const radioBtn = document.getElementById(buttonId);
  const currentSrc = radioBtn.getAttribute('src');
  
  
  if (currentSrc.includes('radio-button-on.svg')) {
    radioBtn.setAttribute('src', 'icons/radio-off.svg');
  } else {
    
    const allRadioBtns = document.querySelectorAll('.radio-button-section img');
    allRadioBtns.forEach(btn => btn.setAttribute('src', 'icons/radio-off.svg'));
    
   
    radioBtn.setAttribute('src', 'icons/radio-button-on.svg');
  }
}

function toggleCheckbox() {
  const checkboxImg = document.getElementById('checkbox-img');
  const currentSrc = checkboxImg.getAttribute('src');

  if (currentSrc.includes('checkbox-unchecked.svg')) {
    checkboxImg.setAttribute('src', 'icons/checkbox-checked.svg');
  } else {
    checkboxImg.setAttribute('src', 'icons/checkbox-unchecked.svg');
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
    
    <div class="course-details" style="padding-bottom:16px;border-bottom:1px solid #ccc;margin-right:24px;font-family:'Quicksand';font-weight:500px;">
    <div class="image-div">
    <img src="${course.image}" alt="${course.title}" style="border-radius: 2px;">
    </div>
    <div class="specifications">
    <div style="display:flex; align-items:flex-start;">
       <div class="card-title" style="font-size:16px;width:260px;font-weight:500px;">${course.title}</div>
       ${course.star ? '<img src = "icons/favourite.svg" class="star-icon" >' : '<img src = "icons/favourite.svg" style="filter: grayscale(1)" class="star-icon" >'}
    </div>
    <div style="display:flex; margin-top:10px;">
       <div class="info" style="font-size:12px;color:#666666;border-right: 1px solid #ccc;height:13px;padding-right: 9px;">${course.subject}</div>
       <div class="info" style="font-size:12px;margin-left: 9px;display:flex;font-weight:500px;color:#666666;" >Grade  ${course.grade} <div style="color:#1F7A54;margin-left:2px;"> ${course.additional}</div></div>
    </div>
      <div style="display:flex; margin-top: 5px; " class="card-units">
        ${course.units ? `<div class="info" style="font-size:12px;display:flex;font-wieght:700px;">${course.units}<div style="font-weight:500px;margin-left:2px;color:#666666">Units</div> </div>` : ''}
        ${course.lessons ? `<div class="info" style="font-size:12px; margin-left:6px;display:flex;font-wieght:700px;">${course.lessons} <div style="font-weight:500px;margin-left:2px;color:#666666">Lessons</div></div>` : ''}
        ${course.topics ? `<div class="info" style="font-size:12px; margin-left:6px;display:flex;font-wieght:700px;">${course.topics} <div style="font-weight:500px;margin-left:2px;color:#666666">Topics</div></div>` : ''}
      </div>
       ${dropdownHTML}
      <div style="display:flex; margin-top: 5px;" class="card-units2">
        ${course.students ? `<div class="info" style="font-size:12px;font-weight:500px;color:#666666;margin-right:9px;">${course.students} Students</div>` : ''}
        ${course.startdate ? `<div class="info" id="startdatetab"style="font-size:12px; height:13px;color:#666666">${course.startdate} - </div>` : ''}
        ${course.enddate ? `<div class="info" id="enddatetab" style="font-size:12px; margin-left:2px;color:#666666">${course.enddate}</div>` : ''}
      </div>

    </div>
    </div>
    <div class="card-footer">${iconsHTML}</div>
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

const announcements_tab = document.getElementsByClassName("announcements-tab2")[0];

announcements.forEach(announcement => {
   const card1 = document.createElement("div");
    card1.className = "announcement" + (announcement.seen ? "seen" : "unseen");
        
    card1.innerHTML = `
    <div style="display:flex;justify-content:space-between;">
      <div style="font-size: 12px;color:#6E6E6E;display:flex;">
      PA : <div style="color: #222222;margin-left:2px;">
      ${announcement.pa}
      </div>
      </div>
      ${announcement.seen ? '<img src = "icons/tick_icon.png" class="seen-icon" style="width:15px;height:15px;">' : '<img src = "icons/minus.svg" class="seen-icon" style="width:15px;height:15px;">'}
    </div>
    <div style="color:#222222;font-size:14px;margin-top:8px;">
    ${announcement.message}
    </div>
    <div style="font-size:12px;color:#6E6E6E">
       ${announcement.course ? `<div style="margin-top:8px">Course : ${announcement.course}</div>` : ''}
    </div>
    <div style="font-size:12px;color:#6E6E6E;margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
    <div>
    ${announcement.attachments ? `<div style="display:flex;align-items:center;"><img src="icons/attach.svg" alt="attachment-icon" style="height:14px;width:14px;"> ${announcement.attachments} files are attached</div>` : ''}
    </div>
    <div>
    <div> ${announcement.date} at ${announcement.time} </div>
    </div>
    </div>
    
    
    `;
    announcements_tab.appendChild(card1);

})

// code to hover alerts
const alerts = [
  {
    seen : false,
    message : "License for Introduction to Algebra has been assigned to your school",
    course : "",
    class : "",
    date : "15-Sep-2018",
    time : "07:21 pm"
  },
     {
    seen : true,
    message : "Lesson 3 Practice Worksheet overdue for Amy Santiago",
    course : "Advanced Mathematics ",
    class : "",
    date : "15-Sep-2018",
    time : "05:21 pm"
  },
     {
    seen : false,
    message : "23 new students created",
    course : "",
    class : "",
    date : "14-Sep-2018",
    time : "01:21 pm"
  },
     {
    seen : false,
    message : "15 submissions ready for evaluation",
    course : "",
    class : "Basics of Algebra",
    date : "13-Sep-2018",
    time : "01:15 pm"
  },
     {
    seen : false,
    message : "License for Basic Concepts in Geometry has been assigned to your... school",
    course : "",
    class : "",
    date : "15-Sep-2018",
    time : "07:21 pm"
  },
     {
    seen : false,
    message : "Lesson 3 Practice Worksheet overdue for Sam Diego",
    course : "",
    class : "Advanced Mathematics",
    date : "12-Sep-2018",
    time : "07:21 pm"
  }
]


const alerts_tab = document.getElementsByClassName("alerts-tab2")[0];

alerts.forEach(alert => {
   const card2 = document.createElement("div");
    card2.className = "alert" + (alert.seen ? "seen" : "unseen");
        
    card2.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
    <div style="color:#222222;font-size:14px;margin-top:8px;">
    ${alert.message}
    </div>
    <div>
        ${alert.seen ? '<img src = "icons/tick_icon.png" class="seen-icon" style="width:15px;height:15px;">' : '<img src = "icons/minus.svg" class="seen-icon" style="width:15px;height:15px;">'}
    </div>
    </div>
    <div style="font-size:12px;color:#6E6E6E;">
       ${alert.course ? `<div style="margin-top:8px;display:flex;">Course : <div style="color:#222222;"> &nbsp${alert.course}</div></div>` : ''}
    </div>
    <div style="font-size:12px;color:#6E6E6E;";">
       ${alert.class ? `<div style="margin-top:8px;display:flex;">Class : <div style="color:#222222;"> &nbsp<strong>${alert.class}</strong></div></div>` : ''}
    </div>
    <div style="font-size:12px;color:#6E6E6E;margin-top:8px;display:flex;justify-content:flex-end;align-items:center;">
     ${alert.date} at ${alert.time} 
    </div>
    
    
    `;
    alerts_tab.appendChild(card2);

})

const alerts_container = document.querySelector('.notifications')
const alert_icon = document.querySelector('.alert-icon');
const alert_div = document.querySelector('.alerts-tab');
const count1 = document.querySelector(".count")

alerts_container.addEventListener('mouseenter', () => {
  alert_div.style.display = 'block';
  alert_icon.style.filter = "brightness(0) invert(1)";
  count1.style.display = 'none';
});

alert_div.addEventListener('mouseenter',() => {
  alert_div.style.display = 'block';
});

const hideDiv3 = () => {
  alert_div.style.display = 'none';
  alert_icon.style.filter = "";
  count1.style.display = 'block';
};

alerts_container.addEventListener('mouseleave', hideDiv3);
alert_div.addEventListener('mouseleave', hideDiv3);
