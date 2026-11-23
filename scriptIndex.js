
const searchForm = document.getElementById('searchForm');

searchForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const keyword = document.getElementById('searchInput').value.trim();

    const selectedRegions = Array.from(
        document.querySelectorAll('.region-options input:checked')
    ).map(input => input.value.toLowerCase());

    const params = new URLSearchParams();

    if (keyword) {
        params.set('cari', keyword);
    }

    if (selectedRegions.length > 0) {
        params.set('wilayah', selectedRegions.join(','));
    }

    window.location.href = 'peta.html?' + params.toString();
});