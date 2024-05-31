function enableForm() {
    const form = document.getElementById('userInfo');
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => input.disabled = false);
    document.getElementById('saveButton').disabled = false;
}