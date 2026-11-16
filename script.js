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