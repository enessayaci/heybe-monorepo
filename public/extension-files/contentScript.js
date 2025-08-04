let isRegistrationInProgress = false;
let pendingProduct = null;

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function createButton() {
  const button = document.createElement('button');
  button.innerHTML = `
    <img src="https://my-heybe.vercel.app/logo.png" alt="Heybe" style="width: 16px; height: 16px; margin-right: 4px;">
    Heybeye Ekle
  `;
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.background = '#2563eb';
    button.style.transform = 'translateY(-1px)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = '#3b82f6';
    button.style.transform = 'translateY(0)';
  });
  
  return button;
}

function createLoginButton() {
  const button = document.createElement('button');
  button.innerHTML = 'Listeyi Gör';
  button.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    z-index: 10000;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.background = '#059669';
    button.style.transform = 'translateY(-1px)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.background = '#10b981';
    button.style.transform = 'translateY(0)';
  });
  
  button.onclick = () => {
    window.open('https://my-heybe.vercel.app', '_blank');
  };
  
  return button;
}

function extractProductInfo() {
  const title = document.title || '';
  const url = window.location.href;
  
  let productName = '';
  let productPrice = '';
  let productImage = '';
  
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach(tag => {
    const property = tag.getAttribute('property') || tag.getAttribute('name');
    const content = tag.getAttribute('content');
    
    if (property && content) {
      if (property.includes('title') || property.includes('og:title')) {
        productName = content;
      } else if (property.includes('price') || property.includes('og:price')) {
        productPrice = content;
      } else if (property.includes('image') || property.includes('og:image')) {
        productImage = content;
      }
    }
  });
  
  if (!productName) {
    productName = title;
  }
  
  return {
    name: productName,
    price: productPrice,
    image: productImage,
    url: url
  };
}

async function addToCart(productInfo) {
  try {
    const { guestUUID } = await chrome.storage.local.get(['guestUUID']);
    
    const response = await chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      method: 'POST',
      url: 'https://my-heybe.vercel.app/api/add-product',
      data: {
        name: productInfo.name,
        price: productInfo.price,
        image: productInfo.image,
        url: productInfo.url,
        user_id: guestUUID
      }
    });
    
    if (response.success) {
      return { success: true, data: response.data };
    } else {
      return { success: false, error: response.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function registerUser(email, password) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      method: 'POST',
      url: 'https://my-heybe.vercel.app/api/register',
      data: { email, password }
    });
    
    if (response.success) {
      const { guestUUID } = await chrome.storage.local.get(['guestUUID']);
      
      const permanentUUIDResponse = await chrome.runtime.sendMessage({
        type: 'API_REQUEST',
        method: 'POST',
        url: 'https://my-heybe.vercel.app/api/get-permanent-uuid',
        data: { email }
      });
      
      if (permanentUUIDResponse.success) {
        const permanentUUID = permanentUUIDResponse.data.uuid;
        
        if (pendingProduct) {
          const addProductResponse = await chrome.runtime.sendMessage({
            type: 'API_REQUEST',
            method: 'POST',
            url: 'https://my-heybe.vercel.app/api/add-product',
            data: {
              ...pendingProduct,
              user_id: permanentUUID
            }
          });
          
          if (addProductResponse.success) {
            await chrome.storage.local.set({ 
              permanentUUID: permanentUUID,
              isRegistrationInProgress: false,
              pendingProduct: null
            });
            
            return { success: true, data: addProductResponse.data };
          }
        }
      }
    }
    
    return { success: false, error: 'Registration failed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function loginUser(email, password) {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'API_REQUEST',
      method: 'POST',
      url: 'https://my-heybe.vercel.app/api/login',
      data: { email, password }
    });
    
    if (response.success) {
      const permanentUUIDResponse = await chrome.runtime.sendMessage({
        type: 'API_REQUEST',
        method: 'POST',
        url: 'https://my-heybe.vercel.app/api/get-permanent-uuid',
        data: { email }
      });
      
      if (permanentUUIDResponse.success) {
        const permanentUUID = permanentUUIDResponse.data.uuid;
        
        if (pendingProduct) {
          const addProductResponse = await chrome.runtime.sendMessage({
            type: 'API_REQUEST',
            method: 'POST',
            url: 'https://my-heybe.vercel.app/api/add-product',
            data: {
              ...pendingProduct,
              user_id: permanentUUID
            }
          });
          
          if (addProductResponse.success) {
            await chrome.storage.local.set({ 
              permanentUUID: permanentUUID,
              isRegistrationInProgress: false,
              pendingProduct: null
            });
            
            return { success: true, data: addProductResponse.data };
          }
        }
      }
    }
    
    return { success: false, error: 'Login failed' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function showLoginModal() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10001;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 320px;
    max-width: 90vw;
  `;
  
  modalContent.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Giriş Yap veya Kayıt Ol</h3>
    <input type="email" id="email" placeholder="E-posta" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #d1d5db; border-radius: 4px;">
    <input type="password" id="password" placeholder="Şifre" style="width: 100%; padding: 8px; margin-bottom: 16px; border: 1px solid #d1d5db; border-radius: 4px;">
    <div style="display: flex; gap: 8px;">
      <button id="loginBtn" style="flex: 1; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Giriş Yap</button>
      <button id="registerBtn" style="flex: 1; padding: 8px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer;">Kayıt Ol</button>
    </div>
    <button id="closeBtn" style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 18px; cursor: pointer;">×</button>
  `;
  
  modalContent.style.position = 'relative';
  
  const emailInput = modalContent.querySelector('#email');
  const passwordInput = modalContent.querySelector('#password');
  const loginBtn = modalContent.querySelector('#loginBtn');
  const registerBtn = modalContent.querySelector('#registerBtn');
  const closeBtn = modalContent.querySelector('#closeBtn');
  
  loginBtn.onclick = async () => {
    isRegistrationInProgress = true;
    const result = await loginUser(emailInput.value, passwordInput.value);
    if (result.success) {
      modal.remove();
      alert('Ürün başarıyla eklendi!');
    } else {
      alert('Giriş başarısız: ' + result.error);
    }
  };
  
  registerBtn.onclick = async () => {
    isRegistrationInProgress = true;
    const result = await registerUser(emailInput.value, passwordInput.value);
    if (result.success) {
      modal.remove();
      alert('Ürün başarıyla eklendi!');
    } else {
      alert('Kayıt başarısız: ' + result.error);
    }
  };
  
  closeBtn.onclick = () => {
    modal.remove();
  };
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
}

function init() {
  const addButton = createButton();
  const loginButton = createLoginButton();
  
  document.body.appendChild(addButton);
  document.body.appendChild(loginButton);
  
  // Website'e aktif UUID'yi gönder
  chrome.storage.local.get(['guestUUID', 'permanentUUID'], (result) => {
    const activeUUID = result.permanentUUID || result.guestUUID;
    if (activeUUID) {
      console.log("📨 [Content Script] Sayfa zaten yüklü, aktif UUID gönderiliyor...");
      
      // Website'e UUID event'ini gönder
      window.dispatchEvent(
        new CustomEvent("extensionActiveUUIDSet", {
          detail: {
            uuid: activeUUID,
            type: result.permanentUUID ? "permanent" : "guest"
          }
        })
      );
    }
  });
  
  addButton.onclick = async () => {
    const productInfo = extractProductInfo();
    
    if (isRegistrationInProgress) {
      pendingProduct = productInfo;
      showLoginModal();
      return;
    }
    
    const result = await addToCart(productInfo);
    
    if (result.success) {
      alert('Ürün başarıyla eklendi!');
    } else {
      if (result.error.includes('User not found')) {
        pendingProduct = productInfo;
        showLoginModal();
      } else {
        alert('Hata: ' + result.error);
      }
    }
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
} 