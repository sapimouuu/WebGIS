
// MEMBUAT PETA
const map = L.map('map').setView([-3.3194, 114.5908], 11);

// PETA DASAR OPENSTREETMAP
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// VARIABEL DATA
let allFeatures = [];
let resultLayer;

// ELEMEN HTML
const searchInput = document.getElementById('search');
const regionButtons = document.querySelectorAll('.region-list button');
const operationalFilter = document.getElementById('operasional');
const priceFilter = document.getElementById('harga');
const resultCount = document.querySelector('.result-header span');
const resultSection = document.querySelector('.result-section');
const emptyResult = document.querySelector('.empty-result');

// DROPDOWN DAFTAR RUMAH MAKAN
const dropdown = document.createElement('details');
dropdown.className = 'result-dropdown';

const dropdownTitle = document.createElement('summary');
dropdownTitle.textContent = 'Lihat Daftar Rumah Makan';

const resultList = document.createElement('div');
resultList.className = 'result-list';

dropdown.appendChild(dropdownTitle);
dropdown.appendChild(resultList);

// WILAYAH BERDASARKAN ALAMAT
function filterRegion(feature, region) {
    if (region === 'Semua Wilayah') return true;

    const address = feature.properties.alamat.toLowerCase();

    if (region === 'Banjarmasin') {
        return address.includes('banjarmasin');
    }

    if (region === 'Banjarbaru') {
        return address.includes('banjarbaru') ||
               address.includes('banjar baru');
    }

    if (region === 'Martapura') {
        return address.includes('martapura');
    }

    return true;
}

// MEMERIKSA JAM OPERASIONAL
function isOpen24Hours(hours) {
    return hours.toLowerCase().includes('buka 24 jam');
}

function isOpenAfter23(hours) {
    const text = hours.trim();

    if (isOpen24Hours(text)) return true;

    const match = text.match(
        /(\d{1,2})[.:](\d{2})\s*[–—-]\s*(\d{1,2})[.:](\d{2})/
    );

    if (!match) return false;

    const start = Number(match[1]) * 60 + Number(match[2]);
    let end = Number(match[3]) * 60 + Number(match[4]);

    // Jika melewati tengah malam
    if (end <= start) {
        end += 1440;
    }

    // Pukul 23.00 = 1380 menit
    return start <= 1380 && end > 1380;
}

// FILTER HARGA BERDASARKAN BATAS DATA
function filterPrice(price, selectedPrice) {
    if (selectedPrice === '') return true;

    const match = price.match(/<\s*Rp\s*([\d.]+)/i);

    if (!match) return false;

    const limit = Number(match[1].replace(/\./g, ''));

    if (selectedPrice === '15000') {
        return limit <= 15000;
    }

    if (selectedPrice === '25000') {
        return limit > 15000 && limit <= 25000;
    }

    if (selectedPrice === '50000') {
        return limit > 25000;
    }

    return true;
}

// MENAMPILKAN POPUP
function createPopup(feature, layer) {
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

// MEMPERBARUI PETA DAN DAFTAR
function updateResults() {
    const keyword = searchInput.value.trim().toLowerCase();

    const activeRegion = document.querySelector(
        '.region-list button.active'
    );

    const region = activeRegion
        ? activeRegion.textContent.trim()
        : 'Semua Wilayah';

    const operational = operationalFilter.value;
    const price = priceFilter.value;

    const filteredFeatures = allFeatures.filter(feature => {
        const info = feature.properties;

        const matchSearch =
            info.tempat.toLowerCase().includes(keyword) ||
            info.alamat.toLowerCase().includes(keyword);

        const matchArea = filterRegion(feature, region);

        let matchOperational = true;

        if (operational === '23') {
            matchOperational =
                isOpenAfter23(info.jam_buka) &&
                !isOpen24Hours(info.jam_buka);
        } else if (operational === '00') {
            matchOperational = isOpen24Hours(info.jam_buka);
        }

        const matchPrice = filterPrice(
            info.harga_makanan,
            price
        );

        return matchSearch &&
               matchArea &&
               matchOperational &&
               matchPrice;
    });

    // HAPUS MARKER LAMA
    if (resultLayer) {
        map.removeLayer(resultLayer);
    }

    // TAMPILKAN MARKER BARU
    resultLayer = L.geoJSON({
        type: 'FeatureCollection',
        features: filteredFeatures
    }, {
        onEachFeature: createPopup
    }).addTo(map);

    // PERBARUI JUMLAH HASIL
    resultCount.textContent = `${filteredFeatures.length} lokasi`;

    // PERBARUI DAFTAR RUMAH MAKAN
    resultList.innerHTML = '';

    filteredFeatures.forEach((feature, index) => {
        const item = document.createElement('button');

        item.className = 'result-item';
        item.textContent = feature.properties.tempat;

        item.addEventListener('click', function() {
            const layer = resultLayer.getLayers()[index];

            map.setView(layer.getLatLng(), 16);
            layer.openPopup();
        });

        resultList.appendChild(item);
    });

    // PESAN JIKA HASIL KOSONG
    if (filteredFeatures.length === 0) {
        if (!document.querySelector('.no-result')) {
            const message = document.createElement('p');
            message.className = 'no-result';
            message.textContent = 'Rumah makan tidak ditemukan.';
            resultList.appendChild(message);
        }
    }
}

// AMBIL DATA GEOJSON
fetch('data/rumah_makan.geojson')
    .then(response => {
        if (!response.ok) {
            throw new Error('File GeoJSON tidak ditemukan');
        }

        return response.json();
    })
    .then(data => {
        allFeatures = data.features;

        // HAPUS PESAN AWAL
        if (emptyResult) {
            emptyResult.remove();
        }

        // TAMBAHKAN DROPDOWN
        resultSection.appendChild(dropdown);

        // TAMPILKAN SEMUA DATA PADA AWAL
        updateResults();

        // PENCARIAN
        searchInput.addEventListener('input', updateResults);

        // FILTER WILAYAH
        regionButtons.forEach(button => {
            button.addEventListener('click', function() {
                regionButtons.forEach(item => {
                    item.classList.remove('active');
                });

                this.classList.add('active');

                updateResults();
            });
        });

        // FILTER JAM OPERASIONAL
        operationalFilter.addEventListener('change', updateResults);

        // FILTER HARGA
        priceFilter.addEventListener('change', updateResults);
    })
    .catch(error => {
        console.error('Gagal memuat GeoJSON:', error);
    });

// MENYESUAIKAN UKURAN PETA
setTimeout(() => {
    map.invalidateSize();
}, 100);