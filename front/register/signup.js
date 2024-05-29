document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('signUpForm');
    
    signUpForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = signUpForm.signUpEmail.value;
        const password = signUpForm.signUpPassword.value;
        const confirmPassword = signUpForm.confirmPassword.value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Sign Up successful! Redirecting to login page...');
            window.location.href = '../';
        } else {
            alert(`Register failed: ${data.message}`);
        }
    });
});
