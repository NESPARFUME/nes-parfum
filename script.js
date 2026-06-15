// Veri Depolama
let parfumler = JSON.parse(localStorage.getItem('parfumler')) || [];
let sepet = JSON.parse(localStorage.getItem('sepet')) || [];

// Sayfa Yüklendiğinde
window.addEventListener('DOMContentLoaded', () => {
    urunleriGoster();
    sepetGuncelle();
});

// Admin Panelini Aç/Kapat
function toggleAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    adminPanel.classList.toggle('hidden');
}

// Parfüm Ekle
function parfumEkle() {
    const adi = document.getElementById('parfumAdi').value.trim();
    const fiyat = parseFloat(document.getElementById('parfumFiyat').value);
    const foto = document.getElementById('parfumFoto').value.trim();

    if (!adi || !fiyat || !foto) {
        alert('⚠️ Lütfen tüm alanları doldurun!');
        return;
    }

    const yeniParfum = {
        id: Date.now(),
        adi: adi,
        fiyat: fiyat,
        foto: foto
    };

    parfumler.push(yeniParfum);
    localStorage.setItem('parfumler', JSON.stringify(parfumler));

    // Formu Sıfırla
    document.getElementById('parfumAdi').value = '';
    document.getElementById('parfumFiyat').value = '';
    document.getElementById('parfumFoto').value = '';

    alert('✅ Parfüm başarıyla eklendi!');
    urunleriGoster();
}

// Ürünleri Göster
function urunleriGoster() {
    const container = document.getElementById('urunlerListesi');
    container.innerHTML = '';

    if (parfumler.length === 0) {
        container.innerHTML = '<p class="empty-cart">Henüz parfüm eklenmedi</p>';
        return;
    }

    parfumler.forEach(parfum => {
        const card = document.createElement('div');
        card.className = 'urun-card';
        card.innerHTML = `
            <img src="${parfum.foto}" alt="${parfum.adi}" class="urun-foto" onerror="this.src='https://via.placeholder.com/200?text=Perfume'">
            <div class="urun-info">
                <div class="urun-adi">${parfum.adi}</div>
                <div class="urun-fiyat">${parfum.fiyat} ₺</div>
                <div class="urun-miktar">
                    <label>Miktar:</label>
                    <input type="number" id="miktar-${parfum.id}" value="1" min="1" max="10">
                </div>
                <button class="btn-sepete-ekle" onclick="sepetiEkle(${parfum.id})">🛒 Sepete Ekle</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Sepete Ekle
function sepetiEkle(parfumId) {
    const miktar = parseInt(document.getElementById(`miktar-${parfumId}`).value);
    const parfum = parfumler.find(p => p.id === parfumId);

    if (!parfum) return;

    // Sepette var mı kontrol et
    const mevcutItem = sepet.find(item => item.id === parfumId);

    if (mevcutItem) {
        mevcutItem.miktar += miktar;
    } else {
        sepet.push({
            id: parfumId,
            adi: parfum.adi,
            fiyat: parfum.fiyat,
            miktar: miktar
        });
    }

    localStorage.setItem('sepet', JSON.stringify(sepet));
    sepetGuncelle();
    alert('✅ Ürün sepete eklendi!');
}

// Sepeti Güncelle
function sepetGuncelle() {
    const sepetListesi = document.getElementById('sepetListesi');
    const toplamFiyat = document.getElementById('toplamFiyat');

    if (sepet.length === 0) {
        sepetListesi.innerHTML = '<p class="empty-cart">Henüz ürün seçilmedi</p>';
        toplamFiyat.textContent = '0';
        return;
    }

    let html = '';
    let toplam = 0;

    sepet.forEach((item, index) => {
        const subtotal = item.fiyat * item.miktar;
        toplam += subtotal;
        html += `
            <div class="sepet-item">
                <div>
                    <strong>${item.adi}</strong><br>
                    ${item.fiyat} ₺ x ${item.miktar} = ${subtotal} ₺
                </div>
                <button onclick="sepetten Cikar(${index})" style="background: #ff4444; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">🗑️ Sil</button>
            </div>
        `;
    });

    sepetListesi.innerHTML = html;
    toplamFiyat.textContent = toplam.toFixed(2);
}

// Sepetten Çıkar
function sepettenCikar(index) {
    sepet.splice(index, 1);
    localStorage.setItem('sepet', JSON.stringify(sepet));
    sepetGuncelle();
}

// Siparişi Hazırla
function siparisHazirla() {
    const musteriAdi = document.getElementById('musteriAdi').value.trim();
    const musteriTelefon = document.getElementById('musteriTelefon').value.trim();
    const musteriAdresi = document.getElementById('musteriAdresi').value.trim();

    if (!musteriAdi || !musteriTelefon || !musteriAdresi) {
        alert('⚠️ Lütfen tüm alanları doldurun!');
        return;
    }

    if (sepet.length === 0) {
        alert('⚠️ Lütfen sepete ürün ekleyin!');
        return;
    }

    // Onay Modal Göster
    showOnayModal(musteriAdi, musteriTelefon, musteriAdresi);
}

// Onay Modal Göster
function showOnayModal(musteriAdi, musteriTelefon, musteriAdresi) {
    const modal = document.getElementById('onayModal');
    const onayListesi = document.getElementById('onayListesi');
    const onayToplam = document.getElementById('onayToplam');

    let html = `
        <div class="onay-item">
            <strong>Müşteri Bilgileri:</strong><br>
            Ad: ${musteriAdi}<br>
            Telefon: ${musteriTelefon}<br>
            Adres: ${musteriAdresi}
        </div>
        <div class="onay-item" style="margin-top: 15px;">
            <strong>Sipariş Detayları:</strong><br>
    `;

    let toplam = 0;
    sepet.forEach(item => {
        const subtotal = item.fiyat * item.miktar;
        toplam += subtotal;
        html += `${item.adi} x${item.miktar} = ${subtotal} ₺<br>`;
    });

    html += '</div>';

    onayListesi.innerHTML = html;
    onayToplam.textContent = toplam.toFixed(2);

    // Modal store'a kaydet
    window.currentOrder = {
        musteriAdi,
        musteriTelefon,
        musteriAdresi,
        sepet: [...sepet],
        toplam
    };

    modal.classList.remove('hidden');
}

// Modal Kapat
function closeModal() {
    document.getElementById('onayModal').classList.add('hidden');
}

// Siparişi Onayla ve Gönder
function siparisOnayla() {
    const order = window.currentOrder;

    if (!order) return;

    // Siparişi localStorage'a kaydet (admin görsün diye)
    let siparisler = JSON.parse(localStorage.getItem('siparisler')) || [];
    const siparisNo = 'NES' + Date.now();

    const yeniSiparis = {
        siparisNo: siparisNo,
        tarih: new Date().toLocaleString('tr-TR'),
        musteriAdi: order.musteriAdi,
        musteriTelefon: order.musteriTelefon,
        musteriAdresi: order.musteriAdresi,
        urunler: order.sepet,
        toplam: order.toplam,
        durum: 'Yeni Sipariş'
    };

    siparisler.push(yeniSiparis);
    localStorage.setItem('siparisler', JSON.stringify(siparisler));

    // WhatsApp Mesajı Oluştur
    const urunlerText = order.sepet.map(u => `${u.adi} x${u.miktar}`).join('%0A');
    const mesaj = `Merhaba NES PARFUM!%0A%0ASipariş No: ${siparisNo}%0AAdı: ${order.musteriAdi}%0AAdres: ${order.musteriAdresi}%0A%0AÜrünler:%0A${urunlerText}%0A%0AToplam: ${order.toplam} ₺%0A%0ALütfen onaylayınız.`;
    const whatsappLink = `https://wa.me/905012074171?text=${mesaj}`;

    // Sepeti Temizle
    sepet = [];
    localStorage.setItem('sepet', JSON.stringify(sepet));
    sepetGuncelle();

    // Formu Temizle
    document.getElementById('musteriAdi').value = '';
    document.getElementById('musteriTelefon').value = '';
    document.getElementById('musteriAdresi').value = '';

    // Modal Kapat
    closeModal();

    // Başarı Mesajı ve WhatsApp Yönlendir
    alert(`✅ Sipariş Başarılı!\n\nSipariş No: ${siparisNo}\n\nWhatsApp'e yönlendiriliyorsunuz...`);
    window.open(whatsappLink, '_blank');
}