function validateForm() {
    const name = document.getElementById('name').value.trim();
    const namefield = document.getElementById('name');
    const commnetsfield = document.getElementById('comments');
    const comments = document.getElementById('comments').value.trim();
    const male = document.getElementById('male').checked;
    const female = document.getElementById('female').checked;

    if (name === "") {
        alert("Please enter your name.");
        console.log("Name field is empty.");
        namefield.focus();
        return false;
    }
    if (comments === "") {
        alert("Please enter your comments.");
        commentsfield.focus();
        return false;
    }
    
    if (!male && !female) {
        alert("Please select Male or Female.");
        return false;
    }

    alert("Form submitted successfully!");
    return true;
}

document.getElementById('submitBtn').onclick = function(e) {
    if (!validateForm()) {
        e.preventDefault();
    }
};