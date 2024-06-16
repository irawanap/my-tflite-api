document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('uploadedImage');
            img.src = e.target.result;
            img.style.display = 'block';

            const video = document.getElementById('video');
            const canvas = document.getElementById('canvas');
            video.style.display = 'none';
            canvas.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('scanButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select an image file.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const result = await response.json();
        document.getElementById('result').innerText = 'Result: ' + result.prediction;
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerText = 'Error scanning image.';
    }
});

document.getElementById('cameraButton').addEventListener('click', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const captureButton = document.getElementById('captureButton');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;
            video.style.display = 'block';
            captureButton.style.display = 'block';

            captureButton.addEventListener('click', () => {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                video.style.display = 'none';
                captureButton.style.display = 'none';
                const imageDataUrl = canvas.toDataURL('image/png');
                const img = document.getElementById('uploadedImage');
                img.src = imageDataUrl;
                img.style.display = 'block';

                stream.getTracks().forEach(track => track.stop());

                fetch(imageDataUrl)
                    .then(res => res.blob())
                    .then(blob => {
                        const file = new File([blob], 'capture.png', { type: 'image/png' });
                        const formData = new FormData();
                        formData.append('file', file);

                        fetch('/predict', {
                            method: 'POST',
                            body: formData
                        })
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            return response.json();
                        })
                        .then(result => {
                            document.getElementById('result').innerText = 'Result: ' + result.prediction;
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            document.getElementById('result').innerText = 'Error scanning image.';
                        });
                    });
            });
        })
        .catch((error) => {
            console.error('Error accessing the camera:', error);
        });
});

document.getElementById('navbar-toggle').addEventListener('click', () => {
    const menu = document.getElementById('navbar-menu');
    menu.classList.toggle('active');
});
