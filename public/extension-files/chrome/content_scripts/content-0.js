(()=>{"use strict";var e={},t={};function o(n){var r=t[n];if(void 0!==r)return r.exports;var i=t[n]={exports:{}};return e[n](i,i.exports,o),i.exports}o.rv=()=>"1.4.11",o.ruid="bundler=rspack@1.4.11",window.CrossBrowserStorage=new class{constructor(){this.storageKey="tum_listem_user_id",this.isExtension="undefined"!=typeof chrome&&chrome.runtime&&chrome.runtime.id,this.browserType=this.detectBrowser()}detectBrowser(){if("undefined"!=typeof chrome&&chrome.runtime)return chrome.runtime.getManifest&&chrome.runtime.getManifest().browser_specific_settings?"firefox":"chrome";return"unknown"}getStorageAPI(){return"firefox"===this.browserType?{set:e=>browser.storage.local.set(e),get:e=>browser.storage.local.get(e),remove:e=>browser.storage.local.remove(e),clear:()=>browser.storage.local.clear()}:{set:e=>chrome.storage.local.set(e),get:e=>chrome.storage.local.get(e),remove:e=>chrome.storage.local.remove(e),clear:()=>chrome.storage.local.clear()}}async setUserId(e){try{if(this.isExtension){let t=this.getStorageAPI();await t.set({[this.storageKey]:e}),console.log(`\u{2705} [${this.browserType.toUpperCase()}] UUID kaydedildi:`,e),this.notifyWebSite(e)}else"undefined"!=typeof chrome&&chrome.runtime&&chrome.runtime.id||(localStorage.setItem(this.storageKey,e),console.log("✅ [Web Site] UUID localStorage'a yazıldı (extension yok):",e));return!0}catch(e){return console.error(`\u{274C} [${this.browserType.toUpperCase()}] UUID yazma hatas\u{131}:`,e),!1}}async getUserId(){try{if(!this.isExtension)return await this.requestFromExtension();{let e=this.getStorageAPI(),t=(await e.get([this.storageKey]))[this.storageKey];return console.log(`\u{2705} [${this.browserType.toUpperCase()}] UUID okundu:`,t),t}}catch(e){return console.error(`\u{274C} [${this.browserType.toUpperCase()}] UUID okuma hatas\u{131}:`,e),null}}async requestFromExtension(){try{return console.log("\uD83D\uDD04 [Web Site] Extension'dan UUID isteniyor..."),await new Promise((e,t)=>{("undefined"!=typeof browser?browser.runtime:chrome.runtime).sendMessage({action:"getUserId"},o=>{let n="undefined"!=typeof browser?browser.runtime.lastError:chrome.runtime.lastError;if(n){console.log("❌ [Web Site] Extension mesaj hatası:",n),t(Error("Extension bulunamadı"));return}o&&o.userId?(console.log("✅ [Web Site] Extension'dan UUID alındı:",o.userId),e(o.userId)):(console.log("❌ [Web Site] UUID bulunamadı"),t(Error("UUID bulunamadı")))})})}catch(t){console.log("❌ [Web Site] Extension'dan UUID alma hatası:",t);let e=localStorage.getItem(this.storageKey);if(e)return console.log("\uD83D\uDD04 [Web Site] Fallback: localStorage'dan UUID okundu:",e),e;return null}}notifyWebSite(e){try{window.dispatchEvent(new CustomEvent("extensionUserIdSet",{detail:{userId:e,browser:this.browserType}})),console.log(`\u{2705} [${this.browserType.toUpperCase()}] Web sitesine event g\xf6nderildi:`,e)}catch(e){console.error(`\u{274C} [${this.browserType.toUpperCase()}] Event g\xf6nderme hatas\u{131}:`,e)}}async deleteUserId(){try{if(this.isExtension){let e=this.getStorageAPI();await e.remove([this.storageKey]),console.log(`\u{2705} [${this.browserType.toUpperCase()}] UUID silindi`)}else localStorage.removeItem(this.storageKey),console.log("✅ [Web Site] UUID localStorage'dan silindi");return!0}catch(e){return console.error(`\u{274C} [${this.browserType.toUpperCase()}] UUID silme hatas\u{131}:`,e),!1}}async debugStorage(){try{if(this.isExtension){let e=this.getStorageAPI(),t=await e.get(null);return console.log(`\u{1F4CA} [${this.browserType.toUpperCase()}] T\xfcm storage:`,t),t}{let e={};for(let t=0;t<localStorage.length;t++){let o=localStorage.key(t);e[o]=localStorage.getItem(o)}return console.log("\uD83D\uDCCA [Web Site] localStorage:",e),e}}catch(e){return console.error(`\u{274C} [${this.browserType.toUpperCase()}] Storage Debug Hatas\u{131}:`,e),{}}}getBrowserInfo(){return{type:this.browserType,isExtension:this.isExtension,storageKey:this.storageKey}}},"undefined"!=typeof chrome&&chrome.runtime&&chrome.runtime.id&&("undefined"!=typeof browser?browser.runtime:chrome.runtime).onMessage.addListener((e,t,o)=>"getUserId"===e.action?(window.CrossBrowserStorage.getUserId().then(e=>{o({userId:e})}),!0):"getBrowserInfo"===e.action?(o(window.CrossBrowserStorage.getBrowserInfo()),!1):void 0),console.log("\uD83D\uDE80 Cross-Browser Storage Helper y\xfcklendi:",window.CrossBrowserStorage.getBrowserInfo()),(()=>{async function e(t,o,n=null){return new Promise((e,r)=>{chrome.runtime.sendMessage({action:"apiRequest",method:t,endpoint:o,data:n},t=>{if(chrome.runtime.lastError)return void r(Error(chrome.runtime.lastError.message));t&&t.success?e(t.data):r(Error(t?.error||"API isteği başarısız"))})})}async function t(){try{let e=await new Promise((e,t)=>{chrome.runtime.sendMessage({action:"getActiveUUID"},o=>{if(chrome.runtime.lastError)return void t(Error("Extension bulunamadı"));o&&o.uuid?e(o):t(Error("UUID bulunamadı"))})});o(e)}catch(e){}}function o(e){try{window.dispatchEvent(new CustomEvent("extensionActiveUUIDSet",{detail:{uuid:e.uuid,type:e.type}})),window.EXTENSION_ACTIVE_UUID=e.uuid,window.EXTENSION_UUID_TYPE=e.type,window.EXTENSION_UUID_TIMESTAMP=Date.now()}catch(e){}}async function n(e,t="guest"){try{console.log("\uD83D\uDCE4 [Content Script] UUID extension'a g\xf6nderiliyor:",{uuid:e,type:t});let o="permanent"===t?"setPermanentUUID":"setGuestUUID";return await new Promise((n,r)=>{chrome.runtime.sendMessage({action:o,uuid:e},o=>{if(chrome.runtime.lastError){console.log("❌ [Content Script] Extension mesaj hatası:",chrome.runtime.lastError),r(Error("Extension bulunamadı"));return}o&&o.success?(console.log("✅ [Content Script] UUID extension'a g\xf6nderildi:",{uuid:e,type:t}),n(!0)):r(Error("UUID kaydedilemedi"))})})}catch(e){return!1}}window.CrossBrowserStorage=new class{constructor(){this.storageKey="tum_listem_user_id",this.isExtension="undefined"!=typeof chrome&&chrome.runtime&&chrome.runtime.id,this.browserType=this.detectBrowser()}detectBrowser(){if("undefined"!=typeof chrome&&chrome.runtime)return chrome.runtime.getManifest&&chrome.runtime.getManifest().browser_specific_settings?"firefox":"chrome";return"unknown"}getStorageAPI(){return"firefox"===this.browserType?{set:e=>browser.storage.local.set(e),get:e=>browser.storage.local.get(e),remove:e=>browser.storage.local.remove(e),clear:()=>browser.storage.local.clear()}:{set:e=>chrome.storage.local.set(e),get:e=>chrome.storage.local.get(e),remove:e=>chrome.storage.local.remove(e),clear:()=>chrome.storage.local.clear()}}async setUserId(e){try{if(this.isExtension){let t=this.getStorageAPI();await t.set({[this.storageKey]:e}),console.log(`\u{2705} [${this.browserType.toUpperCase()}] UUID kaydedildi:`,e),this.notifyWebSite(e)}else"undefined"!=typeof chrome&&chrome.runtime&&chrome.runtime.id||(localStorage.setItem(this.storageKey,e),console.log("✅ [Web Site] UUID localStorage'a yazıldı (extension yok):",e));return!0}catch(e){return console.error(`\u{274C} [${this.browserType.toUpperCase()}] UUID yazma hatas\u{131}:`,e),!1}}async getUserId(){try{if(!this.isExtension)return await this.requestFromExtension();{let e=this.getStorageAPI(),t=(await e.get([this.storageKey]))[this.storageKey];return console.log(`\u{2705} [${this.browserType.toUpperCase()}] UUID okundu:`,t),t}}catch(e){return console.error(`\u{274C} [${this.browserType.toUpperCase()}] UUID okuma hatas\u{131}:`,e),null}}async requestFromExtension(){try{return console.log("\uD83D\uDD04 [Web Site] Extension'dan UUID isteniyor..."),await new Promise((e,t)=>{("undefined"!=typeof browser?browser.runtime:chrome.runtime).sendMessage({action:"getUserId"},o=>{let n="undefined"!=typeof browser?browser.runtime.lastError:chrome.runtime.lastError;if(n){console.log("❌ [Web Site] Extension mesaj hatası:",n),t(Error("Extension bulunamadı"));return}o&&o.userId?(console.log("✅ [Web Site] Extension'dan UUID alındı:",o.userId),e(o.userId)):(console.log("❌ [Web Site] UUID bulunamadı"),t(Error("UUID bulunamadı")))})})}catch(t){console.log("❌ [Web Site] Extension'dan UUID alma hatası:",t);let e=localStorage.getItem(this.storageKey);if(e)return console.log("\uD83D\uDD04 [Web Site] Fallback: localStorage'dan UUID okundu:",e),e;return null}}notifyWebSite(e){try{window.dispatchEvent(new CustomEvent("extensionUserIdSet",{detail:{userId:e,browser:this.browserType}})),console.log(`\u{2705} [${this.browserType.toUpperCase()}] Web sitesine event g\xf6nderildi:`,e)}catch(e){console.error(`\u{274C} [${this.browserType.toUpperCase()}] Event g\xf6nderme hatas\u{131}:`,e)}}async deleteUserId(){try{if(this.isExtension){let e=this.getStorageAPI();await e.remove([this.storageKey]),console.log(`\u{2705} [${this.browserType.toUpperCase()}] UUID silindi`)}else localStorage.removeItem(this.storageKey),console.log("✅ [Web Site] UUID localStorage'dan silindi");return!0}catch(e){return console.error(`\u{274C} [${this.browserType.toUpperCase()}] UUID silme hatas\u{131}:`,e),!1}}async debugStorage(){try{if(this.isExtension){let e=this.getStorageAPI(),t=await e.get(null);return console.log(`\u{1F4CA} [${this.browserType.toUpperCase()}] T\xfcm storage:`,t),t}{let e={};for(let t=0;t<localStorage.length;t++){let o=localStorage.key(t);e[o]=localStorage.getItem(o)}return console.log("\uD83D\uDCCA [Web Site] localStorage:",e),e}}catch(e){return console.error(`\u{274C} [${this.browserType.toUpperCase()}] Storage Debug Hatas\u{131}:`,e),{}}}getBrowserInfo(){return{type:this.browserType,isExtension:this.isExtension,storageKey:this.storageKey}}},"undefined"!=typeof chrome&&chrome.runtime&&chrome.runtime.id&&("undefined"!=typeof browser?browser.runtime:chrome.runtime).onMessage.addListener((e,t,o)=>"getUserId"===e.action?(window.CrossBrowserStorage.getUserId().then(e=>{o({userId:e})}),!0):"getBrowserInfo"===e.action?(o(window.CrossBrowserStorage.getBrowserInfo()),!1):void 0),console.log("\uD83D\uDE80 Cross-Browser Storage Helper y\xfcklendi:",window.CrossBrowserStorage.getBrowserInfo());let r=!1,i=null;async function s(t){try{if(r)return console.log("⏳ [Content Script] Kayıt işlemi devam ediyor, \xfcr\xfcn bekletiliyor...","isRegistrationInProgress:",r),i=t,l("Kayıt işlemi tamamlandıktan sonra \xfcr\xfcn eklenecek!"),!0;let o=await new Promise((e,t)=>{chrome.runtime.sendMessage({action:"getActiveUUID"},o=>{if(chrome.runtime.lastError){console.log("❌ [Content Script] Extension mesaj hatası:",chrome.runtime.lastError),t(Error("Extension bulunamadı"));return}o&&o.uuid?e(o):t(Error("UUID bulunamadı"))})});if("guest"===o.type){if(console.log("\uD83D\uDC64 [Content Script] Guest kullanıcı, uyarı popup'ı a\xe7ılıyor..."),i=t,console.log("\uD83D\uDCE6 [Content Script] \xdcr\xfcn bekletiliyor:",i),!await new Promise(t=>{let o=document.createElement("div");o.style.cssText=`
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  z-index: 999999;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                `;let s=document.createElement("div");s.style.cssText=`
                  background: white;
                  border-radius: 12px;
                  padding: 24px;
                  max-width: 400px;
                  margin: 20px;
                  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                  text-align: center;
                `;let c=document.createElement("div");c.style.cssText=`
                  width: 48px;
                  height: 48px;
                  background: #fef3c7;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin: 0 auto 16px;
                `,c.innerHTML=`
                  <svg width="24" height="24" fill="none" stroke="#d97706" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                `;let u=document.createElement("h3");u.style.cssText=`
                  font-size: 18px;
                  font-weight: 600;
                  color: #1f2937;
                  margin: 0 0 12px;
                `,u.textContent="Misafir Kullanıcı";let p=document.createElement("p");p.style.cssText=`
                  font-size: 14px;
                  color: #6b7280;
                  margin: 0 0 24px;
                  line-height: 1.5;
                `,p.textContent="Hen\xfcz giriş yapmadınız. \xdcr\xfcnleriniz ge\xe7ici olarak saklanacak ve kısıtlı \xf6zellikler mevcut. Kalıcı hesap oluşturmak i\xe7in giriş yapın veya misafir olarak devam edin.";let m=document.createElement("div");m.style.cssText=`
                  display: flex;
                  gap: 12px;
                `;let g=document.createElement("button");g.style.cssText=`
                  flex: 1;
                  background: #2563eb;
                  color: white;
                  border: none;
                  padding: 12px 16px;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background 0.2s;
                `,g.textContent="Giriş Yap",g.onmouseover=()=>g.style.background="#1d4ed8",g.onmouseout=()=>g.style.background="#2563eb",g.onclick=()=>{document.body.removeChild(o),r=!0,console.log("\uD83D\uDD10 [Content Script] Giriş Yap butonuna tıklandı, isRegistrationInProgress = true"),new Promise(t=>{let o=(e=!1)=>{document.body.contains(i)&&document.body.removeChild(i),e||(r=!1,console.log("❌ [Content Script] Popup kapatıldı, isRegistrationInProgress = false")),t(e)},i=document.createElement("div");i.style.cssText=`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;let s=document.createElement("div");s.style.cssText=`
      background: white;
      border-radius: 12px;
      padding: 32px;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      width: 100%;
    `;let l=document.createElement("h3");l.style.cssText=`
      font-size: 20px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 24px;
      text-align: center;
    `,l.textContent="Giriş Yap / Kayıt Ol";let d=document.createElement("form");d.style.cssText=`
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;let c=document.createElement("label");c.style.cssText=`
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 4px;
    `,c.textContent="E-posta";let u=document.createElement("input");u.type="email",u.required=!0,u.style.cssText=`
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
      outline: none;
    `,u.placeholder="ornek@email.com",u.onfocus=()=>u.style.borderColor="#2563eb",u.onblur=()=>u.style.borderColor="#d1d5db";let p=document.createElement("label");p.style.cssText=`
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 4px;
    `,p.textContent="Şifre";let m=document.createElement("input");m.type="password",m.required=!0,m.style.cssText=`
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.2s;
      outline: none;
    `,m.placeholder="Şifrenizi girin",m.onfocus=()=>m.style.borderColor="#2563eb",m.onblur=()=>m.style.borderColor="#d1d5db";let g=document.createElement("div");g.style.cssText=`
      color: #dc2626;
      font-size: 14px;
      text-align: center;
      min-height: 20px;
      display: none;
    `;let y=document.createElement("div");y.style.cssText=`
      display: flex;
      gap: 12px;
      margin-top: 8px;
    `;let h=document.createElement("button");h.type="button",h.style.cssText=`
      flex: 1;
      background: #2563eb;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `,h.textContent="Giriş Yap",h.onmouseover=()=>h.style.background="#1d4ed8",h.onmouseout=()=>h.style.background="#2563eb";let b=document.createElement("button");b.type="button",b.style.cssText=`
      flex: 1;
      background: #059669;
      color: white;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    `,b.textContent="Kayıt Ol",b.onmouseover=()=>b.style.background="#047857",b.onmouseout=()=>b.style.background="#059669";let x=document.createElement("button");x.type="button",x.style.cssText=`
      width: 100%;
      background: #f3f4f6;
      color: #374151;
      border: none;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 12px;
    `,x.textContent="İptal",x.onmouseover=()=>x.style.background="#e5e7eb",x.onmouseout=()=>x.style.background="#f3f4f6",x.onclick=()=>{o(!1)},h.onclick=async()=>{let t=u.value.trim(),i=m.value;if(!t||!i){g.textContent="L\xfctfen email ve şifre girin",g.style.display="block";return}h.textContent="Giriş yapılıyor...",h.disabled=!0,b.disabled=!0,g.style.display="none",r=!0;try{let s=await new Promise(e=>{chrome.storage.local.get(["tum_listem_guest_uuid"],t=>{e(t.tum_listem_guest_uuid)})}),l=await e("POST","login",{email:t,password:i,guest_user_id:s||null});l&&l.uuid?(console.log("✅ [API Response] Login başarılı:",l),await n(l.uuid,"permanent"),console.log("✅ [Content Script] Login başarılı, permanent UUID set edildi:",l.uuid),o(!0),r=!1,await a(l.uuid)):(console.log("❌ [API Response] Login başarısız:",l),g.textContent=l.error||"Giriş başarısız",g.style.display="block",h.textContent="Giriş Yap",h.disabled=!1,b.disabled=!1,r=!1)}catch(e){console.log("❌ [API Error] Login hatası:",e.message),e.message&&e.message.includes("400")?g.textContent="Ge\xe7erli bir email adresi girin":e.message&&e.message.includes("401")?g.textContent="Email veya şifre hatalı":g.textContent="Bağlantı hatası",g.style.display="block",h.textContent="Giriş Yap",h.disabled=!1,b.disabled=!1,r=!1}},b.onclick=async()=>{let t=u.value.trim(),i=m.value;if(!t||!i){g.textContent="L\xfctfen email ve şifre girin",g.style.display="block";return}if(i.length<6){g.textContent="Şifre en az 6 karakter olmalı",g.style.display="block";return}h.disabled=!0,b.textContent="Kayıt yapılıyor...",b.disabled=!0,g.style.display="none";try{let s=await new Promise(e=>{chrome.storage.local.get(["tum_listem_guest_uuid"],t=>{e(t.tum_listem_guest_uuid)})}),l=await e("POST","register",{email:t,password:i,guest_user_id:s||null});if(l&&l.uuid)console.log("✅ [API Response] Register başarılı:",l),await n(l.uuid,"permanent"),console.log("✅ [Content Script] Kayıt başarılı, permanent UUID set edildi:",l.uuid),o(!0),r=!1,await a(l.uuid);else{if(!(l&&l.error&&l.error.includes("409")))return console.log("❌ [API Response] Register başarısız:",l),g.textContent=l.error||"Kayıt başarısız",g.style.display="block",h.disabled=!1,b.textContent="Kayıt Ol",b.disabled=!1,r=!1,!1;console.log("\uD83D\uDD04 [API Response] Kullanıcı zaten var, login deneniyor:",l),console.log("\uD83D\uDD04 [Content Script] Kullanıcı zaten kayıtlı, login deneniyor...");try{let l=await e("POST","login",{email:t,password:i,guest_user_id:s||null});if(!l||!l.uuid)return console.log("❌ [API Response] Auto-login başarısız:",l),g.textContent="Email veya şifre hatalı",g.style.display="block",h.disabled=!1,b.textContent="Kayıt Ol",b.disabled=!1,r=!1,!1;console.log("✅ [API Response] Auto-login başarılı:",l),await n(l.uuid,"permanent"),console.log("✅ [Content Script] Login başarılı, permanent UUID set edildi:",l.uuid),o(!0),r=!1,await a(l.uuid)}catch(e){return console.log("❌ [API Error] Auto-login hatası:",e.message),g.textContent="Email veya şifre hatalı",g.style.display="block",h.disabled=!1,b.textContent="Kayıt Ol",b.disabled=!1,r=!1,!1}}}catch(e){return console.log("❌ [API Error] Register hatası:",e.message),e.message&&e.message.includes("400")?g.textContent="Ge\xe7erli bir email adresi girin":e.message&&e.message.includes("409")?g.textContent="Bu kullanıcı zaten var":e.message&&e.message.includes("401")?g.textContent="Email veya şifre hatalı":g.textContent="Bağlantı hatası",g.style.display="block",h.disabled=!1,b.textContent="Kayıt Ol",b.disabled=!1,r=!1,!1}},d.appendChild(c),d.appendChild(u),d.appendChild(p),d.appendChild(m),d.appendChild(g),y.appendChild(h),y.appendChild(b),d.appendChild(y),d.appendChild(x),s.appendChild(l),s.appendChild(d),i.appendChild(s),document.body.appendChild(i),u.focus(),i.onclick=e=>{e.target===i&&(document.body.removeChild(i),t(!1))}}).then(e=>{t(e)})};let y=document.createElement("button");y.style.cssText=`
                  flex: 1;
                  background: #f3f4f6;
                  color: #374151;
                  border: none;
                  padding: 12px 16px;
                  border-radius: 8px;
                  font-size: 14px;
                  font-weight: 500;
                  cursor: pointer;
                  transition: background 0.2s;
                `,y.textContent="Misafir Olarak Devam Et",y.onmouseover=()=>y.style.background="#e5e7eb",y.onmouseout=()=>y.style.background="#f3f4f6",y.onclick=async()=>{if(document.body.removeChild(o),i){console.log("\uD83D\uDC64 [Content Script] Misafir olarak devam et se\xe7ildi, \xfcr\xfcn ekleniyor...");try{let t=await new Promise((e,t)=>{chrome.runtime.sendMessage({action:"getActiveUUID"},o=>{if(chrome.runtime.lastError)return void t(Error("Extension bulunamadı"));e(o)})});if(t&&t.uuid){let o=await e("POST","add-product",{...i,user_id:t.uuid});if(o&&o.success){console.log("✅ [Content Script] Misafir kullanıcı \xfcr\xfcn\xfc başarıyla eklendi"),l("\xdcr\xfcn Heybeye eklendi!");let e=document.getElementById("tum-listem-ekle-btn");if(e){e.disabled=!0,e.style.background="white !important",e.style.color="#10b981";let t=e.querySelector("span");t&&(t.textContent="\xdcr\xfcn Eklendi",t.style.color="#10b981");let o=e.querySelector("img");o&&(o.src="https://my-heybe.vercel.app/images/check-green.png");let n=document.createElement("div");n.style.cssText=`
                  position: absolute;
                  bottom: 0;
                  left: 0;
                  height: 3px;
                  background: #10b981;
                  width: 0%;
                  transition: width 2s ease-in-out;
                  border-radius: 0 0 8px 8px;
                  z-index: 1;
                `,e.appendChild(n),setTimeout(()=>{n.style.width="100%"},50),setTimeout(()=>{e.disabled=!1,e.style.background="white",e.style.color="#374151",t&&(t.textContent="Heybeye Ekle",t.style.color="#374151");let o=e.querySelector("img");o&&(o.src="https://my-heybe.vercel.app/logo.png"),n&&n.remove()},2e3)}}else d("\xdcr\xfcn eklenirken hata oluştu!")}}catch(e){console.error("❌ [Content Script] Misafir \xfcr\xfcn ekleme hatası:",e),d("\xdcr\xfcn eklenirken hata oluştu!")}i=null}t(!0)};let h=document.createElement("button");h.style.cssText=`
                  width: 100%;
                  background: transparent;
                  color: #6b7280;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  font-size: 13px;
                  cursor: pointer;
                  margin-top: 12px;
                  transition: background 0.2s;
                `,h.textContent="İptal",h.onmouseover=()=>h.style.background="#f9fafb",h.onmouseout=()=>h.style.background="transparent",h.onclick=()=>{document.body.removeChild(o),t(!1)},s.appendChild(c),s.appendChild(u),s.appendChild(p),m.appendChild(g),m.appendChild(y),s.appendChild(m),s.appendChild(h),o.appendChild(s),document.body.appendChild(o),o.onclick=e=>{e.target===o&&(document.body.removeChild(o),t(!1))}}))return console.log("❌ [Content Script] Kullanıcı iptal etti"),i=null,!1;if(console.log("✅ [Content Script] Kullanıcı devam etmeyi se\xe7ti"),r)return console.log("⏳ [Content Script] Kayıt/Giriş işlemi devam ediyor, \xfcr\xfcn bekletiliyor..."),l("İşlem tamamlandıktan sonra \xfcr\xfcn eklenecek!"),!0;return console.log("⏳ [Content Script] Guest kullanıcı i\xe7in \xfcr\xfcn bekletiliyor..."),i=t,!0}try{let n=await e("POST","add-product",{...t,user_id:o.uuid});if(!n||!n.success)return d("\xdcr\xfcn eklenirken hata oluştu!"),!1;{l("\xdcr\xfcn Heybeye eklendi!");let e=document.getElementById("tum-listem-ekle-btn");if(e){e.disabled=!0,e.style.background="white !important",e.style.color="#10b981";let t=e.querySelector("span");t&&(t.textContent="\xdcr\xfcn Eklendi",t.style.color="#10b981");let o=e.querySelector("img");o&&(o.src="https://my-heybe.vercel.app/images/check-green.png");let n=document.createElement("div");n.style.cssText=`
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: #10b981;
            width: 0%;
            transition: width 2s ease-in-out;
            border-radius: 0 0 8px 8px;
            z-index: 1;
          `,e.appendChild(n),setTimeout(()=>{n.style.width="100%"},50),setTimeout(()=>{e.disabled=!1,e.style.background="white",e.style.color="#374151",t&&(t.textContent="Heybeye Ekle",t.style.color="#374151");let o=e.querySelector("img");o&&(o.src="https://my-heybe.vercel.app/logo.png"),n&&n.remove()},2e3)}return!0}}catch(e){return d("\xdcr\xfcn eklenirken hata oluştu!"),!1}}catch(e){return d("\xdcr\xfcn eklenirken hata oluştu!"),!1}}async function a(t){if(console.log("\uD83D\uDD0D [Content Script] addPendingProductWithUUID \xe7ağrıldı, pendingProductInfo:",i,"UUID:",t),i){console.log("\uD83D\uDD04 [Content Script] Bekleyen \xfcr\xfcn belirli UUID ile ekleniyor:",i,"UUID:",t);let o=i;i=null;try{let n=await e("POST","add-product",{...o,user_id:t});if(n&&n.success){console.log("✅ [Content Script] Bekleyen \xfcr\xfcn başarıyla eklendi:",n),l("\xdcr\xfcn Heybeye eklendi!");let e=document.getElementById("tum-listem-ekle-btn");if(e){e.disabled=!0,e.style.background="white !important",e.style.color="#10b981";let t=e.querySelector("span");t&&(t.textContent="\xdcr\xfcn Eklendi",t.style.color="#10b981");let o=e.querySelector("img");o&&(o.src="https://my-heybe.vercel.app/images/check-green.png");let n=document.createElement("div");n.style.cssText=`
            position: absolute;
            bottom: 0;
            left: 0;
            height: 3px;
            background: #10b981;
            width: 0%;
            transition: width 2s ease-in-out;
            border-radius: 0 0 8px 8px;
            z-index: 1;
          `,e.appendChild(n),setTimeout(()=>{n.style.width="100%"},50),setTimeout(()=>{e.disabled=!1,e.style.background="white",e.style.color="#374151",t&&(t.textContent="Heybeye Ekle",t.style.color="#374151");let o=e.querySelector("img");o&&(o.src="https://my-heybe.vercel.app/logo.png"),n&&n.remove()},2e3)}}else d("\xdcr\xfcn eklenirken hata oluştu!")}catch(e){console.error("❌ [Content Script] Bekleyen \xfcr\xfcn ekleme exception:",e),d("\xdcr\xfcn eklenirken hata oluştu!")}}else console.log("❌ [Content Script] Bekleyen \xfcr\xfcn bulunamadı, pendingProductInfo boş")}function l(e){let t=document.createElement("div");t.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10b981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `,t.textContent=e;let o=document.createElement("style");o.textContent=`
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,document.head.appendChild(o),document.body.appendChild(t),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},3e3)}function d(e){let t=document.createElement("div");t.style.cssText=`
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ef4444;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.3s ease-out;
  `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},3e3)}function c(){if(document.getElementById("tum-listem-ekle-btn"))return;let e="/"===window.location.pathname||"/home"===window.location.pathname||"/anasayfa"===window.location.pathname||document.title.toLowerCase().includes("ana sayfa")||document.title.toLowerCase().includes("homepage"),t="my-heybe.vercel.app"===window.location.hostname||"localhost"===window.location.hostname||window.location.hostname.includes("vercel.app");if(e||t||!Array.from(document.querySelectorAll("button, a, input[type='button'], div[role='button']")).some(e=>{let t=(e.innerText||e.value||"").toLowerCase();return t.includes("sepete ekle")||t.includes("add to cart")||t.includes("buy")||t.includes("satın al")}))return;let o=document.createElement("div");o.id="tum-listem-buttons",o.style.cssText=`
    position: fixed;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    z-index: 99999;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    border-radius: 24px 0 0 24px;
    overflow: visible;
    margin-right: -280px;
    transition: margin-right 0.3s cubic-bezier(.4,0,.2,1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;let n=document.createElement("button");n.id="tum-listem-ekle-btn",n.innerHTML=`
    <div style="display: flex; align-items: center; gap: 8px;">
      <img src="https://my-heybe.vercel.app/logo.png" width="20" height="20" style="object-fit: contain;">
      <span>Heybeye Ekle</span>
    </div>
  `,n.style.cssText=`
    background: white;
    color: #374151;
    padding: 0 24px 0 12px;
    border: none;
    font-size: 16px;
    cursor: pointer;
    height: 48px;
    width: 200px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    transition: all 0.3s ease;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-radius: 8px;
    position: relative;
  `;let r=document.createElement("button");r.id="tum-listem-gor-btn",r.innerHTML=`
    <div style="display: flex; align-items: center; gap: 6px;">
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <span>Listeyi G\xf6r</span>
    </div>
  `,r.style.cssText=`
    background: #f59e0b;
    color: white;
    padding: 0 16px 0 8px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    height: 48px;
    width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
    white-space: nowrap;
  `,o.addEventListener("mouseenter",()=>{o.style.marginRight="0px"}),o.addEventListener("mouseleave",()=>{o.style.marginRight="-280px"}),n.addEventListener("click",async()=>{try{n.disabled=!0,n.querySelector("span").textContent="Ekleniyor...";let e=function(){try{let e={};document.querySelectorAll("meta").forEach(t=>{let o=t.getAttribute("name")||t.getAttribute("property"),n=t.getAttribute("content");o&&n&&(e[o.toLowerCase()]=n)});let t=e["og:title"]||e["twitter:title"]||e.title||document.title||"\xdcr\xfcn",o="";for(let e of['[class*="price"]','[class*="fiyat"]','[class*="cost"]','[class*="amount"]',"span","div","p"]){for(let t of document.querySelectorAll(e)){let e=t.textContent.trim();if(e.match(/[\d.,]+\s*(₺|TL|\$|€)/)||e.match(/(₺|TL|\$|€)\s*[\d.,]+/)){o=e.replace(/[^\d.,]/g,"").trim();break}}if(o)break}let n=e["og:image"]||e["twitter:image"]||e.image||"";if(!n)for(let e of document.querySelectorAll("img")){let t=e.src||e.getAttribute("data-src");if(t&&t.length>100&&!t.includes("logo")&&!t.includes("icon")){n=t;break}}return{name:t,price:o,image_url:n,url:window.location.href,site:window.location.hostname}}catch(e){return{name:"\xdcr\xfcn",price:"",image_url:"",url:window.location.href,site:window.location.hostname}}}();if(await s(e)){n.disabled=!0,n.style.background="white !important",n.style.color="#10b981";let e=n.querySelector("span");e&&(e.textContent="\xdcr\xfcn Eklendi");let t=n.querySelector("svg");t&&(t.innerHTML=`
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          `)}else n.disabled=!1,n.querySelector("span").textContent="Heybeye Ekle"}catch(e){d("\xdcr\xfcn eklenirken hata oluştu!"),n.disabled=!1,n.querySelector("span").textContent="Heybeye Ekle"}}),r.addEventListener("click",()=>{window.open("https://my-heybe.vercel.app","_blank")}),o.appendChild(n),o.appendChild(r),document.body.appendChild(o),console.log("✅ [Content Script] 'T\xfcm Listeme Ekle' ve 'Listeyi G\xf6r' butonları eklendi")}window.addEventListener("message",e=>{e.source===window&&("SET_GUEST_UUID"===e.data.type&&(console.log("\uD83D\uDCE8 [Content Script] Web sitesinden Guest UUID mesajı alındı:",e.data.uuid),n(e.data.uuid,"guest")),"SET_PERMANENT_UUID"===e.data.type&&(console.log("\uD83D\uDCE8 [Content Script] Web sitesinden Permanent UUID mesajı alındı:",e.data.uuid),n(e.data.uuid,"permanent")),"GET_ACTIVE_UUID"===e.data.type&&t(),"ADD_PRODUCT"===e.data.type&&(console.log("\uD83D\uDCE8 [Content Script] Web sitesinden \xfcr\xfcn ekleme isteği alındı:",e.data.product),s(e.data.product)),"SEND_PERMANENT_UUID"===e.data.type&&"web-site"===e.data.source&&(console.log("\uD83D\uDCE8 [Content Script] Web sitesinden permanent UUID alındı:",e.data.uuid),n(e.data.uuid,"permanent")))}),chrome.runtime.onMessage.addListener((e,t,n)=>{"guestUUIDChanged"===e.action&&(console.log("\uD83D\uDCE8 [Content Script] Background'dan Guest UUID değişikliği:",e.uuid),o({uuid:e.uuid,type:"guest"})),"permanentUUIDChanged"===e.action&&(console.log("\uD83D\uDCE8 [Content Script] Background'dan Permanent UUID değişikliği:",e.uuid),o({uuid:e.uuid,type:"permanent"})),"loginStatusChanged"===e.action&&(console.log("\uD83D\uDCE8 [Content Script] Background'dan login status değişikliği:",e.isLoggedIn),window.dispatchEvent(new CustomEvent("extensionLoginStatusChanged",{detail:{isLoggedIn:e.isLoggedIn}})))}),"loading"===document.readyState?document.addEventListener("DOMContentLoaded",()=>{console.log("\uD83D\uDE80 [Content Script] Sayfa y\xfcklendi, aktif UUID g\xf6nderiliyor..."),setTimeout(()=>{t(),c()},1e3)}):(console.log("\uD83D\uDE80 [Content Script] Sayfa zaten y\xfckl\xfc, aktif UUID g\xf6nderiliyor..."),setTimeout(()=>{t(),c()},1e3)),window.postMessage({type:"EXTENSION_READY",data:{hasExtension:!0,extensionId:chrome.runtime.id}},"*")})()})();
//# sourceMappingURL=content-0.js.map