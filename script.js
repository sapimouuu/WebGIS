// Membuat peta dan menentukan titik tengah wilayah
const map = L.map('map').setView([-3.3194, 114.5908], 11);

// Menambahkan peta dasar OpenStreetMap
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);

// Membaca data rumah makan dari GeoJSON
fetch('data/rumah_makan.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('File GeoJSON tidak ditemukan');
        }
        return response.json();
    })
    .then(data => {
        //titik rumah makan di peta
        L.geoJSON(data, {
    onEachFeature: function(feature, layer) {
        const info = feature.properties;

        layer.bindPopup(`
            <b>${info.tempat}</b><br>
            ${info.alamat}<br><br>
            <b>Jam Operasional:</b> ${info.jam_buka}<br>
            <b>Kisaran Harga:</b> ${info.harga_makanan}<br><br>
            <a href="${info.link}" target="_blank">
                Lihat di Google Maps
            </a>
        `);
    }
        }).addTo(map);
    })
    .catch(error => {
        console.error('Gagal memuat GeoJSON:', error);
    });

// Menyesuaikan ukuran peta dengan container
setTimeout(() => {
    map.invalidateSize();
}, 100);


// FILTER WILAYAH DAFTAR
const regionButtons = document.querySelectorAll('.region-filter-list button');

regionButtons.forEach(button => {
    button.addEventListener('click', function() {
        regionButtons.forEach(item => {
            item.classList.remove('selected');
        });

        this.classList.add('selected');
    });
});

// RESET FILTER
const resetFilter = document.getElementById('resetFilter');

if (resetFilter) {
    resetFilter.addEventListener('click', function() {
        document.getElementById('searchRestaurant').value = '';
        document.getElementById('filterHours').selectedIndex = 0;
        document.getElementById('filterPrice').selectedIndex = 0;
        document.getElementById('sortRestaurant').selectedIndex = 0;

        regionButtons.forEach(button => {
            button.classList.remove('selected');
        });

        regionButtons[0].classList.add('selected');
    });
}