function validateForm() {
    

    const name = document.getElementById('name').value.trim();
    const comments = document.getElementById('comments').value.trim();
    const male = document.getElementById('male').checked;
    const female = document.getElementById('female').checked;

    if (name === "") {
        document.getElementById('name').focus();
        alert("Please enter your name.");
        return false;
    }
    if (comments === "") {
        document.getElementById('comments').focus();
        alert("Please enter your comments.");
        return false;
    }
    if (!male && !female) {
        alert("Please select Male or Female.");
        return false;
    }

    alert("Form submitted successfully!");
    return true;
};
