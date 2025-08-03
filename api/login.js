// Login API endpoint
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir email adresi girin' });
    }

    // Mock user database - gerçek implementasyonda veritabanından kontrol edilecek
    const mockUsers = [
      {
        email: "test@example.com",
        password: "123456", // Gerçek implementasyonda hash'lenmiş olacak
        uuid: "test@example.com", // Email'i UUID olarak kullan
        name: "Test Kullanıcı",
        role: "user"
      },
      {
        email: "admin@example.com", 
        password: "admin123",
        uuid: "admin@example.com", // Email'i UUID olarak kullan
        name: "Admin Kullanıcı",
        role: "admin"
      }
    ];

    // Kullanıcıyı bul
    const user = mockUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    // Başarılı giriş - permanent UUID'yi döndür
    res.status(200).json({
      success: true,
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.email === 'admin@example.com' ? 'admin' : 'user', // Admin kontrolü
      message: 'Giriş başarılı'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
} 