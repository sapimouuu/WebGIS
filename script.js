// Membuat peta dan menentukan titik tengah wilayah
const map = L.map('map').setView([-3.3194, 114.5908], 11);

// Menambahkan peta dasar OpenStreetMap
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);

// Menyesuaikan ukuran peta dengan container
setTimeout(() => {
    map.invalidateSize();
}, 100);
