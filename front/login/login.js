document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = loginForm.loginEmail.value;
        const password = loginForm.loginPassword.value;

        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            const accessToken = data.access_token;
            sessionStorage.setItem('accessToken', accessToken);
            alert('Login successful!');
            window.location.href = '../dashboard';
        } else {
            alert(`Login failed: ${data.message}`);
        }
    });
});
