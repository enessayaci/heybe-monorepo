// API endpoint to get permanent UUID from web site storage
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Bu endpoint sadece web sitesinden çağrılabilir
    // Extension'dan gelen istekleri kabul et
    const origin = req.headers.origin;
    const userAgent = req.headers['user-agent'];
    
    // Extension'dan gelen istekleri kontrol et
    const isFromExtension = userAgent && (
      userAgent.includes('chrome-extension') || 
      userAgent.includes('moz-extension') ||
      req.headers['x-extension-request'] === 'true'
    );

    if (!isFromExtension) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Web sitesinde permanent UUID var mı kontrol et
    // Bu bilgiyi localStorage'dan veya session'dan alabiliriz
    // Şimdilik mock data döndürelim
    
    // Gerçek implementasyonda:
    // 1. Web sitesinde giriş yapmış kullanıcının UUID'sini al
    // 2. Bu UUID'yi extension'a gönder
    
    // Mock response - gerçek implementasyonda değiştirilecek
    const mockPermanentUUID = "permanent-user-uuid-12345";
    
    res.status(200).json({
      uuid: mockPermanentUUID,
      type: 'permanent',
      message: 'Permanent UUID retrieved successfully'
    });

  } catch (error) {
    console.error('Error getting permanent UUID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 