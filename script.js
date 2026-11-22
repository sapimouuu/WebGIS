// Membuat peta dan menentukan titik tengah wilayah
const map = L.map('map').setView([-3.3194, 114.5908], 11);

// Menambahkan peta dasar OpenStreetMap
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);

//data dari geojson
let allFeatures = [];
let resultLayer;
fetch('data/rumah_makan.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('File GeoJSON tidak ditemukan');
        }
        return response.json();
    })
    
//menampilkan data rumah makan
.then(data => {
    allFeatures = data.features;
    function updateMap(filteredData) {
        // Menghapus marker sebelumnya
        map.removeLayer(resultLayer);

        //menampilkan marker dri hasil filter
        resultLayer = L.geoJSON(filteredData, {
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
    }
    
    // Fungsi mencari rumah makan berdasarkan nama atau alamat
    function searchRestaurant(keyword) {
        return allFeatures.filter(feature => {
            const info = feature.properties;

            return (
                info.tempat.toLowerCase().includes(keyword.toLowerCase()) ||
                info.alamat.toLowerCase().includes(keyword.toLowerCase())
            );
        });
    }

    resultLayer = L.geoJSON(data, {
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

    // Mengambil elemen hasil pencarian
    const resultCount = document.querySelector('.result-header span');
    const resultSection = document.querySelector('.result-section');
    const emptyResult = document.querySelector('.empty-result');

    // Membuat dropdown daftar rumah makan
    const dropdown = document.createElement('details');
    dropdown.className = 'result-dropdown';

    const dropdownTitle = document.createElement('summary');
    dropdownTitle.textContent = 'Lihat Daftar Rumah Makan';

    const resultList = document.createElement('div');
    resultList.className = 'result-list';

    dropdown.appendChild(dropdownTitle);
    dropdown.appendChild(resultList);

    data.features.forEach((feature, index) => {
        const info = feature.properties;
        const item = document.createElement('button');

        item.className = 'result-item';
        item.textContent = info.tempat;

        // Klik nama untuk membuka lokasi pada peta
        item.addEventListener('click', function() {
            const layer = resultLayer.getLayers()[index];

            map.setView(layer.getLatLng(), 16);
            layer.openPopup();
        });

        resultList.appendChild(item);
    });

    // Memperbarui jumlah dan isi hasil pencarian
    resultCount.textContent = `${data.features.length} lokasi`;
    emptyResult.remove();
    resultSection.appendChild(dropdown);

    const searchInput = document.getElementById('search');

    searchInput.addEventListener('input', function() {
        const keyword = this.value.trim();

        // Mengambil data sesuai kata pencarian
        const filteredFeatures = searchRestaurant(keyword);

        // Memperbarui jumlah hasil
        resultCount.textContent = `${filteredFeatures.length} lokasi`;

        // Memperbarui marker pada peta
        updateMap({
            type: 'FeatureCollection',
            features: filteredFeatures
        });
        // Memperbarui daftar rumah makan
        resultList.innerHTML = '';

        filteredFeatures.forEach((feature, index) => {
            const info = feature.properties;
            const item = document.createElement('button');

            item.className = 'result-item';
            item.textContent = info.tempat;

            item.addEventListener('click', function() {
                const layer = resultLayer.getLayers()[index];
                map.setView(layer.getLatLng(), 16);
                layer.openPopup();
            });

            resultList.appendChild(item);
        });
    })
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