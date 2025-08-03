// Registration API endpoint
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    // Name is optional now
    const userName = name || email.split('@')[0]; // Use email prefix if no name provided

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi girin' });
    }

    // Password validation (minimum 6 karakter)
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı' });
    }

    // Mock user database - gerçek implementasyonda veritabanına yazılacak
    const mockUsers = [
      {
        email: "test@example.com",
        password: "123456", // Gerçek implementasyonda hash'lenmiş olacak
        name: "Test Kullanıcı",
        uuid: "test@example.com", // Email'i UUID olarak kullan
        role: "user"
      },
      {
        email: "admin@example.com", 
        password: "admin123",
        name: "Admin Kullanıcı",
        uuid: "admin@example.com",
        role: "admin"
      }
    ];

    // Email zaten kayıtlı mı kontrol et
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ error: 'Bu email adresi zaten kayıtlı' });
    }

    // Yeni kullanıcı oluştur
    const newUser = {
      email: email,
      password: password, // Gerçek implementasyonda hash'lenecek
      name: userName,
      uuid: email // Email'i permanent UUID olarak kullan
    };

    // Mock database'e ekle (gerçek implementasyonda veritabanına yazılacak)
    mockUsers.push(newUser);

    // Başarılı kayıt - permanent UUID'yi döndür
    res.status(201).json({
      success: true,
      uuid: newUser.uuid, // Email'i UUID olarak döndür
      name: newUser.name,
      email: newUser.email,
      role: 'user', // Default role
      message: 'Kayıt başarılı'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
} 